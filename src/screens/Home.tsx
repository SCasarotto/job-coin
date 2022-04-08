import { CommonActions, useNavigation } from '@react-navigation/native';
import { useUserContext } from 'context/UserContext';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export const Home: React.FC = () => {
  const navigation = useNavigation();
  const { address, balance, transactions, setAddress } = useUserContext();
  const [sendModalVisible, setSendModalVisible] = useState(false);

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
        >
          <Text>Sign Out</Text>
        </Pressable>
      ),
    });
  }, [navigation, setAddress]);

  const handleSend = useCallback(async () => {
    // TODO: Implement send
    setSendModalVisible(false);
  }, []);

  // TODO:
  // 1. Add send modal
  // 2. Convert data to chart data
  // 3. Add chart
  // 4. Add signout

  return (
    <View>
      <View>
        <Text>{balance}</Text>
        <Pressable onPress={() => setSendModalVisible(true)}>
          <Text>Send</Text>
        </Pressable>
      </View>
      <View>
        <Text>Chart Go Here</Text>
      </View>
      {sendModalVisible && (
        <View>
          <View>
            <Text>Send Jobcoin</Text>
            <View>
              <Text>Address</Text>
              <TextInput />
              <Text>TODO Address Error</Text>
            </View>
            <View>
              <Text>Amount</Text>
              <TextInput />
              <Text>TODO Amount Error</Text>
            </View>
            <View>
              <Pressable onPress={() => setSendModalVisible(false)}>
                Cancel
              </Pressable>
              <Pressable onPress={handleSend}>Send</Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
