import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { Alert } from 'react-native';
import { TabBarProvider } from './components/TabBarContext';
import Bienvenue from './screens/Bienvenue';
import Sign from './screens/Sign';
import Login from './screens/Login';
import MainNavigator from './MainNavigator';



const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log(process.env)
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp > currentTime) {
            setIsLoggedIn(true);
          } else {
            await AsyncStorage.removeItem('token');
            setIsLoggedIn(false);
            Alert.alert("Session expirée", "Veuillez vous reconnecter.");
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du jeton :', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();

    const interval = setInterval(() => {
      checkToken();
    }, 20000); // Vérifie toutes les 20 secondes

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return null; // ou une vue de chargement si vous préférez
  }

  return (
    <TabBarProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Bienvenue" component={Bienvenue} />
              <Stack.Screen name="Sign" component={Sign} />
              <Stack.Screen name="Login">
                {(props) => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Main">
              {(props) => <MainNavigator {...props} handleLogout={handleLogout} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </TabBarProvider>
  );
}