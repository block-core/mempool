import { AdvancedProjectStats, AngorVout, StatsTally } from './angor.routes';
import {
  computeAdvancedStats,
  computeStatsTally,
  getAdvancedProjectStats,
} from './angor-stats';
import bitcoinApi from '../../api/bitcoin/bitcoin-api-factory';
import { IEsploraApi } from '../../api/bitcoin/esplora-api.interface';

describe('AngorStats', () => {
  it('Should return a tally based on the investment transaction and spending transactions', () => {
    expect(computeStatsTally(filteredVouts)).toEqual(voutsTally);
  });

  it('Should return Advanced project stats based on the AngorVout tally', () => {
    const advancedStats = computeAdvancedStats(
      computeStatsTally(filteredVouts)
    );

    expect(advancedStats.amountSpentSoFarByFounder).toEqual(2600000000);
    expect(advancedStats.amountInPenalties).toEqual(900000000);
    expect(advancedStats.countInPenalties).toEqual(1);
  });

  it('Should return Advanced project stats', async () => {
    const vouts = [
      [
        {
          scriptpubkey: '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
          value: 1000000,
        },
        {
          scriptpubkey:
            '6a2102d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
          scriptpubkey_asm:
            'OP_RETURN OP_PUSHBYTES_33 02d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
          scriptpubkey_type: 'op_return',
          value: 0,
        },
        {
          scriptpubkey:
            '5120f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1p7wnqzawyu0vsszmyqdal7tjvgs4t7j0mtr8rv55jee69e4mcvyzsx3h4r3',
          value: 9900000,
        },
        {
          scriptpubkey:
            '512008e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 08e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1pprjj7ke8x9fgtfwlhvkxet4584t0qsehdgqjwscx5ppn8mtvp9qsdhyf3v',
          value: 29700000,
        },
        {
          scriptpubkey:
            '512000aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 00aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1pqzhw9vtsw2u6hvw3pcl5nrjsg53ldtqt8uglkcw453afgw3pnuese89z04',
          value: 59400000,
        },
        {
          scriptpubkey: '0014fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qlh85v964x4eaggk6nfs9gmrtpmtv8fw9t8alwn',
          value: 18936,
        },
      ],
      [
        {
          scriptpubkey: '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
          value: 1000000,
        },
        {
          scriptpubkey:
            '6a2103c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
          scriptpubkey_asm:
            'OP_RETURN OP_PUSHBYTES_33 03c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
          scriptpubkey_type: 'op_return',
          value: 0,
        },
        {
          scriptpubkey:
            '5120c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9',
          value: 9900000,
        },
        {
          scriptpubkey:
            '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
          value: 29700000,
        },
        {
          scriptpubkey:
            '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
          scriptpubkey_asm:
            'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
          scriptpubkey_type: 'v1_p2tr',
          scriptpubkey_address:
            'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
          value: 59400000,
        },
        {
          scriptpubkey: '00143c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 3c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1q8swe8faa8earh9hnk09au48gp2je940cnt43s8',
          value: 349998918,
        },
      ],
    ];

    const expectedStats = {
      amountSpentSoFarByFounder: 9899862,
      amountInPenalties: 198198784,
      countInPenalties: 6,
    };

    const advancedStats: AdvancedProjectStats = {
      amountSpentSoFarByFounder: 0,
      amountInPenalties: 0,
      countInPenalties: 0,
    };

    jest
      .spyOn(bitcoinApi, '$getAddressTransactions')
      .mockImplementation((address) => {
        let transactions;

        switch (address) {
          case 'tb1p7wnqzawyu0vsszmyqdal7tjvgs4t7j0mtr8rv55jee69e4mcvyzsx3h4r3':
            transactions = [
              {
                txid: '8916ade1db946a586032b0c5f2f4071d299009d6c8e098652a153e3fee9200ee',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '0313ee1718f0684e15d3ac1b47e1f2911dc66db9a19ebebbfc0f1ee03753667d',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '0014cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qe7lz2fvzne3k8ru0x3x86mneec0repgruyt34k',
                      value: 19662,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100ed078485ccad74f3f8edf357c5edf35736e010af82bda22ea52e7127b5bd55eb02202a610fc5552407d72e00a456f95b69f8c3f37ef6f537b20eb06511c0da09776801',
                      '033ab18fdb0c1d30b5a8b96d2d4f6618f7f948b42e056c13a33a76e861498da16a',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                  {
                    txid: '5d791cb483ea7454ffc729e3f7cbf62b0d80c60a87e0dc0029c52d9352dc37c2',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qtyvd2wfm6fhhgztss2588hmstles69mlym05sd',
                      value: 100000000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100d6471bb43140717930edf2009194ac9b90ef3c5cca5c16074c2b7939c4e96c7d0220632380d2791dad29c8c7900b500033ff6796b1db11490446350328477c94427601',
                      '037bcd672a1bb119d6a48bea407a615c1ac401aba8b174eae51f3910f08dd4c813',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2102d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 02d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p7wnqzawyu0vsszmyqdal7tjvgs4t7j0mtr8rv55jee69e4mcvyzsx3h4r3',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '512008e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 08e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pprjj7ke8x9fgtfwlhvkxet4584t0qsehdgqjwscx5ppn8mtvp9qsdhyf3v',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '512000aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 00aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pqzhw9vtsw2u6hvw3pcl5nrjsg53ldtqt8uglkcw453afgw3pnuese89z04',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '0014fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qlh85v964x4eaggk6nfs9gmrtpmtv8fw9t8alwn',
                    value: 18936,
                  },
                ],
                size: 545,
                weight: 1526,
                sigops: 2,
                fee: 726,
                status: {
                  confirmed: true,
                  block_height: 500287,
                  block_hash:
                    '000002d4bf3a9018e15c9094995b258bb05b7cb7917544d86a1c0a35404d13bb',
                  block_time: 1759318721,
                },
              },
            ];

            break;

          case 'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9':
            transactions = [
              {
                txid: 'b219e787e2784e4df10f0b4e66618e4f0966dadd04c05e3d56b54acbe13f1b3b',
                version: 1,
                locktime: 1759276860,
                vin: [
                  {
                    txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                    vout: 2,
                    prevout: {
                      scriptpubkey:
                        '5120c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                      scriptpubkey_asm:
                        'OP_PUSHNUM_1 OP_PUSHBYTES_32 c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                      scriptpubkey_type: 'v1_p2tr',
                      scriptpubkey_address:
                        'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9',
                      value: 9900000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      'cb9d6c2b83646f65d0f74b1ae160f4e405b19c02eaf87fe7905ac99ed51c59e710b7f985b2aedc57fda8ef8432265e43bfc90399466fc4d016f059da9d8c255301',
                      '20ea9e4b74470da87a46ed292d184ac7026ffb934ae70aa964d4113735d22c2605ad04006fdc68b1',
                      'c09f9aa7a903393a2d6aa6aa744355a25175b7ce04fcd081f04d10802bc90d100352a05bf271241597a3c6f98283aab52419312bc082cad30dba5dad490aa0fcf2',
                    ],
                    is_coinbase: false,
                    sequence: 1759276860,
                    inner_witnessscript_asm:
                      'OP_PUSHBYTES_32 ea9e4b74470da87a46ed292d184ac7026ffb934ae70aa964d4113735d22c2605 OP_CHECKSIGVERIFY OP_PUSHBYTES_4 006fdc68 OP_CLTV',
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '00141d80a0e83bce2106e03141dc14f452b51523a796',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 1d80a0e83bce2106e03141dc14f452b51523a796',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qrkq2p6pmecssdcp3g8wpfazjk52j8fukwtyydt',
                    value: 9899862,
                  },
                ],
                size: 258,
                weight: 504,
                sigops: 0,
                fee: 138,
                status: {
                  confirmed: true,
                  block_height: 500293,
                  block_hash:
                    '000000e49fa5d26067bfdff11088a92eb6fca3f3092e56bfccfa0c42e1f1bc5a',
                  block_time: 1759319020,
                },
              },
              {
                txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '38b7cece64b5351e591eb0e092e5dfd23fcfa71f82c19cb95492254f81a0495a',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qt5jcal6l5yurghnxwazqg6sfuc76wyw87hm4jc',
                      value: 449999262,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100c6abdce7255dc6911a6a3edb2a09ab9691f188bd021d5ddfd521edb8d1a24f7702201dc89c2d64d89dbaf815b41edb24ac4660a9306d3749ccc8a493c8c5f23e248c01',
                      '029ba6d10920128c471424c083edc0efdefb9f978f4b278d42d7ab43369449f9d9',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2103c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 03c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '00143c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 3c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1q8swe8faa8earh9hnk09au48gp2je940cnt43s8',
                    value: 349998918,
                  },
                ],
                size: 396,
                weight: 1254,
                sigops: 1,
                fee: 344,
                status: {
                  confirmed: true,
                  block_height: 500290,
                  block_hash:
                    '00000145fb629758aa5229d576bfc222be82fba1360facea6be71b85ec7adece',
                  block_time: 1759318843,
                },
              },
            ];

            break;

          case 'tb1pprjj7ke8x9fgtfwlhvkxet4584t0qsehdgqjwscx5ppn8mtvp9qsdhyf3v':
            transactions = [
              {
                txid: '8916ade1db946a586032b0c5f2f4071d299009d6c8e098652a153e3fee9200ee',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '0313ee1718f0684e15d3ac1b47e1f2911dc66db9a19ebebbfc0f1ee03753667d',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '0014cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qe7lz2fvzne3k8ru0x3x86mneec0repgruyt34k',
                      value: 19662,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100ed078485ccad74f3f8edf357c5edf35736e010af82bda22ea52e7127b5bd55eb02202a610fc5552407d72e00a456f95b69f8c3f37ef6f537b20eb06511c0da09776801',
                      '033ab18fdb0c1d30b5a8b96d2d4f6618f7f948b42e056c13a33a76e861498da16a',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                  {
                    txid: '5d791cb483ea7454ffc729e3f7cbf62b0d80c60a87e0dc0029c52d9352dc37c2',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qtyvd2wfm6fhhgztss2588hmstles69mlym05sd',
                      value: 100000000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100d6471bb43140717930edf2009194ac9b90ef3c5cca5c16074c2b7939c4e96c7d0220632380d2791dad29c8c7900b500033ff6796b1db11490446350328477c94427601',
                      '037bcd672a1bb119d6a48bea407a615c1ac401aba8b174eae51f3910f08dd4c813',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2102d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 02d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p7wnqzawyu0vsszmyqdal7tjvgs4t7j0mtr8rv55jee69e4mcvyzsx3h4r3',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '512008e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 08e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pprjj7ke8x9fgtfwlhvkxet4584t0qsehdgqjwscx5ppn8mtvp9qsdhyf3v',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '512000aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 00aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pqzhw9vtsw2u6hvw3pcl5nrjsg53ldtqt8uglkcw453afgw3pnuese89z04',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '0014fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qlh85v964x4eaggk6nfs9gmrtpmtv8fw9t8alwn',
                    value: 18936,
                  },
                ],
                size: 545,
                weight: 1526,
                sigops: 2,
                fee: 726,
                status: {
                  confirmed: true,
                  block_height: 500287,
                  block_hash:
                    '000002d4bf3a9018e15c9094995b258bb05b7cb7917544d86a1c0a35404d13bb',
                  block_time: 1759318721,
                },
              },
            ];

            break;

          case 'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz':
            transactions = [
              {
                txid: 'ceedc514eb836b8965424dadf28a8e39875991a457b0aa7692f1cc3a64939383',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                    vout: 3,
                    prevout: {
                      scriptpubkey:
                        '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                      scriptpubkey_asm:
                        'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                      scriptpubkey_type: 'v1_p2tr',
                      scriptpubkey_address:
                        'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
                      value: 29700000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      'a39d3cfc346a3613562ded1912081126659eaa33ce7b3538efe5fac025a39b51f31ac470086628ce93f15eb7101ee81208a15d4e25936fe28e6ef22e1fa2ebae83',
                      '448165641f28b20a88b8f9b2b18c99e20d14a1dc25f9160ea67b7fc2bd5956e819e0bbf2d28c8538fde55c4c349f5df9d4c0c511951d58f68ed7953a0b0d91b283',
                      '205482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96ad202961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323ac',
                      'c09f9aa7a903393a2d6aa6aa744355a25175b7ce04fcd081f04d10802bc90d1003c49af145e8ce96e9bc69ca2f6edf87aa304f5b09b09dc0b2accff4acd0c80add0a6df622e3d58509063fddaf73f4c4662daadb8addb4f7da06e18cb1802a3d56',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                    inner_witnessscript_asm:
                      'OP_PUSHBYTES_32 5482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96 OP_CHECKSIGVERIFY OP_PUSHBYTES_32 2961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323 OP_CHECKSIG',
                  },
                  {
                    txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                    vout: 4,
                    prevout: {
                      scriptpubkey:
                        '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                      scriptpubkey_asm:
                        'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                      scriptpubkey_type: 'v1_p2tr',
                      scriptpubkey_address:
                        'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
                      value: 59400000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '891b22136b934b1eb7e8550100c8ae4596e060a56f0258cdbd03d33236093d96038bd7ce925330bd31ab0dc38ba902fb7f689f6151ce0caeaf0e24b7f2a9b1d483',
                      '4fd130143ea158ce2f2465600abb16d29f750ce3cc773b122b390e1553d51add7791ad25c613a7889935421656f70385e6c559b86f1913234e0b8a929633737a83',
                      '205482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96ad202961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323ac',
                      'c19f9aa7a903393a2d6aa6aa744355a25175b7ce04fcd081f04d10802bc90d1003c49af145e8ce96e9bc69ca2f6edf87aa304f5b09b09dc0b2accff4acd0c80add67a3b8e965f4529e89fb24b26400a95c378ff27b7454847eab2a995cbfa02c1a',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                    inner_witnessscript_asm:
                      'OP_PUSHBYTES_32 5482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96 OP_CHECKSIGVERIFY OP_PUSHBYTES_32 2961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323 OP_CHECKSIG',
                  },
                  {
                    txid: '584bac2e78087c05e88413028af995e2e51e775ffe95ce74ca6626508e96552a',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '001469867017ca8c261dfed9882b0d3a7c6fa6cb46bb',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 69867017ca8c261dfed9882b0d3a7c6fa6cb46bb',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qdxr8q9723snpmlke3q4s6wnud7nvk34m5vv794',
                      value: 9999862,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100f79599d91819dc6a2d356be1ef3bb4b5b5d0b3afbed00c95a69b212967f38f570220358e5a82766a413e7fd34deb20fd8819d45b328755abfaf80f9a5b694d17c10501',
                      '02602fab7517860ea10e3aa346570b18fd09b3c93be53a3beb6d7760a075a6f972',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '0020a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_32 a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_type: 'v0_p2wsh',
                    scriptpubkey_address:
                      'tb1q5dantusmmlxqctg33g024d4pyuzgdt87r67nwdpnctflzp5k7kashp25n2',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '0020a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_32 a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_type: 'v0_p2wsh',
                    scriptpubkey_address:
                      'tb1q5dantusmmlxqctg33g024d4pyuzgdt87r67nwdpnctflzp5k7kashp25n2',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '00146b6319a0c9ef575b9e92bda0438cbe9a9416aca4',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 6b6319a0c9ef575b9e92bda0438cbe9a9416aca4',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qdd33ngxfaat4h85jhksy8r97n22pdt9ya8kq55',
                    value: 9999392,
                  },
                ],
                size: 960,
                weight: 1710,
                sigops: 1,
                fee: 470,
                status: {
                  confirmed: true,
                  block_height: 500296,
                  block_hash:
                    '000001da77909552281a6139634c456a47b578bfff3cdd4175d0d8892a1ee625',
                  block_time: 1759319143,
                },
              },
              {
                txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '38b7cece64b5351e591eb0e092e5dfd23fcfa71f82c19cb95492254f81a0495a',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qt5jcal6l5yurghnxwazqg6sfuc76wyw87hm4jc',
                      value: 449999262,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100c6abdce7255dc6911a6a3edb2a09ab9691f188bd021d5ddfd521edb8d1a24f7702201dc89c2d64d89dbaf815b41edb24ac4660a9306d3749ccc8a493c8c5f23e248c01',
                      '029ba6d10920128c471424c083edc0efdefb9f978f4b278d42d7ab43369449f9d9',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2103c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 03c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '00143c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 3c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1q8swe8faa8earh9hnk09au48gp2je940cnt43s8',
                    value: 349998918,
                  },
                ],
                size: 396,
                weight: 1254,
                sigops: 1,
                fee: 344,
                status: {
                  confirmed: true,
                  block_height: 500290,
                  block_hash:
                    '00000145fb629758aa5229d576bfc222be82fba1360facea6be71b85ec7adece',
                  block_time: 1759318843,
                },
              },
            ];

            break;

          case 'tb1pqzhw9vtsw2u6hvw3pcl5nrjsg53ldtqt8uglkcw453afgw3pnuese89z04':
            transactions = [
              {
                txid: '8916ade1db946a586032b0c5f2f4071d299009d6c8e098652a153e3fee9200ee',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '0313ee1718f0684e15d3ac1b47e1f2911dc66db9a19ebebbfc0f1ee03753667d',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '0014cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 cfbe2525829e63638f8f344c7d6e79ce1e3c8503',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qe7lz2fvzne3k8ru0x3x86mneec0repgruyt34k',
                      value: 19662,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100ed078485ccad74f3f8edf357c5edf35736e010af82bda22ea52e7127b5bd55eb02202a610fc5552407d72e00a456f95b69f8c3f37ef6f537b20eb06511c0da09776801',
                      '033ab18fdb0c1d30b5a8b96d2d4f6618f7f948b42e056c13a33a76e861498da16a',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                  {
                    txid: '5d791cb483ea7454ffc729e3f7cbf62b0d80c60a87e0dc0029c52d9352dc37c2',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5918d5393bd26f74097082a873df705ff30d177f',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qtyvd2wfm6fhhgztss2588hmstles69mlym05sd',
                      value: 100000000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100d6471bb43140717930edf2009194ac9b90ef3c5cca5c16074c2b7939c4e96c7d0220632380d2791dad29c8c7900b500033ff6796b1db11490446350328477c94427601',
                      '037bcd672a1bb119d6a48bea407a615c1ac401aba8b174eae51f3910f08dd4c813',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2102d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 02d9698fe69a6db3b85a938666e95e170fd8f279d7f8a9b9d5b94bd83838ad236d',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 f3a60175c4e3d9080b64037bff2e4c442abf49fb58ce365292ce745cd7786105',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p7wnqzawyu0vsszmyqdal7tjvgs4t7j0mtr8rv55jee69e4mcvyzsx3h4r3',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '512008e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 08e52f5b27315285a5dfbb2c6caeb43d56f043376a01274306a04333ed6c0941',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pprjj7ke8x9fgtfwlhvkxet4584t0qsehdgqjwscx5ppn8mtvp9qsdhyf3v',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '512000aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 00aee2b17072b9abb1d10e3f498e504523f6ac0b3f11fb61d5a47a943a219f33',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pqzhw9vtsw2u6hvw3pcl5nrjsg53ldtqt8uglkcw453afgw3pnuese89z04',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '0014fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 fdcf4617553573d422da9a60546c6b0ed6c3a5c5',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qlh85v964x4eaggk6nfs9gmrtpmtv8fw9t8alwn',
                    value: 18936,
                  },
                ],
                size: 545,
                weight: 1526,
                sigops: 2,
                fee: 726,
                status: {
                  confirmed: true,
                  block_height: 500287,
                  block_hash:
                    '000002d4bf3a9018e15c9094995b258bb05b7cb7917544d86a1c0a35404d13bb',
                  block_time: 1759318721,
                },
              },
            ];

            break;

          case 'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m':
            transactions = [
              {
                txid: 'ceedc514eb836b8965424dadf28a8e39875991a457b0aa7692f1cc3a64939383',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                    vout: 3,
                    prevout: {
                      scriptpubkey:
                        '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                      scriptpubkey_asm:
                        'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                      scriptpubkey_type: 'v1_p2tr',
                      scriptpubkey_address:
                        'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
                      value: 29700000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      'a39d3cfc346a3613562ded1912081126659eaa33ce7b3538efe5fac025a39b51f31ac470086628ce93f15eb7101ee81208a15d4e25936fe28e6ef22e1fa2ebae83',
                      '448165641f28b20a88b8f9b2b18c99e20d14a1dc25f9160ea67b7fc2bd5956e819e0bbf2d28c8538fde55c4c349f5df9d4c0c511951d58f68ed7953a0b0d91b283',
                      '205482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96ad202961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323ac',
                      'c09f9aa7a903393a2d6aa6aa744355a25175b7ce04fcd081f04d10802bc90d1003c49af145e8ce96e9bc69ca2f6edf87aa304f5b09b09dc0b2accff4acd0c80add0a6df622e3d58509063fddaf73f4c4662daadb8addb4f7da06e18cb1802a3d56',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                    inner_witnessscript_asm:
                      'OP_PUSHBYTES_32 5482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96 OP_CHECKSIGVERIFY OP_PUSHBYTES_32 2961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323 OP_CHECKSIG',
                  },
                  {
                    txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                    vout: 4,
                    prevout: {
                      scriptpubkey:
                        '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                      scriptpubkey_asm:
                        'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                      scriptpubkey_type: 'v1_p2tr',
                      scriptpubkey_address:
                        'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
                      value: 59400000,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '891b22136b934b1eb7e8550100c8ae4596e060a56f0258cdbd03d33236093d96038bd7ce925330bd31ab0dc38ba902fb7f689f6151ce0caeaf0e24b7f2a9b1d483',
                      '4fd130143ea158ce2f2465600abb16d29f750ce3cc773b122b390e1553d51add7791ad25c613a7889935421656f70385e6c559b86f1913234e0b8a929633737a83',
                      '205482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96ad202961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323ac',
                      'c19f9aa7a903393a2d6aa6aa744355a25175b7ce04fcd081f04d10802bc90d1003c49af145e8ce96e9bc69ca2f6edf87aa304f5b09b09dc0b2accff4acd0c80add67a3b8e965f4529e89fb24b26400a95c378ff27b7454847eab2a995cbfa02c1a',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                    inner_witnessscript_asm:
                      'OP_PUSHBYTES_32 5482bb33ff23fa481dc95814d005a4c1a3a0ec30f1905aaf4eb0558a54d93b96 OP_CHECKSIGVERIFY OP_PUSHBYTES_32 2961e5c79cd565a05471398866c71e40c63731e5445fb27807de993d83d61323 OP_CHECKSIG',
                  },
                  {
                    txid: '584bac2e78087c05e88413028af995e2e51e775ffe95ce74ca6626508e96552a',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '001469867017ca8c261dfed9882b0d3a7c6fa6cb46bb',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 69867017ca8c261dfed9882b0d3a7c6fa6cb46bb',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qdxr8q9723snpmlke3q4s6wnud7nvk34m5vv794',
                      value: 9999862,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100f79599d91819dc6a2d356be1ef3bb4b5b5d0b3afbed00c95a69b212967f38f570220358e5a82766a413e7fd34deb20fd8819d45b328755abfaf80f9a5b694d17c10501',
                      '02602fab7517860ea10e3aa346570b18fd09b3c93be53a3beb6d7760a075a6f972',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '0020a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_32 a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_type: 'v0_p2wsh',
                    scriptpubkey_address:
                      'tb1q5dantusmmlxqctg33g024d4pyuzgdt87r67nwdpnctflzp5k7kashp25n2',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '0020a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_32 a37b35f21bdfcc0c2d118a1eaab6a1270486acfe1ebd373433c2d3f10696f5bb',
                    scriptpubkey_type: 'v0_p2wsh',
                    scriptpubkey_address:
                      'tb1q5dantusmmlxqctg33g024d4pyuzgdt87r67nwdpnctflzp5k7kashp25n2',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '00146b6319a0c9ef575b9e92bda0438cbe9a9416aca4',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 6b6319a0c9ef575b9e92bda0438cbe9a9416aca4',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qdd33ngxfaat4h85jhksy8r97n22pdt9ya8kq55',
                    value: 9999392,
                  },
                ],
                size: 960,
                weight: 1710,
                sigops: 1,
                fee: 470,
                status: {
                  confirmed: true,
                  block_height: 500296,
                  block_hash:
                    '000001da77909552281a6139634c456a47b578bfff3cdd4175d0d8892a1ee625',
                  block_time: 1759319143,
                },
              },
              {
                txid: 'c2d10fdffd19eadf6006b349065230fbeac0ccf8162433167fdb1b30a81220e8',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '38b7cece64b5351e591eb0e092e5dfd23fcfa71f82c19cb95492254f81a0495a',
                    vout: 0,
                    prevout: {
                      scriptpubkey:
                        '00145d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_asm:
                        'OP_0 OP_PUSHBYTES_20 5d258eff5fa138345e667744046a09e63da711c7',
                      scriptpubkey_type: 'v0_p2wpkh',
                      scriptpubkey_address:
                        'tb1qt5jcal6l5yurghnxwazqg6sfuc76wyw87hm4jc',
                      value: 449999262,
                    },
                    scriptsig: '',
                    scriptsig_asm: '',
                    witness: [
                      '3045022100c6abdce7255dc6911a6a3edb2a09ab9691f188bd021d5ddfd521edb8d1a24f7702201dc89c2d64d89dbaf815b41edb24ac4660a9306d3749ccc8a493c8c5f23e248c01',
                      '029ba6d10920128c471424c083edc0efdefb9f978f4b278d42d7ab43369449f9d9',
                    ],
                    is_coinbase: false,
                    sequence: 4294967295,
                  },
                ],
                vout: [
                  {
                    scriptpubkey:
                      '001403ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 03ebdb64586d1e9cff7827e627e8ae5b2b8f8ec9',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1qq04akezcd50felmcylnz069wtv4clrkfv9h87k',
                    value: 1000000,
                  },
                  {
                    scriptpubkey:
                      '6a2103c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_asm:
                      'OP_RETURN OP_PUSHBYTES_33 03c33141e9af74927eb6aa5409069a23ddd465fed0323c37220acb48bf98b4e8c3',
                    scriptpubkey_type: 'op_return',
                    value: 0,
                  },
                  {
                    scriptpubkey:
                      '5120c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 c6a661be95c2db308e9b0bebb1f61e0b5ae3edb7bff135cd5d5d38b6ded2436b',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pc6nxr054ctdnpr5mp04mras7pddw8mdhhlcntn2at5utdhkjgd4sjdv3v9',
                    value: 9900000,
                  },
                  {
                    scriptpubkey:
                      '51201968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 1968326e64e90606c5c1cc0f2fe96a1cad69ec244da60cd0f4cc19d38ac0e34c',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1pr95rymnyayrqd3wpes8jl6t2rjkknmpyfknqe585esva8zkqudxq209crz',
                    value: 29700000,
                  },
                  {
                    scriptpubkey:
                      '5120a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_asm:
                      'OP_PUSHNUM_1 OP_PUSHBYTES_32 a14c7889af3de80d361a614298620e459943975111180602ca39a0621b63f362',
                    scriptpubkey_type: 'v1_p2tr',
                    scriptpubkey_address:
                      'tb1p59x83zd08h5q6ds6v9pfscswgkv58963zyvqvqk28xsxyxmr7d3qxfcz4m',
                    value: 59400000,
                  },
                  {
                    scriptpubkey:
                      '00143c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_asm:
                      'OP_0 OP_PUSHBYTES_20 3c1d93a7bd3e7a3b96f3b3cbde54e80aa592d5f8',
                    scriptpubkey_type: 'v0_p2wpkh',
                    scriptpubkey_address:
                      'tb1q8swe8faa8earh9hnk09au48gp2je940cnt43s8',
                    value: 349998918,
                  },
                ],
                size: 396,
                weight: 1254,
                sigops: 1,
                fee: 344,
                status: {
                  confirmed: true,
                  block_height: 500290,
                  block_hash:
                    '00000145fb629758aa5229d576bfc222be82fba1360facea6be71b85ec7adece',
                  block_time: 1759318843,
                },
              },
            ];

            break;

          default:
            break;
        }

        return Promise.resolve(transactions as IEsploraApi.Transaction[]);
      });

    for (const vout of vouts) {
      const stats = await getAdvancedProjectStats(vout);

      advancedStats.amountSpentSoFarByFounder +=
        stats.amountSpentSoFarByFounder;
      advancedStats.amountInPenalties += stats.amountInPenalties;
      advancedStats.countInPenalties += stats.countInPenalties;
    }

    expect(advancedStats.amountSpentSoFarByFounder).toEqual(
      expectedStats.amountSpentSoFarByFounder
    );
    expect(advancedStats.amountInPenalties).toEqual(
      expectedStats.amountInPenalties
    );
    expect(advancedStats.countInPenalties).toEqual(
      expectedStats.countInPenalties
    );
  });
});

