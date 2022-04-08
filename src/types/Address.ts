import { Transaction } from './Transaction';

export type Address = {
  balance: string; // "0.00"
  transactions: Array<Transaction>;
};
