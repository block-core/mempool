import { Common } from './api/common';
import blocks from './api/blocks';
import mempool from './api/mempool';
import mining from './api/mining/mining';
import logger from './logger';
import bitcoinClient from './api/bitcoin/bitcoin-client';
import priceUpdater from './tasks/price-updater';
import PricesRepository from './repositories/PricesRepository';
import config from './config';
import auditReplicator from './replication/AuditReplication';
import statisticsReplicator from './replication/StatisticsReplication';
import AccelerationRepository from './repositories/AccelerationRepository';
import BlocksRepository from './repositories/BlocksRepository';
import bitcoinApi from './api/bitcoin/bitcoin-api-factory';
import {
  AngorTransactionDecoder,
  AngorSupportedNetworks,
  AngorTransactionStatus,
} from './angor/AngorTransactionDecoder';
import AngorBlocksRepository from "./repositories/AngorBlocksRepository";

export interface CoreIndex {
  name: string;
  synced: boolean;
  best_block_height: number;
}

type TaskName = 'blocksPrices' | 'coinStatsIndex';

class Indexer {
  private runIndexer = true;
  private indexerRunning = false;
  private tasksRunning: { [key in TaskName]?: boolean; } = {};
  private tasksScheduled: { [key in TaskName]?: NodeJS.Timeout; } = {};
  private coreIndexes: CoreIndex[] = [];

  public indexerIsRunning(): boolean {
    return this.indexerRunning;
  }

  /**
   * Check which core index is available for indexing
   */
  public async checkAvailableCoreIndexes(): Promise<void> {
    const updatedCoreIndexes: CoreIndex[] = [];

    const indexes: any = await bitcoinClient.getIndexInfo();
    for (const indexName in indexes) {
      const newState = {
        name: indexName,
        synced: indexes[indexName].synced,
        best_block_height: indexes[indexName].best_block_height,
      };
      logger.info(`Core index '${indexName}' is ${indexes[indexName].synced ? 'synced' : 'not synced'}. Best block height is ${indexes[indexName].best_block_height}`);
      updatedCoreIndexes.push(newState);

      if (indexName === 'coinstatsindex' && newState.synced === true) {
        const previousState = this.isCoreIndexReady('coinstatsindex');
        // if (!previousState || previousState.synced === false) {
          this.runSingleTask('coinStatsIndex');
        // }
      }
    }

    this.coreIndexes = updatedCoreIndexes;
  }

  /**
   * Return the best block height if a core index is available, or 0 if not
   *
   * @param name
   * @returns
   */
  public isCoreIndexReady(name: string): CoreIndex | null {
    for (const index of this.coreIndexes) {
      if (index.name === name && index.synced === true) {
        return index;
      }
    }
    return null;
  }

  public reindex(): void {
    if (Common.indexingEnabled()) {
      this.runIndexer = true;
    }
  }

  /**
   * schedules a single task to run in `timeout` ms
   * only one task of each type may be scheduled
   *
   * @param {TaskName} task - the type of task
   * @param {number} timeout - delay in ms
   * @param {boolean} replace - `true` replaces any already scheduled task (works like a debounce), `false` ignores subsequent requests (works like a throttle)
   */
  public scheduleSingleTask(task: TaskName, timeout: number = 10000, replace = false): void {
    if (this.tasksScheduled[task]) {
      if (!replace) { //throttle
        return;
      } else { // debounce
        clearTimeout(this.tasksScheduled[task]);
      }
    }
    this.tasksScheduled[task] = setTimeout(async () => {
      try {
        await this.runSingleTask(task);
      } catch (e) {
        logger.err(`Unexpected error in scheduled task ${task}: ` + (e instanceof Error ? e.message : e));
      } finally {
        clearTimeout(this.tasksScheduled[task]);
      }
    }, timeout);
  }

  /**
   * Runs a single task immediately
   *
   * (use `scheduleSingleTask` instead to queue a task to run after some timeout)
   */
  public async runSingleTask(task: TaskName): Promise<void> {
    if (!Common.indexingEnabled() || this.tasksRunning[task]) {
      return;
    }
    this.tasksRunning[task] = true;

    switch (task) {
      case 'blocksPrices': {
        if (!['testnet', 'signet'].includes(config.MEMPOOL.NETWORK) && config.FIAT_PRICE.ENABLED) {
          let lastestPriceId;
          try {
            lastestPriceId = await PricesRepository.$getLatestPriceId();
          } catch (e) {
            logger.debug('failed to fetch latest price id from db: ' + (e instanceof Error ? e.message : e));
          }          if (priceUpdater.historyInserted === false || lastestPriceId === null) {
            logger.debug(`Blocks prices indexer is waiting for the price updater to complete`, logger.tags.mining);
            this.scheduleSingleTask(task, 10000);
          } else {
            logger.debug(`Blocks prices indexer will run now`, logger.tags.mining);
            await mining.$indexBlockPrices();
          }
        }
      } break;

      case 'coinStatsIndex': {
        logger.debug(`Indexing coinStatsIndex now`);
        await mining.$indexCoinStatsIndex();
      } break;
    }

    this.tasksRunning[task] = false;
  }

