import React, { createContext, useContext, useMemo, useState } from 'react';
import { Transaction } from 'types/Transaction';

/**
 * Simple context to store user information app wide
 */
export const UserContext = createContext<{
  address?: string;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  balance?: number;
  setBalance: React.Dispatch<React.SetStateAction<number | undefined>>;
  transactions?: Array<Transaction>;
  setTransactions: React.Dispatch<React.SetStateAction<Array<Transaction>>>;
}>(undefined!);
export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC = (props) => {
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState<number>();
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);

  const value = useMemo(
    () => ({
      address,
      setAddress,
      balance,
      setBalance,
      transactions,
      setTransactions,
    }),
    [address, balance, transactions],
  );

  return (
    <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
  );
};
