import { AngorVout, StatsTally } from './angor.routes';
import { computeAdvancedStats, computeStatsTally } from './angor-stats';

describe('AngorStats', () => {
  it('Should return a tally based on the investment transaction and spending transactions', () => {
    expect(computeStatsTally(filteredVouts)).toEqual(voutsTally);
  });
  it('Should return Advanced project stats based on the AngorVout tally', () => {
    const advancedStats = computeAdvancedStats(computeStatsTally(filteredVouts));
    expect(advancedStats.amountSpentSoFarByFounder).toEqual(2600000000);
    expect(advancedStats.amountInPenalties).toEqual(900000000);
    expect(advancedStats.countInPenalties).toEqual(1);
  });
});

const filteredVouts: AngorVout[][] = [
  [
    {
      value: 100000000,
      spent: true,
      spendingTxId: 'spendingTrx1',
      investmentTxId: 'investmentTrx1',
      isLast: false
    },
    {
      value: 300000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1',
      isLast: false
    },
    {
      value: 600000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1',
      isLast: true,
      childVouts: [
        {
        'scriptpubkey': 'test1',
        'scriptpubkey_asm': 'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
        'scriptpubkey_type': 'v0_p2wpkh',
        'scriptpubkey_address': 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
        'value': 600000000
        }
      ]
    }
  ],
  [
    {
      value: 250000000,
      spent: true,
      spendingTxId: 'spendingTrx3',
      investmentTxId: 'investmentTrx2',
      isLast: false
    },
    {
      value: 750000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2',
      isLast: false
    },
    {
      value: 1500000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2',
      isLast: true,
      childVouts: [
        {
          'scriptpubkey': 'test2',
          'scriptpubkey_asm': 'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
          'scriptpubkey_type': 'v0_p2wpkh',
          'scriptpubkey_address': 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
          'value': 750000000
        },
        {
          'scriptpubkey': 'test3',
          'scriptpubkey_asm': 'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
          'scriptpubkey_type': 'v0_p2wpkh',
          'scriptpubkey_address': 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
          'value': 750000000
        }
      ]
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
    totalAmount: 750000000,
    numberOfTx: 1
  },
  'investmentTrx2-1500000000-spendingTrx4': {
    totalAmount: 1500000000,
    numberOfTx: 1
  }
};
