import * as bitcoinJS from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as tinySecp256k1 from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import crypto from 'crypto';
import { bech32 } from 'bech32';
import AngorProjectRepository, {
  Project,
} from '../repositories/AngorProjectRepository';
import AngorInvestmentRepository from '../repositories/AngorInvestmentRepository';

/**
 * Represents a Bitcoin network.
 * Supports Bitcoin and Bitcoin Testnet.
 */
export enum AngorSupportedNetworks {
  Testnet = 'testnet',
  Bitcoin = 'bitcoin',
}

export enum AngorTransactionStatus {
  NotIdentified = 'notIdentified',
  Pending = 'pending',
  Confirmed = 'confirmed',
}

/**
 * Represents a transaction related to the project at Angor platform (https://angor.io).
 */
export class AngorTransactionDecoder {
  private transaction: bitcoinJS.Transaction;
  private network: bitcoinJS.Network;
  private angorKeys = {
    [AngorSupportedNetworks.Testnet]:
      'tpubD8JfN1evVWPoJmLgVg6Usq2HEW9tLqm6CyECAADnH5tyQosrL6NuhpL9X1cQCbSmndVrgLSGGdbRqLfUbE6cRqUbrHtDJgSyQEY2Uu7WwTL',
    [AngorSupportedNetworks.Bitcoin]:
      'xpub661MyMwAqRbcGNxKe9aFkPisf3h32gHLJm8f9XAqx8FB1Nk6KngCY8hkhGqxFr2Gyb6yfUaQVbodxLoC1f3K5HU9LM1CXE59gkEXSGCCZ1B',
  };
  private angorKey: string;

  /**
   * Constructs Angor transaction for the project creation.
   * @param transactionHex - hex of the raw transaction.
   * @param network - bitcoin network.
   */
  constructor(transactionHex: string, network: AngorSupportedNetworks) {
    this.transaction = bitcoinJS.Transaction.fromHex(transactionHex);

    this.network = bitcoinJS.networks[network];
    this.angorKey = this.angorKeys[network];
  }

  /**
   * Decode and store transaction as Angor project creation transaction.
   * If transaction is not an Angor project creation transaction, an error will be thrown.
   * @param transactionStatus - status of the transaction.
   * @param createdOnBlock - block height(optional).
   */
  public async decodeAndStoreProjectCreationTransaction(
    transactionStatus: AngorTransactionStatus,
    createdOnBlock?: number
  ): Promise<void> {
    this.validateProjectCreationTransaction();

    const chunks = this.decompileProjectCreationOpReturnScript();
    const founderKeyHex = this.getFounderKeyHex(chunks);
    const founderKeyHash = this.getKeyHash(founderKeyHex);
    const founderKeyHashInt = this.hashToInt(founderKeyHash);
    const projectIdDerivation = this.getProjectIdDerivation(founderKeyHashInt);
    const projectId = this.getProjectId(projectIdDerivation);
    const nostrEventId = this.getNostrEventId();
    const addressOnFeeOutput = this.getAddressOnFeeOutput();
    const txid = this.transaction.getId();

    // Store Angor project in the DB.
    await this.storeProjectInfo(
      projectId,
      addressOnFeeOutput,
      transactionStatus,
      founderKeyHex,
      txid,
      createdOnBlock,
      nostrEventId
    );

    // If transaction is confirmed (in the block), update statuses
    // of the investment transactions related to this project.
    if (transactionStatus === AngorTransactionStatus.Confirmed) {
      await this.updateInvestmentsStatus(
        addressOnFeeOutput,
        AngorTransactionStatus.Confirmed
      );
    }
  }