  public async $run(): Promise<void> {
    if (!Common.indexingEnabled() || this.runIndexer === false ||
      this.indexerRunning === true || mempool.hasPriority()
    ) {
      return;
    }

    if (config.FIAT_PRICE.ENABLED) {
      try {
        await priceUpdater.$run();
      } catch (e) {
        logger.err(`Running priceUpdater failed. Reason: ` + (e instanceof Error ? e.message : e));
      }
    }

    // Do not attempt to index anything unless Bitcoin Core is fully synced
    const blockchainInfo = await bitcoinClient.getBlockchainInfo();
    if (blockchainInfo.blocks !== blockchainInfo.headers) {
      return;
    }

    this.runIndexer = false;
    this.indexerRunning = true;

    logger.debug(`Running mining indexer`);

    await this.checkAvailableCoreIndexes();

    try {
      const chainValid = await blocks.$generateBlockDatabase();
      if (chainValid === false) {
        // Chain of block hash was invalid, so we need to reindex. Stop here and continue at the next iteration
        logger.warn(`The chain of block hash is invalid, re-indexing invalid data in 10 seconds.`, logger.tags.mining);
        setTimeout(() => this.reindex(), 10000);
        this.indexerRunning = false;
        return;
      }

      this.runSingleTask('blocksPrices');
      await blocks.$indexCoinbaseAddresses();
      await mining.$indexDifficultyAdjustments();
      await mining.$generateNetworkHashrateHistory();
      await mining.$generatePoolHashrateHistory();
      await blocks.$generateBlocksSummariesDatabase();
      await blocks.$generateCPFPDatabase();
      await blocks.$generateAuditStats();
      await auditReplicator.$sync();
      await statisticsReplicator.$sync();
      await AccelerationRepository.$indexPastAccelerations();
      // do not wait for classify blocks to finish

      // Index transactions related to Angor projects.
      // This operation should be done once when initial indexing is complete.
      await this.indexAngorTransactions();


      blocks.$classifyBlocks();
    } catch (e) {
      this.indexerRunning = false;
      logger.err(`Indexer failed, trying again in 10 seconds. Reason: ` + (e instanceof Error ? e.message : e));
      setTimeout(() => this.reindex(), 10000);
      this.indexerRunning = false;
      return;
    }

    this.indexerRunning = false;

    const runEvery = 1000 * 3600; // 1 hour
    logger.debug(`Indexing completed. Next run planned at ${new Date(new Date().getTime() + runEvery).toUTCString()}`);
    setTimeout(() => this.reindex(), runEvery);
  }

  /**
   * Index transactions related to Angor projects.
   */
  public async indexAngorTransactions(): Promise<void> {
    // All indexed blocks.
    const indexedBlocks = await BlocksRepository.$getIndexedBlocks();
    // Sort indexed blocks by height, the lowest height should be in the beginning.
    // It is necessary to index transactions for project creations before
    // investment transactions.
    const sortedBlocks = indexedBlocks.sort(
      (
        b1: { height: number; hash: string },
        b2: { height: number; hash: string }
      ) => b1.height - b2.height
    );

    for (const indexedBlock of sortedBlocks) {
      const alreadyIndexed = await AngorBlocksRepository.isBlockIndexed(indexedBlock.height, indexedBlock.hash);
      if (alreadyIndexed) {
        logger.debug(`Block ${indexedBlock.height} already indexed, skipping.`);
        continue;
      }
      // Transaction IDs in the block.
      const transactionIds = await bitcoinApi.$getTxIdsForBlock(
        indexedBlock.hash
      );

      for (const transactionId of transactionIds) {
        // Hex of the transaction.
        const transactionHex = await bitcoinApi.$getTransactionHex(
          transactionId
        );

        const angorDecoder = new AngorTransactionDecoder(
          transactionHex,
          AngorSupportedNetworks.Testnet
        );

        // Try to decode and store transaction as Angor project creation transaction.
        try {
            await angorDecoder
              .decodeAndStoreProjectCreationTransaction(
                AngorTransactionStatus.Confirmed,
                indexedBlock.height
              );
        } catch (error) {
          logger.debug(`Error decoding an Angor Project: ${error}. Trying to decode as investment now...`);
          try {
            await angorDecoder
              .decodeAndStoreInvestmentTransaction(
                AngorTransactionStatus.Confirmed,
                indexedBlock.height
              );
          } catch (error) {
            logger.debug(`Error decoding an Angor Investment: ${error}`);
          }
        }
      }
      await AngorBlocksRepository.$markBlockAsIndexed(indexedBlock.height, indexedBlock.hash);
    }

    logger.info('Indexing Angor transactions completed.');
  }
}

export default new Indexer();
