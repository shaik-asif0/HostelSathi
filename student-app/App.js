import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { restoreSession } from './src/redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess } from './src/redux/authSlice';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// Persistence middleware: save token+user on loginSuccess
function AppWithSessionRestore() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(state => state.auth);
  const { colors, isDarkMode } = useTheme();

  // On app mount: restore persisted session from AsyncStorage
  useEffect(() => {
    dispatch(restoreSession());
  }, []);

  // Persist session whenever auth state changes
  useEffect(() => {
    if (isAuthenticated && token && user) {
      AsyncStorage.setItem('userToken', token);
      AsyncStorage.setItem('userData', JSON.stringify(user));
    }
  }, [isAuthenticated, token, user]);

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWithSessionRestore />
      </ThemeProvider>
    </Provider>
  );
}