  /**
   * Decode and store transaction as Angor investment transaction.
   * If transaction is not an Angor investment transaction, an error will be thrown.
   * @param transactionStatus - status of the transaction.
   * @param createdOnBlock - block height(optional).
   */
  public async decodeAndStoreInvestmentTransaction(
    transactionStatus: AngorTransactionStatus,
    createdOnBlock?: number
  ): Promise<void> {
    this.validateInvestmentTransaction();

    const addressOnFeeOutput = this.getAddressOnFeeOutput();

    // Get Angor project with the same address on fee output.
    const project = await this.getProject(addressOnFeeOutput);

    // Return of there is no Angor project with the same address on fee output.
    if (!project) {
      return;
    }

    const txid = this.transaction.getId();
    // This amount is Angor's fee(1%), so to get actual investment amount it has to be multiplied by 100
    const amount = this.transaction.outs[0].value * 100;
    const [investorPubKey, secretHash] =
      this.decompileInvestmentOpReturnScript();

    // Store Angor investment in the DB.
    await this.storeInvestmentInfo(
      txid,
      amount,
      addressOnFeeOutput,
      transactionStatus,
      investorPubKey,
      secretHash,
      createdOnBlock
    );
  }

  /**
   * Validates transaction object.
   */
  private validateProjectCreationTransaction(): void {
    const { transaction } = this;

    // Throw an error if transaction object is not present.
    if (!transaction) {
      throw new Error(`Transaction object wasn't created.`);
    }

    // Throw an error if transaction inputs are not present.
    if (!transaction.ins) {
      throw new Error(`Transaction object doesn't have inputs.`);
    }
    // Throw an error if the amount of transaction inputs is less than 1.
    else if (transaction.ins.length < 1) {
      throw new Error(`Transaction object has invalid amount of inputs.`);
    }

    // Throw an error if transaction outputs are not present.
    if (!transaction.outs) {
      throw new Error(`Transaction object doesn't have outputs.`);
    }
    // Throw an error if the amount of transaction outputs is not equal to 3.
    else if (transaction.outs.length !== 3) {
      throw new Error(`Transaction object has invalid amount of outputs.`);
    }
  }

  /**
   * Validates transaction object.
   */
  private validateInvestmentTransaction(): void {
    const { transaction } = this;

    // Throw an error if transaction object is not present.
    if (!transaction) {
      throw new Error(`Transaction object wasn't created.`);
    }

    // Throw an error if transaction outputs are not present.
    if (!transaction.outs) {
      throw new Error(`Transaction object doesn't have outputs.`);
    }
    // Throw an error if the amount of transaction outputs is not equal to 3.
    else if (transaction.outs.length < 1) {
      throw new Error(`Transaction object has invalid amount of outputs.`);
    }
  }

  /**
   * Fetches Angor project by address on fee output from the DB.
   * @param address - address on fee output.
   * @returns - promise that resolves into Angor project or undefined.
   */
  private async getProject(address): Promise<Project | undefined> {
    const project =
      await AngorProjectRepository.$getProjectByAddressOnFeeOutput(address);

    if (project) {
      return project;
    }

    return undefined;
  }

  /**
   * Decompiles (splits into chunks) OP_RETURN script of the project creation transaction.
   * @param transaction - an object representing bitcoin transaction.
   * @returns - an array of strings representing script chunks.
   */
  private decompileProjectCreationOpReturnScript(): string[] {
    const { transaction } = this;

    const script: Buffer = transaction.outs[1].script;

    // Decompiled is an array of Buffers.
    const decompiled = bitcoinJS.script.decompile(script);

    const errorBase = `Script decompilation failed.`;

    if (!decompiled) {
      throw new Error(errorBase);
    }

    // Converts decompiled OP_RETURN script into an ASM (Assembly) string
    // representation and splits this string into chunks.
    const chunks = bitcoinJS.script.toASM(decompiled).split(' ');

    // Throw an error if the chunks amount is incorrect.
    if (chunks.length !== 4) {
      throw new Error(`${errorBase} Wrong chunk amount.`);
    }

    // Throw an error if the first chunk is not OP_RETURN.
    if (chunks[0] !== 'OP_RETURN') {
      throw new Error(`${errorBase} Wrong OP_RETURN chunk.`);
    }

    // Throw an error if the byte length of the second chunk is not 33.
    if (Buffer.from(chunks[1], 'hex').byteLength !== 33) {
      throw new Error(`${errorBase} Wrong founder pubkey chunk.`);
    }

    // Throw an error if the byte length of the third chunk is not 32.
    if (Buffer.from(chunks[2], 'hex').byteLength !== 2) {
      throw new Error(`${errorBase} Wrong key type chunk.`);
    }

    if (Buffer.from(chunks[3], 'hex').byteLength !== 32) {
      throw new Error(`${errorBase} Wrong nostr event ID chunk.`);
    }

    // Remove the first chunk (OP_RETURN) as it is not useful anymore.
    chunks.splice(0, 1);

    return chunks;
  }

