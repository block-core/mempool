import { AngorVout, StatsTally } from './angor.routes';
import { computeAdvancedStats, computeStatsTally } from './angor-stats';

describe('AngorStats', () => {
  it('Should return a tally based on the investment transaction and spending transactions', () => {
    expect(computeStatsTally(filteredVouts)).toEqual(voutsTally);
  });
  it('Should return Advanced project stats based on the AngorVout tally', () => {
    const advancedStats = computeAdvancedStats(computeStatsTally(filteredVouts));
    expect(advancedStats.amountSpentSoFarByFounder).toEqual(350000000);
    expect(advancedStats.amountInPenalties).toEqual(3150000000);
    expect(advancedStats.countInPenalties).toEqual(2);
  });
});

const filteredVouts: AngorVout[][] = [
  [
    {
      value: 100000000,
      spent: true,
      spendingTxId: 'spendingTrx1',
      investmentTxId: 'investmentTrx1'
    },
    {
      value: 300000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1'
    },
    {
      value: 600000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1'
    }
  ],
  [
    {
      value: 250000000,
      spent: true,
      spendingTxId: 'spendingTrx3',
      investmentTxId: 'investmentTrx2'
    },
    {
      value: 750000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2'
    },
    {
      value: 1500000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2'
    }
  ]
];

const voutsTally: Record<string, StatsTally> = {
  'investmentTrx1-spendingTrx1': {
    totalAmount: 100000000,
    numberOfTx: 1
  },
  'investmentTrx1-spendingTrx2': {
    totalAmount: 900000000,
    numberOfTx: 2
  },
  'investmentTrx2-spendingTrx3': {
    totalAmount: 250000000,
    numberOfTx: 1
  },
  'investmentTrx2-spendingTrx4': {
    totalAmount: 2250000000,
    numberOfTx: 2
  }
};
