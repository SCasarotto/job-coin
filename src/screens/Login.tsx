import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';

import { getAddress } from 'api/address';
import { useUserContext } from 'context/UserContext';

export const Login: React.FC = () => {
  const navigation = useNavigation();
  const {
    setAddress: setContextAddress,
    setBalance,
    setTransactions,
  } = useUserContext();
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(undefined);

    if (!address) {
      setSubmitting(false);
      setError('Please enter an address');
      return;
    }

    try {
      const res = await getAddress(address);
      const { balance, transactions } = res.data;
      const numericBalance = parseFloat(balance);

      // if there are no transactions and no balance then the address is invalid
      if (numericBalance === 0 && transactions.length === 0) {
        setError('Address not found, please enter a valid address');
        setSubmitting(false);
      }

      // Valid address found
      setContextAddress(address);
      setBalance(numericBalance);
      setTransactions(transactions);
      // Reset onto home so that there is no back button to login
      navigation.dispatch(
        CommonActions.reset({
          routes: [{ name: 'Home' }],
        }),
      );
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      setError('An error occurred, please try again');
    }
  }, [address, navigation, setBalance, setContextAddress, setTransactions]);

  return (
    <SafeAreaView>
      <Text>My Jobcoin Wallet</Text>
      <Text>Enter your address to enter</Text>
      <TextInput
        value={address}
        onChangeText={(val) => setAddress(val)}
        placeholder="Address"
      />
      {!!error && <Text>{error}</Text>}
      <Pressable onPress={handleSubmit} disabled={submitting}>
        {submitting ? <Text>Submitting...</Text> : <Text>Enter</Text>}
      </Pressable>
    </SafeAreaView>
  );
};