const filteredVouts: AngorVout[][] = [
  [
    {
      value: 100000000,
      spent: true,
      spendingTxId: 'spendingTrx1',
      investmentTxId: 'investmentTrx1',
      isLast: false,
    },
    {
      value: 300000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1',
      isLast: false,
    },
    {
      value: 600000000,
      spent: true,
      spendingTxId: 'spendingTrx2',
      investmentTxId: 'investmentTrx1',
      isLast: true,
      childVouts: [
        {
          scriptpubkey: 'test1',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
          value: 600000000,
        },
      ],
    },
  ],
  [
    {
      value: 250000000,
      spent: true,
      spendingTxId: 'spendingTrx3',
      investmentTxId: 'investmentTrx2',
      isLast: false,
    },
    {
      value: 750000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2',
      isLast: false,
    },
    {
      value: 1500000000,
      spent: true,
      spendingTxId: 'spendingTrx4',
      investmentTxId: 'investmentTrx2',
      isLast: true,
      childVouts: [
        {
          scriptpubkey: 'test2',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
          value: 750000000,
        },
        {
          scriptpubkey: 'test3',
          scriptpubkey_asm:
            'OP_0 OP_PUSHBYTES_20 56328c008777db36eb08d56d1f5b579fdcb94e85',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1q2cegcqy8wldnd6cg64k37k6hnlwtjn596xjag7',
          value: 750000000,
        },
      ],
    },
  ],
];

const voutsTally: Record<string, StatsTally> = {
  'investmentTrx1-spendingTrx1': {
    totalAmount: 100000000,
    numberOfTx: 1,
  },
  'investmentTrx1-spendingTrx2': {
    totalAmount: 900000000,
    numberOfTx: 2,
  },
  'investmentTrx2-spendingTrx3': {
    totalAmount: 250000000,
    numberOfTx: 1,
  },
  'investmentTrx2-spendingTrx4': {
    totalAmount: 750000000,
    numberOfTx: 1,
  },
  'investmentTrx2-1500000000-spendingTrx4': {
    totalAmount: 1500000000,
    numberOfTx: 1,
  },
};
