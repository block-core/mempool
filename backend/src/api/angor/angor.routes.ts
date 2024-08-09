import { Application, Request, Response } from 'express';
import config from '../../config';
import AngorProjectRepository from '../../repositories/AngorProjectRepository';

interface ProjectsPayloadItem {
  founderKey: string;
  nostrPubKey: string;
  projectIdentifier: string;
  createdOnBlock: number;
  trxId: string;
}
interface ProjectPayloadItem {
  founderKey: string;
  nostrPubKey: string;
  projectIdentifier: string;
  createdOnBlock: number;
  trxId: string;
  totalInvestmentsCount: number;
}

interface ProjectStatsPayloadItem {
  investorCount: number;
  amountInvested: number;
}

class AngorRoutes {
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
  }

  private async $getProjects(req: Request, res: Response): Promise<void> {
    this.configureDefaultHeaders(res);

    let limit = 10;
    let offset = 0;

    const { limit: queryLimit, offset: queryOffset } = req.query;

    const responseWithError = (error: { [key: string]: string[] }): void => {
      res.status(400).json({
        errors: error,
        type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
        title: 'One or more validation errors occurred.',
        status: 400,
      });
    };

    if (typeof queryLimit === 'string') {
      limit = parseInt(queryLimit);

      if (Number.isNaN(limit)) {
        responseWithError({
          limit: [`The value '${queryLimit}' is not valid.`],
        });

        return;
      } else if (limit < 1 || limit > 50) {
        responseWithError({
          limit: ['The field limit must be between 1 and 50.'],
        });

        return;
      }
    }

    if (typeof queryOffset === 'string') {
      offset = parseInt(queryOffset);

      if (Number.isNaN(offset)) {
        responseWithError({
          limit: [`The value '${queryOffset}' is not valid.`],
        });

        return;
      } else if (offset < 0) {
        responseWithError({
          offset: [
            'The field offset must be between 0 and 9.223372036854776E+18.',
          ],
        });

        return;
      }
    }

    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');

    if (offset !== undefined) {
      res.header('Pagination-Offset', `${offset}`);
    }
    if (limit !== undefined) {
      res.header('Pagination-Limit', `${limit}`);
    }

    // FIXME: add Content-Encoding header
    // res.header('Content-Encoding', 'br');

    const projectsCount =
      await AngorProjectRepository.$getConfirmedProjectsCount();

    let link = '<';
    const { path } = req.route;

    const firstChunk = path + `?limit=${limit}&offset=${0}`;

    link += firstChunk;
    link += '>; rel="first"';

    if (projectsCount - limit > -1) {
      const lastChunk =
        path + `?limit=${limit}&offset=${projectsCount - limit}`;

      link += ', <';
      link += lastChunk;
      link += '>; rel="last"';
    }

    if (projectsCount - limit > -1) {
      const previousChunk = path + `?limit=${limit}&offset=${limit}`;

      link += ', <';
      link += previousChunk;
      link += '>; rel="previous"';
    }

    if (projectsCount - (limit + 10) > -1) {
      const nextChunk = path + `?limit=${limit}&offset=${limit + 10}`;

      link += ', <';
      link += nextChunk;
      link += '>; rel="next"';
    }

    res.header('Pagination-Total', `${projectsCount}`);
    res.header('Link', link);

    const projects: ProjectsPayloadItem[] = (
      await AngorProjectRepository.$getProjects(limit, offset)
    )
      .map((project) => ({
        founderKey: project.founder_key,
        nostrPubKey: project.npub,
        projectIdentifier: project.id,
        createdOnBlock: project.created_on_block,
        trxId: project.txid,
      }))
      .sort(
        (p1: ProjectsPayloadItem, p2: ProjectsPayloadItem) =>
          p1.createdOnBlock - p2.createdOnBlock
      );

    res.json(projects);
  }

  private async $getProject(req: Request, res: Response): Promise<void> {
    this.configureDefaultHeaders(res);

    // FIXME: add Content-Encoding header
    // res.header('Content-Encoding', 'br');

    const { projectID } = req.params;

    const project =
      await AngorProjectRepository.$getProjectWithInvestmentsCount(projectID);

    if (!project || !project.id) {
      this.responseWithNotFoundStatus(res);

      return;
    }

    const payload: ProjectPayloadItem = {
      founderKey: project.founder_key,
      nostrPubKey: project.npub,
      projectIdentifier: project.id,
      createdOnBlock: project.created_on_block,
      trxId: project.txid,
      totalInvestmentsCount: project.investments_count,
    };

    res.json(payload);
  }

  private async $getProjectStats(req: Request, res: Response): Promise<void> {
    this.configureDefaultHeaders(res);

    // FIXME: add Content-Encoding header
    // res.header('Content-Encoding', 'br');

    const { projectID } = req.params;

    const projectStats = await AngorProjectRepository.$getProjectStats(
      projectID
    );

    if (!projectStats || !projectStats.id) {
      this.responseWithNotFoundStatus(res);

      return;
    }

    const payload: ProjectStatsPayloadItem = {
      investorCount: projectStats.investor_count,
      amountInvested: parseInt(projectStats.amount_invested) || 0,
    };

    res.json(payload);
  }

  private configureDefaultHeaders(res: Response): void {
    res.header('Transfer-Encoding', 'chunked');
    res.header('Vary', 'Accept-Encoding');
    res.header('Strict-Transport-Security', `max-age=${365 * 24 * 60 * 60}`);
  }

  private responseWithNotFoundStatus(res: Response): void {
    // TODO: discuss "traceId" in error object
    res.status(404).json({
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
      title: 'Not Found',
      status: 404,
    });
  }
}

export default new AngorRoutes();
