import axios from 'axios';
import { Transaction } from 'types/Transaction';

/**
 * Get the list of all Jobcoin transactions.
 *
 * Notes:
 * Numbers will be returned as strings to preserve precision.
 * Some transactions lack a “fromAddress” - those are ones where Jobcoins were created from the UI.
 *
 * @returns The list of transactions
 */
export const getTrasnactions = async () =>
  axios.request<Array<Transaction>>({
    method: 'GET',
    url: 'http://jobcoin.gemini.com/greasily-pessimist/api/transactions',
  });

export type CreateTransaction = {
  fromAddress: string;
  toAddress: string;
  amount: string;
};
export type CreateTransactionResponse = {
  status: 'OK';
};
/**
 * Send Jobcoins from one address to another.
 *
 * @param transaction The transaction to create
 * @param transaction.fromAddress The address sending the Jobcoins
 * @param transaction.toAddress The address receiving the Jobcoins
 * @param transaction.amount The number of Jobcoins to send, as a string.
 *
 * @returns status: 'OK'
 */
export const createTransaction = async (transaction: CreateTransaction) =>
  axios.request<CreateTransactionResponse>({
    method: 'POST',
    url: 'http://jobcoin.gemini.com/greasily-pessimist/api/transactions',
    data: transaction,
  });
