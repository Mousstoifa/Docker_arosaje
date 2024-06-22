import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import TabBarContext, { TabBarProvider } from './components/TabBarContext';

import Bienvenue from './screens/Bienvenue';
import Sign from './screens/Sign';
import Login from './screens/Login';
import Header from './components/header';
import Annonces from './screens/Annonces';
import Messages from './screens/Messages';
import Photos from './screens/Photos';
import Conseils from './screens/Conseils';
import Profil from './screens/Profil';
import CameraPreview from './screens/CameraPreview';
import Formulaire from './screens/Formulaire';

import CreatePost from './screens/CreatePost';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PhotosStack() {
  const { setIsTabBarVisible } = useContext(TabBarContext);

  return (
    <Stack.Navigator
    >
      <Stack.Screen
        name="Photos"
        component={Photos}
        options={{
          headerShown: false
        }}
        listeners={{
          focus: () => setIsTabBarVisible(false),
          blur: () => setIsTabBarVisible(true),
        }}
      />
      <Stack.Screen
        name="CameraPreview"
        component={CameraPreview}
        options={{
          title: 'Nouvelle plante',
          headerTitleAlign: 'center',
          tabBarVisible: false,
        }}
        listeners={{
          focus: () => setIsTabBarVisible(false),
          blur: () => setIsTabBarVisible(true),
        }}
      />
      <Stack.Screen
        name="Formulaire"
        component={Formulaire}
        options={{
          title: 'Nouveau poste',
          headerTitleAlign: 'center',
          tabBarVisible: false,
        }}
        listeners={{
          focus: () => setIsTabBarVisible(false),
          blur: () => setIsTabBarVisible(true),
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(true);
  }, []);

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
            <Stack.Screen name="Main" component={MainNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </TabBarProvider>
  );
}

const MainNavigator = () => {
  const { isTabBarVisible } = useContext(TabBarContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#5DB075',
        tabBarLabelStyle: {
          fontSize: 11, // Augmenté pour meilleure visibilité
          fontWeight: '500',
          paddingBottom: Platform.OS === 'ios' ? 5 : 0, // Ajout de padding pour iOS et Android
        },
        tabBarStyle: {
          display: isTabBarVisible ? 'flex' : 'none',
          position: 'absolute',
          height: 60, // Augmenté pour meilleure visibilité
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          paddingBottom: Platform.OS === 'ios' ? 10 : 15, // Ajout de padding pour iOS et Android
        },
      }}
    >
      <Tab.Screen
        name="Annonces"
        component={Annonces}
        options={{
          title: 'Annonces',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
          ),
          header: () => <Header title="Annonces" />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'mail' : 'mail-outline'} size={28} color={color} />
          ),
          header: () => <Header title="Messages" />,
        }}
      />
      <Tab.Screen
        name="PhotosStack"
        component={PhotosStack}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              style={styles.cameraButton}
              {...props}
            >
              <MaterialIcons name="camera" size={49} color="#5DB075" />
            </TouchableOpacity>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Conseils"
        component={Conseils}
        options={{
          title: 'Conseils',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={28} color={color} />
          ),
          header: () => <Header title="Conseils" />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={Profil}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />
          ),
          header: () => <Header title="Profil" />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  cameraButton: {
    position: 'absolute',
    top: -35,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: 80,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#5DB075',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
