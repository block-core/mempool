import { IEsploraApi } from '../bitcoin/esplora-api.interface';
import { ProjectInvestment } from '../../repositories/AngorProjectRepository';
import bitcoinApi from '../bitcoin/bitcoin-api-factory';
import { AdvancedProjectStats, AngorVout, StatsTally } from './angor.routes';

export async function fetchAngorVouts(vout: IEsploraApi.Vout, investment: ProjectInvestment, index: number): Promise<AngorVout | undefined> {
  if (vout.scriptpubkey_type === 'v1_p2tr') {
    const voutStatus = await bitcoinApi.$getOutspend(investment.transaction_id, index);
    return {
      value: vout.value,
      spent: voutStatus.spent,
      spendingTxId: voutStatus.txid,
      investmentTxId: investment.transaction_id
    };
  }
}

/**
 * Iterates over each AngorVout and accumulates required information into a tally.
 * Result is sorted by a composite key of investment transaction ID and spending transaction ID.
 * @param spentVouts a filtered array of spent vouts extracted from the project investment transactions.
 * @return an object containing required information to generated final statistics.
 */
export function computeStatsTally(spentVouts: AngorVout[][]): Record<string, StatsTally> {
  return spentVouts.reduce((acc, v) => {
    v.forEach((vout) => {
      const key = `${vout.investmentTxId}-${vout.spendingTxId}`;
      if (!acc[key]) {
        acc[key] = { totalAmount: 0, numberOfTx: 0 };
      }

      acc[key].totalAmount += vout.value;
      acc[key].numberOfTx += 1;
    });
    return acc;
  }, {} as Record<string, StatsTally>);
}

/**
 * Iterates over the previously generated tally of investment and spending transactions
 * and computes amount spent by invedtors and founders.
 * @param statsTally
 * @return AdvancedProjectStats that can then be included in the project stats response.
 */
export function computeAdvancedStats(statsTally: Record<string, StatsTally>): AdvancedProjectStats {
  return Object.values(statsTally).reduce<AdvancedProjectStats>((obj, val) => {
    if (val.numberOfTx === 1) {
      obj.amountSpentSoFarByFounder += val.totalAmount;
    }
    if (val.numberOfTx > 1) {
      obj.amountInPenalties += val.totalAmount;
      obj.countInPenalties += 1;
    }
    return obj;
  }, {amountSpentSoFarByFounder: 0, amountInPenalties: 0, countInPenalties: 0});
}
