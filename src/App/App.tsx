import React from 'react';

import { PortalProvider } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserProvider } from 'context/UserContext';
import { Login } from 'screens/Login';
import { Home } from 'screens/Home';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PortalProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </PortalProvider>
  );
};

export default App;
