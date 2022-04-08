import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Portal } from '@gorhom/portal';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Area,
  Chart,
  ChartDataPoint,
  HorizontalAxis,
  Line,
  VerticalAxis,
} from 'react-native-responsive-linechart';
import { format } from 'date-fns';
import * as d3 from 'd3';

import { getAddress } from 'api/address';
import { createTransaction, CreateTransaction } from 'api/transactions';
import { useUserContext } from 'context/UserContext';

export const Home: React.FC = () => {
  const navigation = useNavigation();
  const {
    address,
    balance = 0,
    transactions = [],
    setAddress,
    setBalance,
    setTransactions,
  } = useUserContext();
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [addressToSend, setAddressToSend] = useState('');
  const [addressToSendError, setAddressToSendError] = useState<string>();
  const [amountToSend, setAmountToSend] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'My Jobcoin',
      headerRight: () => (
        <Pressable
          onPress={() => {
            // Reset back to login
            navigation.dispatch(
              CommonActions.reset({
                routes: [{ name: 'Login' }],
              }),
            );
            setAddress(undefined);
          }}
          testID="sign-out-button"
        >
          <Text>Sign Out</Text>
        </Pressable>
      ),
    });
  }, [navigation, setAddress]);

  const handleSend = useCallback(async () => {
    setSubmitting(true);
    setError(undefined);
    setAddressToSendError(undefined);
    setAmountError(undefined);

    if (!address) {
      setSubmitting(false);
      setError('You must be logged in to send');
      return;
    }

    // Check address
    if (!addressToSend) {
      setAddressToSendError('Address is required');
      setSubmitting(false);
      return;
    } else if (addressToSend === address) {
      setAddressToSendError('You cannot send to yourself');
      setSubmitting(false);
      return;
    }

    // Check amount
    if (!amountToSend) {
      setAmountError('Amount is required');
      setSubmitting(false);
      return;
    } else if (parseFloat(amountToSend) <= 0) {
      setAmountError('Amount must be greater than 0');
      setSubmitting(false);
      return;
    } else if (parseFloat(amountToSend) > balance) {
      setAmountError(
        `Amount must be less than your current balance (${balance})`,
      );
      setSubmitting(false);
      return;
    }

    try {
      // Check if address is valid
      const res = await getAddress(addressToSend);

      // If there are no transactions then the address is invalid
      if (res.data.transactions.length === 0) {
        setAddressToSendError(
          'Address not found, please enter a valid address',
        );
        setSubmitting(false);
        return;
      }
    } catch (e) {
      console.log(e);
      setError(
        'An error occurred while trying to validate the address, please try again',
      );
      return;
    }

    // Create transaction
    try {
      const newTransaction: CreateTransaction = {
        fromAddress: address,
        toAddress: addressToSend,
        amount: amountToSend,
      };
      await createTransaction(newTransaction);
      const res = await getAddress(address);
      const { balance: updatedBalance, transactions: updatedTransactions } =
        res.data;
      const numericBalance = parseFloat(updatedBalance);

      setBalance(numericBalance);
      setTransactions(updatedTransactions);
      setSendModalVisible(false);
      setSubmitting(false);
      setAddressToSend('');
      setAmountToSend('');
    } catch (e) {
      console.log(e);
      setError(
        'An error occurred while trying to create the transaction, please try again',
      );
      return;
    }
  }, [
    address,
    addressToSend,
    amountToSend,
    balance,
    setBalance,
    setTransactions,
  ]);

  const lineChartData = useMemo(() => {
    const newData: Array<ChartDataPoint> = [];
    let prevBalance = 0;
    transactions.forEach((transaction) => {
      const { amount, timestamp, toAddress } = transaction;
      const numericAmount = parseFloat(amount);
      const numericBalance =
        toAddress === address
          ? prevBalance + numericAmount
          : prevBalance - numericAmount;
      prevBalance = numericBalance;
      newData.push({
        x: new Date(timestamp).getTime(),
        y: numericBalance,
      });
    });

    // Add current balance to the end
    newData.push({
      x: Date.now(),
      y: balance,
    });
    return newData;
  }, [transactions, balance, address]);

  const chartConfig = useMemo(() => {
    const yMin = lineChartData.reduce((a, b) => Math.min(a, b.y), Infinity);
    const yMax = lineChartData.reduce((a, b) => Math.max(a, b.y), -Infinity);
    const xMin = lineChartData.reduce((a, b) => Math.min(a, b.x), Infinity);
    const xMax = lineChartData.reduce((a, b) => Math.max(a, b.x), -Infinity);
    return {
      tickValues: d3
        .scaleTime()
        .domain([new Date(xMin), new Date(xMax)])
        .nice(5)
        .ticks(5)
        .map((d) => d.getTime()),

      minY: yMin,
      // Handle if there is only 1 data point
      maxY: yMax === yMin ? (yMax === 0 ? yMax + 1 : yMax * 0.1) : yMax,
      minX: xMin,
      // Handle if there is only 1 data point
      maxX: xMax === xMin ? (xMax === 0 ? xMax + 1 : xMax * 0.1) : xMax,
    };
  }, [lineChartData]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      testID="home-screen"
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.balanceLabel}>Balance:</Text>
          <Text style={styles.balance} testID="balance-text">
            {balance}
          </Text>
        </View>
        <Pressable
          onPress={() => setSendModalVisible(true)}
          style={styles.sendButton}
          testID="send-button"
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
      <View style={styles.chartWrapper}>
        <Chart
          style={styles.chart}
          padding={{ left: 30, bottom: 80, right: 15, top: 15 }}
          data={lineChartData}
          disableGestures
        >
          <VerticalAxis
            tickCount={9}
            theme={{
              grid: {
                stroke: {
                  color: '#e0e0e0',
                },
              },
              labels: {
                label: {
                  color: '#212121',
                  fontWeight: 400,
                  fontSize: 12,
                },
                formatter: (v) => v.toFixed(1),
              },
            }}
          />
          <HorizontalAxis
            tickValues={chartConfig.tickValues}
            theme={{
              grid: {
                stroke: {
                  color: '#e0e0e0',
                },
              },
              labels: {
                label: {
                  color: '#212121',
                  fontWeight: 400,
                  fontSize: 12,
                  rotation: 45,
                  // dy: -20,
                  // dx: 3,
                  textAnchor: 'start',
                },
                formatter: (v) => format(v, 'M/d/yy h:mmaa'),
              },
            }}
          />
          <Area
            theme={{
              gradient: {
                from: { color: '#00a8ff', opacity: 0.75 },
                to: { color: '#00a8ff', opacity: 0 },
              },
            }}
          />
          <Line
            theme={{
              stroke: {
                color: '#00a8ff',
                width: 1,
              },
            }}
          />
        </Chart>
      </View>
      {sendModalVisible && (
        <Portal>
          <View style={styles.modalBackground} testID="send-modal">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Send Jobcoin</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Send To</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={addressToSend}
                  onChangeText={(value) => setAddressToSend(value.trim())}
                  testID="send-address-input"
                />
                {!!addressToSendError && (
                  <Text style={styles.inputError} testID="send-address-error">
                    {addressToSendError}
                  </Text>
                )}
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholder="0.00"
                  value={amountToSend}
                  onChangeText={(value) => {
                    // Only allow valid decimal numbers
                    const floatRegExp = new RegExp(
                      '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$',
                    );
                    // Remove leading zeros
                    const cleanedValue = value.replace(/^0+/, '');
                    if (cleanedValue === '' || floatRegExp.test(cleanedValue)) {
                      setAmountToSend(cleanedValue);
                    }
                  }}
                  testID="send-amount-input"
                />
                {!!amountError && (
                  <Text style={styles.inputError} testID="send-amount-error">
                    {amountError}
                  </Text>
                )}
              </View>
              {!!error && <Text style={styles.modalError}>{error}</Text>}
              <View style={styles.modalButtonsWrapper}>
                <Pressable
                  onPress={() => setSendModalVisible(false)}
                  style={[styles.modalButton, styles.modalCancelButton]}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSend}
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  disabled={submitting}
                  testID="send-confirm-button"
                >
                  <Text style={styles.modalButtonText}>
                    {submitting ? 'submitting...' : 'Send'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Portal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balance: {
    fontSize: 50,
    lineHeight: 50,
    fontWeight: 'bold',
    color: '#00a8ff',
  },
  balanceLabel: {
    fontSize: 16,
    lineHeight: 16,
    color: '#666666',
  },
  sendButton: {
    backgroundColor: '#00a8ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  chartWrapper: {},
  chart: {
    height: 300,
    width: '100%',
  },

  modalBackground: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    width: '80%',
    maxWidth: '80%',
    marginTop: '20%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  input: {
    fontSize: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  inputError: {
    color: 'red',
    fontSize: 16,
    lineHeight: 16,
    marginTop: 4,
  },
  modalError: {
    color: 'red',
    fontSize: 16,
    lineHeight: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  modalButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
  },
  modalConfirmButton: {
    backgroundColor: '#00a8ff',
  },
  modalButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});
