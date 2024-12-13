import {
  AngorTransactionDecoder,
  AngorSupportedNetworks,
  AngorTransactionStatus,
} from '../AngorTransactionDecoder';
import * as bitcoinJS from 'bitcoinjs-lib';
import AngorProjectRepository from '../../repositories/AngorProjectRepository';
import AngorInvestmentRepository from '../../repositories/AngorInvestmentRepository';
import DB from '../../database';

describe('AngorTransactionDecoder', () => {
  describe('Decoding transaction for Angor project creation', () => {
    const data = {
      transactionHex:
        '0100000000010138de40ff6a3d27c33d5b84edf8f35911d819c9c547689cc4da6c5603bc3b26990000000000ffffffff0310270000000000001600144282ccfe323dbba535ccdfc8b66aeeb0bd7dd95b0000000000000000446a210352eb18befb145fef4b5c24513608183d7c3d8004d5fcad9e0e6dc2e89a0af6ae20c749d81fc42037e5b9f7b32ae266cbce75019ce6771be6877d3c509e97e39c14669b052a0100000016001431e5c2bdb361b68eb243ec7dbd46bd7cf71a1d86024730440220075dd33e3809a58423257bf23f5632e305387c283f48dfdce7f355787be33d8002201072fa636fb6bad35ac9d7f8e35fb41eea47de8b38346dc4f123260e9c74c3b401210385143acd30d6d05a5bf35ef1028ce4c50eadffa14670716976007fec5ed3e58500000000',
      founderKeyHex:
        '0352eb18befb145fef4b5c24513608183d7c3d8004d5fcad9e0e6dc2e89a0af6ae',
      founderKeyHashHex:
        'cacedcee9bc28a37b36718ea210fcf7caac182cdb66cc17fafb6027478a221c8',
      founderKeyHashInt: 2023891400,
      projectIdDeriviation: 1011945700,
      projectId: 'angor1qg2pvel3j8ka62dwvmlytv6hwkz7hmk2mms7qll',
      nPub: 'c749d81fc42037e5b9f7b32ae266cbce75019ce6771be6877d3c509e97e39c14',
      addressOnFeeOutput: 'tb1qg2pvel3j8ka62dwvmlytv6hwkz7hmk2m0ncfee',
      txid: '00b78119bb6eff9f64b2d29948ddd830f405b18dfdb802a3ec2df4eacfcd1f40',
      blockHeight: 40000,
    };

    const angorDecoder = new AngorTransactionDecoder(
      data.transactionHex,
      AngorSupportedNetworks.Testnet
    );

    describe('constructor', () => {
      it('should create transaction object from transaction hex', () => {
        expect(angorDecoder['transaction'].ins.length).toBeGreaterThanOrEqual(
          1
        );
        expect(angorDecoder['transaction'].outs.length).toEqual(3);
      });
    });

    describe('validateProjectCreationTransaction', () => {
      it('should throw an error if transaction object was not created', () => {
        const angorDecoderWithInvalidTransaction = new AngorTransactionDecoder(
          data.transactionHex,
          AngorSupportedNetworks.Testnet
        );
        angorDecoderWithInvalidTransaction['transaction'] = null as any;

        expect(() =>
          angorDecoderWithInvalidTransaction[
            'validateProjectCreationTransaction'
          ]()
        ).toThrow(new Error(`Transaction object wasn't created.`));
      });

      it('should throw an error if inputs are not present in transaction object', () => {
        const angorDecoderWithInvalidTransaction = new AngorTransactionDecoder(
          data.transactionHex,
          AngorSupportedNetworks.Testnet
        );
        const invalidTransaction = JSON.parse(
          JSON.stringify(angorDecoderWithInvalidTransaction['transaction'])
        );

        delete invalidTransaction.ins;

        angorDecoderWithInvalidTransaction['transaction'] = invalidTransaction;

        expect(() =>
          angorDecoderWithInvalidTransaction[
            'validateProjectCreationTransaction'
          ]()
        ).toThrow(new Error(`Transaction object doesn't have inputs.`));
      });

      it('should throw an error if inputs array is empty', () => {
        const angorDecoderWithInvalidTransaction = new AngorTransactionDecoder(
          data.transactionHex,
          AngorSupportedNetworks.Testnet
        );
        const invalidTransaction = JSON.parse(
          JSON.stringify(angorDecoderWithInvalidTransaction['transaction'])
        );

        invalidTransaction.ins = [];

        angorDecoderWithInvalidTransaction['transaction'] = invalidTransaction;

        expect(() =>
          angorDecoderWithInvalidTransaction[
            'validateProjectCreationTransaction'
          ]()
        ).toThrow(
          new Error(`Transaction object has invalid amount of inputs.`)
        );
      });

      it('should throw an error if outputs are not present in transaction object', () => {
        const angorDecoderWithInvalidTransaction = new AngorTransactionDecoder(
          data.transactionHex,
          AngorSupportedNetworks.Testnet
        );
        const invalidTransaction = JSON.parse(
          JSON.stringify(angorDecoderWithInvalidTransaction['transaction'])
        );

        delete invalidTransaction.outs;

        angorDecoderWithInvalidTransaction['transaction'] = invalidTransaction;

        expect(() =>
          angorDecoderWithInvalidTransaction[
            'validateProjectCreationTransaction'
          ]()
        ).toThrow(new Error(`Transaction object doesn't have outputs.`));
      });

      it('should throw an error if inputs array is empty', () => {
        const angorDecoderWithInvalidTransaction = new AngorTransactionDecoder(
          data.transactionHex,
          AngorSupportedNetworks.Testnet
        );
        const invalidTransaction = JSON.parse(
          JSON.stringify(angorDecoderWithInvalidTransaction['transaction'])
        );

        invalidTransaction.outs.pop();

        angorDecoderWithInvalidTransaction['transaction'] = invalidTransaction;

        expect(() =>
          angorDecoderWithInvalidTransaction[
            'validateProjectCreationTransaction'
          ]()
        ).toThrow(
          new Error(`Transaction object has invalid amount of outputs.`)
        );
      });
    });

    describe('decodeAndStoreProjectCreationTransaction', () => {
      it('should call $setProject method of AngorProjectRepository', async () => {
        const setProjectSpy = jest
          .spyOn(AngorProjectRepository, '$setProject')
          .mockImplementation(() => Promise.resolve());

        const updateInvestmentStatusSpy = jest
          .spyOn(AngorInvestmentRepository, '$updateInvestmentsStatus')
          .mockImplementation(() => Promise.resolve());

        const transactionStatus = AngorTransactionStatus.Confirmed;

        const {
          projectId,
          nPub,
          addressOnFeeOutput,
          founderKeyHex,
          txid,
          blockHeight,
        } = data;

        await angorDecoder.decodeAndStoreProjectCreationTransaction(
          transactionStatus,
          blockHeight
        );

        expect(setProjectSpy).toHaveBeenCalledWith(
          projectId,
          nPub,
          addressOnFeeOutput,
          transactionStatus,
          founderKeyHex,
          txid,
          blockHeight
        );

        expect(updateInvestmentStatusSpy).toHaveBeenCalledWith(
          addressOnFeeOutput,
          transactionStatus
        );
      });
    });

    describe('decompileProjectCreationOpReturnScript', () => {
      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return 2 chunks', () => {
        const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();

        expect(chunks.length).toEqual(2);

        chunks.forEach((chunk) => expect(typeof chunk).toEqual('string'));
      });

      it('should throw an error if script decompilation failed', () => {
        jest
          .spyOn(bitcoinJS.script, 'decompile')
          .mockImplementation(() => null);

        expect(() =>
          angorDecoder['decompileProjectCreationOpReturnScript']()
        ).toThrow(new Error(`Script decompilation failed.`));
      });
    });

    describe('getFounderKey', () => {
      it('should return founder key in hex encoding', () => {
        const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();

        expect(angorDecoder['getFounderKeyHex'](chunks)).toEqual(
          data.founderKeyHex
        );
      });
    });

    describe('getKeyHash', () => {
      it('should return founder key hash in hex encoding', () => {
        const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();
        const keyHex = angorDecoder['getFounderKeyHex'](chunks);

        expect(angorDecoder['getKeyHash'](keyHex)).toEqual(
          data.founderKeyHashHex
        );
      });
    });

    describe('hashToInt', () => {
      it('should return integer representation of founder key hash', () => {
        const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();
        const keyHex = angorDecoder['getFounderKeyHex'](chunks);
        const keyHash = angorDecoder['getKeyHash'](keyHex);

        expect(angorDecoder['hashToInt'](keyHash)).toEqual(
          data.founderKeyHashInt
        );
      });
    });

    describe('getProjectIdDerivation', () => {
      const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();
      const keyHex = angorDecoder['getFounderKeyHex'](chunks);

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return project id dereviation', () => {
        const keyHash = angorDecoder['getKeyHash'](keyHex);
        const keyHashInt = angorDecoder['hashToInt'](keyHash);

        expect(angorDecoder['getProjectIdDerivation'](keyHashInt)).toEqual(
          data.projectIdDeriviation
        );
      });

      it('should throw an error if the retention is greater than 2 in power of 31', () => {
        jest
          .spyOn(angorDecoder as any, 'hashToInt')
          .mockImplementation(() => Math.pow(2, 31) * 2 + 2);

        const keyHash = angorDecoder['getKeyHash'](keyHex);
        const keyHashInt = angorDecoder['hashToInt'](keyHash);

        expect(() =>
          angorDecoder['getProjectIdDerivation'](keyHashInt)
        ).toThrow(
          new Error(
            `Retention is too large. The max number is 2^31 (2,147,483,648).`
          )
        );
      });
    });

    describe('getProjectId', () => {
      it('should return project id', () => {
        const chunks = angorDecoder['decompileProjectCreationOpReturnScript']();
        const keyHex = angorDecoder['getFounderKeyHex'](chunks);
        const keyHash = angorDecoder['getKeyHash'](keyHex);
        const keyHashInt = angorDecoder['hashToInt'](keyHash);
        const projectIdDerivation =
          angorDecoder['getProjectIdDerivation'](keyHashInt);

        expect(angorDecoder['getProjectId'](projectIdDerivation)).toEqual(
          data.projectId
        );
      });
    });

    describe('getNostrPubKey', () => {
      it('should return Nostr public key', () => {
        expect(angorDecoder['getNostrPubKey']()).toEqual(data.nPub);
      });
    });
  });

  describe('Decoding investment transaction for Angor project', () => {
    const data = {
      transactionHex:
        '010000000001017bdbff3cb9461c9d299af512baa2f9c6b0db157376a688ff1b09ae6692d113100200000000ffffffff0680841e0000000000160014060978a8f215edcb42b8a571922e691df2e6905e0000000000000000236a2102e6c8752b2fe17ccda2d77d199bfa0f6c7e5cd5190fb6a93bf10a2f3d67be48cd002d31010000000022512074d1d487eafc15e7237ba317aafd5179933ec8e0b852c0a814e15c9d95310a8a00879303000000002251206a4f6fc475c98868646c8fcee1efb07d9e193a0525daf4ccf001a22a74e9a7c5000e27070000000022512038baa923ce2e6412a90e29cf0989900e003158e181e5dc5a96e36db795888cf8ac48fb1d01000000160014885d29c290b21db178d7778754706bd6030340710248304502210096d00e38fa85c6ea50276354c5d3d10040444cb933eb595341a18d05301582b202205864116b6159140ea0dcf9010b9126bd06bbf7f6f842031a22abbdf450224dc8012103e1bd9cd9175250059f88f0dca122c5ce16a15cefed5019d674a29c31203f53cd00000000',
      transactionId:
        'd066cdecd4064f368411cf0b0bc8ebbc1265937c78867eebaf44b042ccb691e8',
      feeAmount: 2000000,
      addressOnFeeOutput: 'tb1qqcyh328jzhkuks4c54ceytnfrhewdyz7jqfz2a',
      founderPubKey:
        '02e6c8752b2fe17ccda2d77d199bfa0f6c7e5cd5190fb6a93bf10a2f3d67be48cd',
    };

    const angorDecoder = new AngorTransactionDecoder(
      data.transactionHex,
      AngorSupportedNetworks.Testnet
    );
    const transactionStatus = AngorTransactionStatus.Confirmed;

    describe('decodeAndStoreInvestmentTransaction', () => {
      it('should call $getProject method of AngorProjectRepository', async () => {
        const getProjectSpy = jest
          .spyOn(
          AngorProjectRepository,
          '$getProjectByAddressOnFeeOutput'
        )
          .mockImplementation(() => Promise.resolve(undefined));

        await angorDecoder.decodeAndStoreInvestmentTransaction(
          transactionStatus
        );

        const { addressOnFeeOutput } = data;

        expect(getProjectSpy).toHaveBeenCalledWith(addressOnFeeOutput);
      });

      it('should call $setInvestment method of AngorInvestmentRepository', async () => {
        jest
          .spyOn(AngorProjectRepository, '$getProjectByAddressOnFeeOutput')
          .mockImplementation(() =>
            Promise.resolve({
              founder_key: '',
              npub: '',
              id: '',
              created_on_block: 1,
              txid: '',
            })
          );

        const setInvestmentSpy = jest.spyOn(
          AngorInvestmentRepository,
          '$setInvestment'
        )
          .mockImplementation(() => Promise.resolve());

        await angorDecoder.decodeAndStoreInvestmentTransaction(
          transactionStatus
        );

        const { transactionId, feeAmount, addressOnFeeOutput, founderPubKey } =
          data;

        expect(setInvestmentSpy).toHaveBeenCalledWith(
          transactionId,
          feeAmount * 100,
          addressOnFeeOutput,
          transactionStatus,
          founderPubKey,
          undefined,
          undefined
        );
      });
    });

    describe('decompileInvestmentOpReturnScript', () => {
      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return 1 chunk with Buffer length equal to 33', () => {
        const chunks = angorDecoder['decompileInvestmentOpReturnScript']();

        expect(chunks.length).toEqual(1);

        chunks.forEach((chunk) => {
          expect(typeof chunk).toEqual('string');

          expect(Buffer.from(chunk, 'hex').byteLength).toEqual(33);
        });
      });

      it('should throw an error if script decompilation failed', () => {
        jest
          .spyOn(bitcoinJS.script, 'decompile')
          .mockImplementation(() => null);

        expect(() =>
          angorDecoder['decompileProjectCreationOpReturnScript']()
        ).toThrow(new Error(`Script decompilation failed.`));
      });
    });
  });
});
