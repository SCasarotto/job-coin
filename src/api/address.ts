import axios from 'axios';
import { Address } from 'types/Address';

/**
 * Get the balance and list of transactions for an address.
 *
 * Notes:
 * This will never return 404 - for an unused address, it will return a balance of 0 and an empty list of transactions.
 * Numbers will be returned as strings to preserve precision.
 * Some transactions lack a “fromAddress” - those are ones where Jobcoins were created from the UI.
 *
 * @param address The address to get the balance for
 * @returns The balance and trasactions
 */
export const getAddress = async (address: string) =>
  axios.request<Address>({
    method: 'GET',
    url: `http://jobcoin.gemini.com/greasily-pessimist/api/addresses/${address}`,
  });