  /**
   * Decompiles (splits into chunks) OP_RETURN script of the investment transaction.
   * @param transaction - an object representing bitcoin transaction.
   * @returns - an array of strings representing script chunks.
   */
  private decompileInvestmentOpReturnScript(): string[] {
    const { transaction } = this;

    const script: Buffer = transaction.outs[1].script;

    // Decompiled is an array of Buffers.
    const decompiled = bitcoinJS.script.decompile(script);

    const errorBase = `Script decompilation failed.`;

    if (!decompiled) {
      throw new Error(errorBase);
    }

    // Converts decompiled OP_RETURN script into an ASM (Assembly) string
    // representation and splits this string into chunks.
    const chunks = bitcoinJS.script.toASM(decompiled).split(' ');

    // Throw an error if the chunks amount is incorrect.
    if (chunks.length < 2) {
      throw new Error(`${errorBase} Wrong chunk amount.`);
    }

    // Throw an error if the first chunk is not OP_RETURN.
    if (chunks[0] !== 'OP_RETURN') {
      throw new Error(`${errorBase} Wrong first chunk.`);
    }

    // Throw an error if the byte length of the second chunk is not 33.
    if (Buffer.from(chunks[1], 'hex').byteLength !== 33) {
      throw new Error(`${errorBase} Wrong second chunk.`);
    }

    // Throw an error if third chunk is present and the its byte length is not 32.
    if (chunks[2] && Buffer.from(chunks[2], 'hex').byteLength !== 32) {
      throw new Error(`${errorBase} Wrong third chunk.`);
    }

    // Remove the first chunk (OP_RETURN) as it is not useful anymore.
    chunks.splice(0, 1);

    return chunks;
  }

  /**
   * Sets the founder key of the Angor project in Hex encoding.
   * @returns - string representing founder key in Hex encoding
   */
  private getFounderKeyHex(chunks: string[]): string {
    const founderKeyBuffer = Buffer.from(chunks[0], 'hex');
    const founderECpair = ECPairFactory(tinySecp256k1).fromPublicKey(
      founderKeyBuffer,
      {
        network: this.network,
      }
    ); // SECP256k1 elliptic curve key pair
    const founderPublicKeyHex = founderECpair.publicKey.toString('hex');

    return founderPublicKeyHex;
  }

  /**
   * Sets the hash of the founder key.
   * @param key - founder key in Hex encoding.
   * @returns - string representing founder key hash.
   */
  private getKeyHash(key: string): string {
    // SHA-256 hash of the founder key.
    const firstHash = bitcoinJS.crypto.sha256(Buffer.from(key, 'hex'));
    // SHA-256 hash of the founder key hash.
    const secondHash = bitcoinJS.crypto.sha256(Buffer.from(firstHash));
    // ArrayBufferLike representation of the second hash buffer in reversed order.
    const secondHashArrayBuffer = new Uint8Array(secondHash).reverse().buffer;
    // Hash of the founder key in Hex encoding.
    const founderKeyHash = Buffer.from(secondHashArrayBuffer).toString('hex');

    return founderKeyHash;
  }

  /**
   * Casts hash to an integer.
   * @param hash - founder key hash in Hex encoding.
   * @returns - founder key hash casted to an integer.
   */
  private hashToInt(hash: string): number {
    const hashBuffer = Buffer.from(hash, 'hex');
    // Read an unsigned, big-endian 32-bit integer from the hash of the founder key
    // using 28 as an offset. The offset is used to match the result of
    // uint256.GetLow32() function in C#.
    const hashUint = hashBuffer.readUInt32BE(28);

    return hashUint;
  }

  /**
   * Provides project id derivation.
   * @returns an integer that is derived from integer representation of founder key hash.
   */
  private getProjectIdDerivation(founderKeyHashInt: number): number {
    const intMaxValue = 0x7FFFFFFF;

    const retention = founderKeyHashInt & intMaxValue;

    if (retention > Math.pow(2, 31)) {
      throw new Error(
        `Retention is too large. The max number is 2^31 (2,147,483,648).`
      );
    }

    return retention;
  }

