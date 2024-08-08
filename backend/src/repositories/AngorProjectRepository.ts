import DB from '../database';
import logger from '../logger';
import { AngorTransactionStatus } from '../angor/AngorTransactionDecoder';

export interface Project {
  founder_key: string;
  npub: string;
  id: string;
  created_on_block: number;
  txid: string;
}

interface ProjectWithInvestmentsCount extends Project {
  investments_count: number;
}

/**
 * Angor project repository.
 */
class AngorProjectRepository {
  /**
   * Stores Angor project into the DB.
   * @param id - project Id.
   * @param npub - project Nostr public key.
   * @param addressOnFeeOutput - address on fee output.
   * @param transactionStatus - transaction status.
   */
  public async $setProject(
    id: string,
    npub: string,
    addressOnFeeOutput: string,
    transactionStatus: AngorTransactionStatus,
    founderKey: string,
    txid: string,
    createdOnBlock?: number
  ): Promise<void> {
    try {
      const query = `INSERT INTO angor_projects
          (
            id,
            npub,
            address_on_fee_output,
            creation_transaction_status,
            created_on_block,
            txid,
            founder_key
          )
          VALUES ('${id}', '${npub}', '${addressOnFeeOutput}', '${transactionStatus}', ${createdOnBlock}, '${txid}', '${founderKey}')
          ON DUPLICATE KEY UPDATE
            creation_transaction_status = '${transactionStatus}'
        `;

      await DB.query(query);
    } catch (e: any) {
      logger.err(
        `Cannot save Angor project into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  /**
   * Fetches Angor project by address on fee output.
   * @param addressOnFeeOutput - address on fee output
   * @returns - promise that resolves into Angor project.
   */
  public async $getProjectByAddressOnFeeOutput(
    addressOnFeeOutput: string
  ): Promise<Project | undefined> {
    try {
      const query = `SELECT * FROM angor_projects
          WHERE address_on_fee_output = '${addressOnFeeOutput}'
        `;

      const [rows] = await DB.query(query);

      return rows[0];
    } catch (e: any) {
      logger.err(
        `Cannot save Angor project into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  public async $getProjectWithInvestmentsCount(
    id: string
  ): Promise<ProjectWithInvestmentsCount> {
    try {
      const query = `SELECT
            angor_projects.id,
            angor_projects.founder_key,
            angor_projects.npub,
            angor_projects.created_on_block,
            angor_projects.txid,
            COUNT(angor_investments.txid) AS investments_count
          FROM angor_projects
          LEFT JOIN angor_investments
            ON angor_projects.address_on_fee_output = angor_investments.address_on_fee_output
          WHERE angor_projects.id = '${id}'
        `;

      const [rows] = await DB.query(query);

      return rows[0];
    } catch (e: any) {
      logger.err(
        `Cannot save Angor project into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  public async $getProjects(limit = 10, offset?: number): Promise<Project[]> {
    const maxLimit = 50;

    if (limit > maxLimit) {
      limit = maxLimit;
    }

    const order = offset === undefined ? 'DESC' : 'ASC';

    try {
      const query = `SELECT id, founder_key, npub, created_on_block, txid
          FROM angor_projects
          WHERE creation_transaction_status = '${
            AngorTransactionStatus.Confirmed
          }'
          ORDER BY
                created_on_block ${order}
          LIMIT ${limit}
          ${offset ? `OFFSET ${offset}` : ''}
        `;

      const [rows] = await DB.query(query);

      return rows as Project[];
    } catch (e: any) {
      logger.err(
        `Cannot save Angor project into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  public async $getConfirmedProjectsCount(): Promise<number> {
    try {
      const query = `SELECT COUNT(*) AS count
          FROM angor_projects
          WHERE creation_transaction_status = '${AngorTransactionStatus.Confirmed}'
        `;

      const [rows] = await DB.query(query);
      const count = rows[0].count || 0;

      return count;
    } catch (e: any) {
      logger.err(
        `Cannot save Angor project into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }
}

export default new AngorProjectRepository();
