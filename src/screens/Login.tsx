import React, { useCallback, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

      // If there are no transactions then the address is invalid
      if (transactions.length === 0) {
        setError('Address not found, please enter a valid address');
        setSubmitting(false);
        return;
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
      console.log(e);
      setSubmitting(false);
      setError('An error occurred, please try again');
    }
  }, [address, navigation, setBalance, setContextAddress, setTransactions]);

  return (
    <SafeAreaView style={styles.outerConatiner}>
      <View style={styles.container}>
        <Text style={styles.title}>My Jobcoin Wallet</Text>
        <Text style={styles.subtitle}>Enter your address to enter</Text>
        <TextInput
          value={address}
          onChangeText={(val) => setAddress(val)}
          placeholder="Address"
          style={styles.input}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.button}
        >
          {submitting ? (
            <Text style={styles.buttonText}>Submitting...</Text>
          ) : (
            <Text style={styles.buttonText}>Enter</Text>
          )}
        </Pressable>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerConatiner: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderColor: '#c5c4c4',
    borderRadius: 5,
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00a8ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 60,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
