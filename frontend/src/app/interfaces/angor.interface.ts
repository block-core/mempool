export interface AngorProject {
  founderKey: string;
  nostrPubKey: string;
  projectIdentifier: string;
  createdOnBlock: number;
  trxId: string;
}

export interface AngorProjectStats {
  investorCount: number;
  amountInvested: number;
  amountSpentSoFarByFounder: number;
  amountInPenalties: number;
  countInPenalties: number;
}

export interface AngorProjectInvestment {
  investorPublicKey: string;
  totalAmount: number;
  transactionId: string;
  hashOfSecret: string;
  isSecret: boolean;
}
