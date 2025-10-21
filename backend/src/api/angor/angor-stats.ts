import { AdvancedProjectStats, AngorVout, StatsTally } from './angor.routes';
import logger from '../../logger';
import { IEsploraApi } from '../bitcoin/esplora-api.interface';
import bitcoinApi from '../../api/bitcoin/bitcoin-api-factory';

/**
 * Iterates over each AngorVout and accumulates required information into a tally.
 * Result is sorted by a composite key of investment transaction ID and spending transaction ID.
 * @param spentVouts a filtered array of spent vouts extracted from the project investment transactions.
 * @return an object containing required information to generated final statistics.
 */
export function computeStatsTally(
  spentVouts: AngorVout[][]
): Record<string, StatsTally> {
  return spentVouts.reduce(
    (acc, v) => {
      v.forEach((vout) => {
        const key = isSpentByFounder(vout)
          ? `${vout.investmentTxId}-${vout.value}-${vout.spendingTxId}`
          : `${vout.investmentTxId}-${vout.spendingTxId}`;

        if (!acc[key]) {
          acc[key] = { totalAmount: 0, numberOfTx: 0 };
        }

        acc[key].totalAmount += vout.value;
        acc[key].numberOfTx += 1;
      });
      return acc;
    },
    {} as Record<string, StatsTally>
  );
}

function isSpentByFounder(vout: AngorVout): boolean {
  return vout.isLast && !!vout.childVouts && vout.childVouts.length > 1;
}

/**
 * Iterates over the previously generated tally of investment and spending transactions
 * and computes amount spent by investors and founders.
 * @param statsTally
 * @return AdvancedProjectStats that can then be included in the project stats response.
 */
export function computeAdvancedStats(
  statsTally: Record<string, StatsTally>
): AdvancedProjectStats {
  return Object.values(statsTally).reduce<AdvancedProjectStats>(
    (obj, val) => {
      if (val.numberOfTx === 1) {
        obj.amountSpentSoFarByFounder += val.totalAmount;
      }
      if (val.numberOfTx > 1) {
        obj.amountInPenalties += val.totalAmount;
        obj.countInPenalties += 1;
      }
      return obj;
    },
    {
      amountSpentSoFarByFounder: 0,
      amountInPenalties: 0,
      countInPenalties: 0,
      amountSpentSoFarByInvestorNoPenalty: 0,
    }
  );
}

export async function getAdvancedProjectStats(
  vouts: IEsploraApi.Vout[]
): Promise<AdvancedProjectStats> {
  const stats: AdvancedProjectStats = {
    amountSpentSoFarByFounder: 0,
    amountInPenalties: 0,
    countInPenalties: 0,
    amountSpentSoFarByInvestorNoPenalty: 0,
  };

  // scriptpubkey_type v1_p2tr indicates that it a stage vout
  const stageVouts = vouts.filter(
    (vout) => vout.scriptpubkey_type === 'v1_p2tr'
  );

  for (const stageVout of stageVouts) {
    const { scriptpubkey_address: address } = stageVout;

    if (address) {
      const transactions = await bitcoinApi.$getAddressTransactions(
        address,
        ''
      );

      transactions.forEach((transaction) => {
        // If there are 4 witnesses
        // and inner_witnessscript_asm has OP_CHECKSIGVERIFY and OP_CHECKSIG
        // then transaction is considered as spent by investor to penalties

        const spentByInvestorToPenaltyTransaction = transaction.vin
          // make sure transaction's previous vout is exactly the same as stage's vout
          .filter(
            (vin) => JSON.stringify(stageVout) === JSON.stringify(vin.prevout)
          )
          .find(
            (vin) =>
              vin.witness.length === 4 &&
              vin.inner_witnessscript_asm.includes('OP_CHECKSIGVERIFY') &&
              vin.inner_witnessscript_asm.includes('OP_CHECKSIG')
          );

        if (spentByInvestorToPenaltyTransaction) {
          const penaltiesStats = transaction.vout.reduce(
            (
              acc: { amount: number; count: number },
              vout: IEsploraApi.Vout
            ) => {
              const { value } = vout;

              acc.amount += value;

              if (value) {
                acc.count += 1;
              }

              return acc;
            },
            { amount: 0, count: 0 }
          );

          stats.amountInPenalties += penaltiesStats.amount;
          stats.countInPenalties += penaltiesStats.count;
        } else {
          // If there are 3 witnesses
          // and inner_witnessscript_asm has OP_CLTV
          // then transaction is considered as spent by founder
          const spentByFounderTransaction = transaction.vin
            // make sure transaction's previous vout is exactly the same as stage's vout
            .filter(
              (vin) => JSON.stringify(stageVout) === JSON.stringify(vin.prevout)
            )
            .find(
              (vin) =>
                vin.witness.length === 3 &&
                vin.inner_witnessscript_asm.includes('OP_CLTV')
            );

          if (spentByFounderTransaction) {
            stats.amountSpentSoFarByFounder += transaction.vout.reduce(
              (acc: number, vout: IEsploraApi.Vout) => {
                acc += vout.value;

                return acc;
              },
              0
            );
          } else {
            // The following kinf of transaction are planned in Angor projects v2.
            // Uncomment lines below to gather amountSpentSoFarByInvestorNoPenalty statistics
            // If there are 3 witnesses
            // and inner_witnessscript_asm has OP_CHECKSIG opcode
            // and doesn't have OP_CHECKSIGVERIFY opcode
            // const amountSpentSoFarByInvestorNoPenalty = transaction.vin
            //   // make sure transaction's previous vout is exactly the same as stage's vout
            //   .filter(
            //     (vin) =>
            //       JSON.stringify(stageVout) === JSON.stringify(vin.prevout)
            //   )
            //   .find(
            //     (vin) =>
            //       vin.witness.length === 3 &&
            //       vin.inner_witnessscript_asm.includes('OP_CHECKSIG') &&
            //       !vin.inner_witnessscript_asm.includes('OP_CHECKSIGVERIFY')
            //   );
            // if (amountSpentSoFarByInvestorNoPenalty) {
            //   stats.amountSpentSoFarByInvestorNoPenalty +=
            //     transaction.vout.reduce(
            //       (acc: number, vout: IEsploraApi.Vout) => {
            //         acc += vout.value;
            //         return acc;
            //       },
            //       0
            //     );
            // }
          }
        }
      });
    }
  }

  return stats;
}
