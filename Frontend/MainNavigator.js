import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TabBarContext from './components/TabBarContext';
import Annonces from './screens/Annonces';
import Messages from './screens/Messages';
import Photos from './screens/Photos';
import Conseils from './screens/Conseils';
import Profil from './screens/Profil';
import ParametresProfil from './screens/ParametresProfil';
import CameraPreview from './screens/CameraPreview';
import Formulaire from './screens/Formulaire';
import FormulaireBotaniste from './screens/FormulaireBotaniste';
import DetailPoste from './screens/DetailPoste';
import Conversation from './screens/Conversation';
import Header from './components/header';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AnnoncesStack() {
  const { setIsTabBarVisible } = useContext(TabBarContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Annonces"
        component={Annonces}
        options={{
          header: () => <Header title="Annonces" />,
        }}
      />
      <Stack.Screen
        name="DetailPoste"
        component={DetailPoste}
        options={{
          header: ({ navigation }) => (
            <Header
              title="Détails de l'annonce"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function PhotosStack() {
  const { setIsTabBarVisible } = useContext(TabBarContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Photos"
        component={Photos}
        options={{ headerShown: false }}
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
        }}
        listeners={{
          focus: () => setIsTabBarVisible(false),
          blur: () => setIsTabBarVisible(true),
        }}
      />
    </Stack.Navigator>
  );
}

function ConseilsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Conseils"
        component={Conseils}
        options={{
          header: () => <Header title="Conseils" />,
        }}
      />
      <Stack.Screen
        name="FormulaireBotaniste"
        component={FormulaireBotaniste}
        options={{
          header: ({ navigation }) => (
            <Header
              title="Formulaire Botaniste"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  const { setIsTabBarVisible } = useContext(TabBarContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{
          header: () => <Header title="Messages" />,
        }}
        listeners={{
          // Pas besoin de cacher ou afficher la TabBar pour l'écran Messages
          focus: () => setIsTabBarVisible(true),
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={Conversation}
        options={{ headerShown: false }}
        listeners={{
          focus: () => setIsTabBarVisible(false),
          blur: () => setIsTabBarVisible(true),
        }}
      />
    </Stack.Navigator>
  );
}

function ProfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profil"
        component={Profil}
        options={{
          header: ({ navigation }) => (
            <Header
              title="Profil"
              headerRight={() => (
                <TouchableOpacity onPress={() => navigation.navigate('ParametresProfil')} style={{ marginRight: 10 }}>
                  <Ionicons name="settings-outline" size={30} color="#000" />
                </TouchableOpacity>
              )}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ParametresProfil"
        component={ParametresProfil}
        options={{
          title: 'Paramètres',
          header: ({ navigation }) => (
            <Header
              title="Paramètres"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const MainNavigator = ({ handleLogout }) => {
  const { isTabBarVisible } = useContext(TabBarContext);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#077B17',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '450',
            paddingBottom: Platform.OS === 'ios' ? 5 : 5,
            color: 'black',
          },
          tabBarStyle: {
            display: isTabBarVisible ? 'flex' : 'none',
            position: 'absolute',
            height: 60,
            bottom: 0,
            borderTopWidth: 0,
            backgroundColor: 'white',
            paddingBottom: Platform.OS === 'ios' ? 10 : 0,
          },
          tabBarIcon: ({ color, focused }) => {
            let iconName;

            if (route.name === 'AnnoncesStack') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'MessagesStack') {
              iconName = focused ? 'chatbox' : 'chatbox-outline';
            } else if (route.name === 'PhotosStack') {
              return null;
            } else if (route.name === 'ConseilsStack') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'ProfilStack') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={22} color={color} style={styles.tabBarIcon} />;
          },
        })}
      >
        <Tab.Screen
          name="AnnoncesStack"
          component={AnnoncesStack}
          options={{
            title: 'Annonces',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="MessagesStack"
          component={MessagesStack}
          options={{
            title: 'Messages',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="PhotosStack"
          component={PhotosStack}
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => (
              <View style={styles.floatingCameraButtonContainer}>
                <TouchableOpacity {...props} style={styles.floatingCameraButton}>
                  <Ionicons name="camera" size={32} color="#077B17" />
                </TouchableOpacity>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="ConseilsStack"
          component={ConseilsStack}
          options={{
            title: 'Conseils',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="ProfilStack"
          component={ProfilStack}
          options={{
            title: 'Profil',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({
  tabBarIcon: {
    marginHorizontal: 10,
  },
  floatingCameraButtonContainer: {
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -28 }],
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCameraButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    width: 56,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#077B17',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});