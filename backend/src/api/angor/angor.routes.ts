import { Application, Request, Response } from 'express';
import config from '../../config';
import AngorProjectRepository from '../../repositories/AngorProjectRepository';
import AngorInvestmentRepository from '../../repositories/AngorInvestmentRepository';
import transactionUtils from '../transaction-utils';
import { computeAdvancedStats, computeStatsTally } from './angor-stats';
import bitcoinApi from '../bitcoin/bitcoin-api-factory';
import { IEsploraApi } from "../bitcoin/esplora-api.interface";

interface ProjectsPayloadItem {
  founderKey: string;
  projectIdentifier: string;
  createdOnBlock: number;
  trxId: string;
  nostrEventId: string;
}
interface ProjectPayloadItem {
  founderKey: string;
  projectIdentifier: string;
  createdOnBlock: number;
  trxId: string;
  nostrEventId: string;
  totalInvestmentsCount: number;
}

interface ProjectStatsPayloadItem {
  investorCount: number;
  amountInvested: number;
  amountSpentSoFarByFounder: number;
  amountInPenalties: number;
  countInPenalties: number;
}

interface ProjectInvestmentPayloadItem {
  investorPublicKey: string;
  totalAmount: number;
  transactionId: string;
  hashOfSecret: string;
  isSeeder: boolean;
}

export interface AdvancedProjectStats {
  amountSpentSoFarByFounder: number;
  amountInPenalties: number;
  countInPenalties: number;
}

export interface StatsTally {
  totalAmount: number;
  numberOfTx: number;
}

export interface AngorVout {
  value: number;
  spent: boolean;
  spendingTxId: string | undefined;
  investmentTxId: string;
  isLast: boolean;
  childVouts?: IEsploraApi.Vout[]
}

class AngorRoutes {
  /**
   * Initialise Angor routes
   * @param app - ExpressJS application object.
   */
  public initRoutes(app: Application): void {
    app.get(
      config.MEMPOOL.API_URL_PREFIX + 'query/Angor/projects',
      this.$getProjects.bind(this)
    );
    app.get(
      config.MEMPOOL.API_URL_PREFIX + 'query/Angor/projects/:projectID',
      this.$getProject.bind(this)
    );
    app.get(
      config.MEMPOOL.API_URL_PREFIX + 'query/Angor/projects/:projectID/stats',
      this.$getProjectStats.bind(this)
    );
    app.get(
      config.MEMPOOL.API_URL_PREFIX +
        'query/Angor/projects/:projectID/investments',
      this.$getProjectInvestments.bind(this)
    );
    app.get(
      config.MEMPOOL.API_URL_PREFIX +
        'query/Angor/projects/:projectID/investments/:investorPublicKey',
      this.getProjectInvestment.bind(this)
    );
  }

  /**
   * Provides Angor projects.
   * @param req - request object.
   * @param res - response object.
   * @returns - promise that resolves with void.
   */
  private async $getProjects(req: Request, res: Response): Promise<void> {
    this.configureDefaultHeaders(res);

    // Default limit and offset.
    let limit = 10;
    let offset = 0;

    // Limit and offset query params.
    const { limit: queryLimit, offset: queryOffset } = req.query;

    if (typeof queryLimit === 'string') {
      // Convert query param into number.
      limit = parseInt(queryLimit);

      // Validate limit query param.
      if (Number.isNaN(limit)) {
        this.responseWithValidationError(res, {
          limit: [`The value '${queryLimit}' is not valid.`],
        });

        return;
      } else if (limit < 1 || limit > 50) {
        this.responseWithValidationError(res, {
          limit: ['The field limit must be between 1 and 50.'],
        });

        return;
      }
    }

    if (typeof queryOffset === 'string') {
      // Convert query param into number.
      offset = parseInt(queryOffset);

      // Validate offset query param.
      if (Number.isNaN(offset)) {
        this.responseWithValidationError(res, {
          limit: [`The value '${queryOffset}' is not valid.`],
        });

        return;
      } else if (offset < 0) {
        this.responseWithValidationError(res, {
          offset: [
            'The field offset must be between 0 and 9.223372036854776E+18.',
          ],
        });

        return;
      }
    }

    // Angor projects.
    const projects = await AngorProjectRepository.$getProjects(limit, offset);

    // Adjust DB data to confirm ProjectsPayloadItem interface and sort based ob block height.
    const payload: ProjectsPayloadItem[] = projects
      .map((project) => ({
        founderKey: project.founder_key,
        projectIdentifier: project.id,
        createdOnBlock: project.created_on_block,
        trxId: project.txid,
        nostrEventId: project.nostr_event_id
      }))
      .sort(
        (p1: ProjectsPayloadItem, p2: ProjectsPayloadItem) =>
          p2.createdOnBlock - p1.createdOnBlock
      );

    // Amount of confirmed Angor projects.
    const projectsCount =
      await AngorProjectRepository.$getConfirmedProjectsCount();

    const { path } = req.route;

    this.setPaginationAndLinkHeaders(res, limit, offset, path, projectsCount);

    res.json(payload);
  }