  /**
   * Sets Angor project id.
   * @returns - string representing Angor project id.
   */
  private getProjectId(projectIdDerivation: number): string {
    // BIP32 (Bitcoin Improvement Proposal 32) extended public key created
    // based on the angor key and the network.
    const extendedPublicKey = BIP32Factory(tinySecp256k1).fromBase58(
      this.angorKey,
      this.network
    );
    // Derived Angor public key.
    const angorPublicKey =
      extendedPublicKey.derive(projectIdDerivation).publicKey;

    // SHA-256 digest of the Angor public key in Hex encoding.
    const sha256Digest = crypto
      .createHash('sha256')
      // @ts-ignore: crypto issue casting Buffer ro crypto.BinaryLike type
      .update(angorPublicKey, 'hex')
      .digest('hex');
    // RIPEMD-160 digest in Hex encoding of the SHA-256 digest created
    // from the Angor public key.
    const ripemd160Digest = crypto
      .createHash('ripemd160')
      .update(sha256Digest, 'hex')
      .digest('hex');

    // Bech32 words representation of the RIPEMD-160 digest.
    const bech32Words = bech32.toWords(Buffer.from(ripemd160Digest, 'hex'));
    // Bech32 words represented as an array of unsigned 8-bit integers
    const words = new Uint8Array([0, ...bech32Words]);

    // Bech 32 encoded word using 'angor' prefix
    const projectID = bech32.encode('angor', words);

    return projectID;
  }

  /**
   * Sets Nostr event id.
   * @return - string representing the Nostr event ID associated with the current Angor project.
   * @private
   */
  private getNostrEventId(): string {
    const chunks = this.decompileProjectCreationOpReturnScript();
    return chunks[2];
  }

  /**
   * Provides address on fee output of project creation transaction.
   * @returns - string that represents address on fee output.
   */
  private getAddressOnFeeOutput(): string {
    const script: Buffer = this.transaction.outs[0].script;
    const address = bitcoinJS.address.fromOutputScript(script, this.network);

    return address;
  }

  /**
   * Stores Angor project into the DB.
   * @param projectId - project ID.
   * @param nostrPubKey - Nostr public key of the project.
   * @param addressOnFeeOutput - address on fee output.
   * @param transactionStatus - status of the transaction.
   */
  private async storeProjectInfo(
    projectId: string,
    addressOnFeeOutput: string,
    transactionStatus: AngorTransactionStatus,
    founderKey: string,
    txid: string,
    createdOnBlock?: number,
    nostrEventId?: string
  ): Promise<void> {
    await AngorProjectRepository.$setProject(
      projectId,
      addressOnFeeOutput,
      transactionStatus,
      founderKey,
      txid,
      createdOnBlock,
      nostrEventId
    );
  }

  /**
   *  Stores Angor investment into the DB.
   * @param txid - transaction ID.
   * @param amount - transaction amount in sats.
   * @param addressOnFeeOutput - address on fee output.
   * @param transactionStatus - status of the transaction.
   */
  private async storeInvestmentInfo(
    txid: string,
    amount: number,
    addressOnFeeOutput: string,
    transactionStatus: AngorTransactionStatus,
    investorPubKey: string,
    secretHash?: string,
    createdOnBlock?: number
  ): Promise<void> {
    await AngorInvestmentRepository.$setInvestment(
      txid,
      amount,
      addressOnFeeOutput,
      transactionStatus,
      investorPubKey,
      secretHash,
      createdOnBlock
    );
  }

  /**
   * Updates statuses of the transactions filtered by address on fee output.
   * @param addressOnFeeOutput - address on fee output.
   * @param transactionStatus - transaction status.
   */
  private async updateInvestmentsStatus(
    addressOnFeeOutput: string,
    transactionStatus: AngorTransactionStatus
  ): Promise<void> {
    await AngorInvestmentRepository.$updateInvestmentsStatus(
      addressOnFeeOutput,
      transactionStatus
    );
  }
}
