import DB from '../database';
import logger from "../logger";
import { RowDataPacket } from "mysql2/typings/mysql";

class AngorBlocksRepository {
  public async $updateLatestIndexedBlock(blockHeight: number, blockHash: string): Promise<void> {
    try {
      await DB.query(
        `INSERT INTO angor_blocks (id, block_height, block_hash)
        VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE
            block_height = ?,
            block_hash = ?`, [blockHeight, blockHash, blockHeight, blockHash]
      );
    } catch (error) {
      logger.err(
        'Error updating latest indexed block. Reason: ' + (error instanceof Error ? error.message : error)
      );
    }
  }

  public async $getLatestIndexedBlock(): Promise<number | null> {
    try {
      const [rows]= await DB.query(
        `SELECT block_height FROM angor_blocks WHERE id = 1`
      ) as RowDataPacket[][];

      if (rows.length === 0) {
        return null;
      } else {
        return rows[0].block_height as number;
      }
    } catch (error) {
      logger.err(
        'Error getting latest indexed block. Reason: ' + (error instanceof Error ? error.message : error)
      );
      throw error;
    }
  }
}

export default new AngorBlocksRepository();