  /**
   * Provides Angor projects.
   * @param req - request object.
   * @param res - response object.
   * @returns - promise that resolves with void.
   */
  private async $getProject(req: Request, res: Response): Promise<void> {
    this.configureDefaultHeaders(res);

    // Angor project id query params.
    const { projectID } = req.params;

    // Angor project.
    const project =
      await AngorProjectRepository.$getProjectWithInvestmentsCount(projectID);

    // Validate project object.
    if (!project || !project.id) {
      this.responseWithNotFoundStatus(res);

      return;
    }

    // Adjust DB data to confirm ProjectsPayloadItem interface.
    const payload: ProjectPayloadItem = {
      founderKey: project.founder_key,
      projectIdentifier: project.id,
      createdOnBlock: project.created_on_block,
      trxId: project.txid,
      nostrEventId: project.nostr_event_id,
      totalInvestmentsCount: project.investments_count,
    };

    res.json(payload);
  }

  /**
   * Provides Angor projects.
   * @param req - request object.
   * @param res - response object.
   * @returns - promise that resolves with void.
   */
  private async $getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      this.configureDefaultHeaders(res);

      // Angor project id query params.
      const { projectID } = req.params;

      // fetch project investments

      let advancedStats: AdvancedProjectStats = {
        amountSpentSoFarByFounder: 0,
        amountInPenalties: 0,
        countInPenalties: 0
      };
      const investments = await AngorProjectRepository.$getProjectInvestments(projectID);
      const filteredInvestments = investments.filter((investment) => {
        return !!investment.transaction_id && !!investment.investor_npub && !!investment.amount_sats;
      });
      if (filteredInvestments.length > 0) {
        const spentVouts: AngorVout[][] = await Promise.all(
          investments.map(async (investment) => {
            //fetch transaction for each investment, with full info about vouts
            const fullTr = await transactionUtils.$getTransactionExtended(
              investment.transaction_id,
              true,
              false,
              false,
              true);
            // fetch and extract spent status and values for each vout.

            const vouts = await Promise.all(
              fullTr.vout
                .filter((v) => v.scriptpubkey_type === 'v1_p2tr')
                .map(async (v, i, arr) => {
                  const voutOutspend = await bitcoinApi.$getOutspend(investment.transaction_id, i);
                  const isLast = i === arr.length - 1;

                  let childVouts: IEsploraApi.Vout[] = [];
                  if (isLast && voutOutspend.spent && voutOutspend.txid) {
                    const lastVoutTx = await transactionUtils.$getTransactionExtended(
                      voutOutspend.txid,
                      true,
                      false,
                      false,
                      true
                    );
                    if (lastVoutTx.vout.length > 0) {
                      childVouts = lastVoutTx.vout;
                    }
                  }
                  return {
                    value: v.value,
                    spent: voutOutspend.spent,
                    spendingTxId: voutOutspend.txid,
                    investmentTxId: investment.transaction_id,
                    isLast,
                    ... childVouts.length > 0 && { childVouts }
                  };
                })
            );

            // filter out vouts that are not spent and therefore dont have a spending transaction info
            return vouts.filter((vout): vout is AngorVout => {
              return vout !== undefined && vout.spent && vout.spendingTxId !== undefined;
            });
          }));

        // iterate over each vout and accumulate required information into a tally
        // sorted by a composite key of investment transaction id and spending transaction id.
        const tally: Record<string, StatsTally> = computeStatsTally(spentVouts);

        // Iterate over the Stats Tally and accumulate final information about investor and found
        // spending patterns.
        advancedStats = computeAdvancedStats(tally);
      }
      // Angor project statistics.
      const projectStats = await AngorProjectRepository.$getProjectStats(
        projectID
      );

      // Validate project statistics object.
      if (!projectStats || !projectStats.id) {
        this.responseWithNotFoundStatus(res);

        return;
      }
      // Adjust DB data and calculates advanced stats to confirm ProjectStatsPayloadItem interface.
      const payload: ProjectStatsPayloadItem = {
        ...advancedStats,
        investorCount: projectStats.investor_count,
        amountInvested: parseInt(projectStats.amount_invested) || 0
      };

