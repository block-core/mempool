import DB from '../database';
import logger from "../logger";
import { RowDataPacket } from "mysql2/typings/mysql";

class AngorBlocksRepository {
  public async $markBlockAsIndexed(blockHeight: number, blockHash: string): Promise<void> {
    try {
      await DB.query(
        `INSERT INTO angor_blocks (block_height, block_hash) VALUES (?, ?)`, [blockHeight, blockHash])
    } catch (error) {
      logger.err(
        'Error marking block as indexed. Reason: ' + (error instanceof Error ? error.message : error)
      );
    }
  }

  public async isBlockIndexed(blockHeight: number, blockHash: string): Promise<boolean> {
    try {
      const result = await DB.query(
        `SELECT * FROM angor_blocks WHERE block_height = ? AND block_hash = ? LIMIT 1`, [blockHeight, blockHash]
      );

      const rows = result[0] as RowDataPacket;

      return rows.length > 0;
    } catch (error) {
      logger.err(
        'Error checking if block is indexed. Reason: ' + (error instanceof Error ? error.message : error)
      );
      return false;
    }
  }
}

export default new AngorBlocksRepository();
