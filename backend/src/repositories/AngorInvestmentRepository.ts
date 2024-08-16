import DB from '../database';
import logger from '../logger';
import { AngorTransactionStatus } from '../angor/AngorTransactionDecoder';

/**
 * Angor investment repository.
 */
class AngorInvestmentRepository {
  /**
   * Stores Angor investment.
   * @param txid - transaction ID.
   * @param amount - transaction amount.
   * @param addressOnFeeOutput - address on fee output.
   * @param transactionStatus - transaction status.
   * @param investorPubKey - investor nostr pubkey.
   * @param secretHash - hash of secret.
   * @param createdOnBlock - block height.
   */
  public async $setInvestment(
    txid: string,
    amount: number,
    addressOnFeeOutput: string,
    transactionStatus: AngorTransactionStatus,
    investorPubKey: string,
    secretHash?: string,
    createdOnBlock?: number
  ): Promise<void> {
    try {
      const query = `INSERT INTO angor_investments
          (
            txid,
            amount_sats,
            address_on_fee_output,
            transaction_status,
            investor_npub,
            secret_hash,
            is_seeder
            ${createdOnBlock ? ', created_on_block' : ''}
          )
          VALUES ('${txid}', '${amount}', '${addressOnFeeOutput}', '${transactionStatus}', '${investorPubKey}', '${
            secretHash || ''
          }', ${secretHash ? 'TRUE' : 'FALSE'}${
            createdOnBlock ? `, '${createdOnBlock}'` : ''
          })
          ON DUPLICATE KEY UPDATE
            transaction_status = '${transactionStatus}'
        `;

      await DB.query(query);
    } catch (e: any) {
      logger.err(
        `Cannot save Angor investment into db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  /**
   * Updates statuses of Angor investments filtered by address on fee output.
   * @param addressOnFeeOutput - address on fee output
   * @param status - transaction status.
   */
  public async $updateInvestmentsStatus(
    addressOnFeeOutput: string,
    status: AngorTransactionStatus
  ): Promise<void> {
    try {
      const query = `UPDATE angor_investments
          SET
            transaction_status = '${status}'
          WHERE
            address_on_fee_output = '${addressOnFeeOutput}'
        `;

      await DB.query(query);
    } catch (e: any) {
      logger.err(
        `Cannot delete Angor investments from db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }

  /**
   * Provides an amount of confirmed Angor investments.
   * @returns - promise that resolves into number.
   */
  public async $getConfirmedInvestmentsCount(): Promise<number> {
    try {
      const query = `SELECT COUNT(*) AS count
          FROM angor_investments
          WHERE transaction_status = '${AngorTransactionStatus.Confirmed}'
        `;

      const [rows] = await DB.query(query);
      const count = rows[0].count || 0;

      return count;
    } catch (e: any) {
      logger.err(
        `Cannot delete Angor investments from db. Reason: ` +
          (e instanceof Error ? e.message : e)
      );

      throw e;
    }
  }
}

export default new AngorInvestmentRepository();