      res.json(payload);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
        details: error
      });
    }
  }

  /**
   * Provides Angor projects.
   * @param req - request object.
   * @param res - response object.
   * @returns - promise that resolves with void.
   */
  private async $getProjectInvestments(
    req: Request,
    res: Response
  ): Promise<void> {
    this.configureDefaultHeaders(res);

    // Angor project ID query params.
    const { projectID } = req.params;

    let limit: number | undefined;
    let offset: number | undefined;

    const { limit: queryLimit, offset: queryOffset } = req.query;

    if (typeof queryLimit === 'string') {
      // Convert query param into number.
      limit = parseInt(queryLimit);

      // Validate limit query param.
      if (Number.isNaN(limit)) {
        this.responseWithValidationError(res, {
          limit: [`The value '${queryLimit}' is not valid.`],
        });

        return;
      } else if (limit < 1 || limit > 50) {
        this.responseWithValidationError(res, {
          limit: ['The field limit must be between 1 and 50.'],
        });

        return;
      }
    }

    if (typeof queryOffset === 'string') {
      // Convert query param into number.
      offset = parseInt(queryOffset);

      // Validate offset query param.
      if (Number.isNaN(offset)) {
        this.responseWithValidationError(res, {
          limit: [`The value '${queryOffset}' is not valid.`],
        });

        return;
      } else if (offset < 0) {
        this.responseWithValidationError(res, {
          offset: [
            'The field offset must be between 0 and 9.223372036854776E+18.',
          ],
        });

        return;
      }
    }
    // Angor project investments.
    const projectInvestments =
      await AngorProjectRepository.$getProjectInvestments(
        projectID,
        limit,
        offset
      );

    // Adjust DB data to confirm ProjectInvestmentPayloadItem interface.
    const payload: ProjectInvestmentPayloadItem[] = projectInvestments.length > 0
      ? projectInvestments
      .map((investment) => ({
        investorPublicKey: investment.investor_npub,
        totalAmount: investment.amount_sats,
        transactionId: investment.transaction_id,
        hashOfSecret: investment.secret_hash,
        isSeeder: investment.is_seeder,
      }))
      .sort()
      : [];

    // Amount of confirmed Angor project investments.
    const investmentsCount =
      await AngorInvestmentRepository.$getConfirmedInvestmentsCount();

    const path = req.route.path.replace(':projectID', projectID);

    this.setPaginationAndLinkHeaders(
      res,
      limit,
      offset,
      path,
      investmentsCount
    );

    res.json(payload);
  }

  /**
   * Provides Angor projects.
   * @param req - request object.
   * @param res - response object.
   * @returns - promise that resolves with void.
   */
  private async getProjectInvestment(
    req: Request,
    res: Response
  ): Promise<void> {
    this.configureDefaultHeaders(res);

    // Project ID and investor nostr public key.
    const { projectID, investorPublicKey } = req.params;

    // Angor project investment.
    const projectInvestment = (
      await AngorProjectRepository.$getProjectInvestments(
        projectID,
        undefined,
        undefined,
        investorPublicKey
      )
    )[0];

    // Respond with status code 204 if no Angor project investment.
    if (!projectInvestment) {
      res.status(204).send();

      return;
    }

    // Adjust DB data to confirm ProjectInvestmentPayloadItem interface.
    const payload: ProjectInvestmentPayloadItem = {
      investorPublicKey: projectInvestment.investor_npub,
      totalAmount: projectInvestment.amount_sats,
      transactionId: projectInvestment.transaction_id,
      hashOfSecret: projectInvestment.secret_hash,
      isSeeder: projectInvestment.is_seeder,
    };

    res.json(payload);
  }

  /**
   * Configures default headers that each response should have.
   * @param res - response object.
   */
  private configureDefaultHeaders(res: Response): void {
    res.header('Vary', 'Accept-Encoding');
    res.header('Strict-Transport-Security', `max-age=${365 * 24 * 60 * 60}`);
  }

  /**
   * Sets pagination and link headers.
   * @param res - response object.
   * @param limit - pagination limit.
   * @param offset - pagination offset.
   * @param path - route path.
   * @param rowsCount - amount of the pagination items.
   */
  private setPaginationAndLinkHeaders(
    res: Response,
    limit = 10,
    offset = 0,
    path: string,
    rowsCount: number
  ): void {
    let link = '<';

    // 1st pagination chunk.
    const firstChunk = path + `?offset=${0}&limit=${limit}`;

    link += firstChunk;
    link += '>; rel="first"';

    // Last pagination chunk.
    const lastChunk = path + `?offset=${rowsCount - limit}&limit=${limit}`;

    link += ', <';
    link += lastChunk;
    link += '>; rel="last"';

    // Check and add previous pagination chunk.
    if (rowsCount - limit > -1) {
      const previousChunk = path + `?offset=${limit}&limit=${limit}`;

      link += ', <';
      link += previousChunk;
      link += '>; rel="previous"';
    }

    // Check and add next pagination chunk.
    if (rowsCount - (limit + 10) > -1) {
      const nextChunk = path + `?offset=${limit + 10}&limit=${limit}`;

      link += ', <';
      link += nextChunk;
      link += '>; rel="next"';
    }

    res.header('Link', link);
    res.header('Pagination-Total', `${rowsCount}`);
    res.header('Pagination-Limit', `${limit}`);
    res.header('Pagination-Offset', `${offset}`);
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
  }

  /**
   * Sets 404 status code and sends error object.
   * @param res
   */
  private responseWithNotFoundStatus(res: Response): void {
    // TODO: discuss "traceId" in error object
    res.status(404).json({
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
      title: 'Not Found',
      status: 404,
    });
  }

  /**
   * Sets 400 status code and sends error object.
   * @param res - response object.
   * @param error - error object.
   */
  private responseWithValidationError(
    res: Response,
    error: { [key: string]: string[] }
  ): void {
    res.status(400).json({
      errors: error,
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
    });
  }
}

export default new AngorRoutes();
