import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardProfil from '../components/CardProfil'; // Assurez-vous que le chemin est correct
import { useNavigation } from '@react-navigation/native';

//const { IPV4 } = require('../Backend/config/config');

const ProfileScreen = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('mesPlantes');
  const [userInfo, setUserInfo] = useState({ nom: '', prenom: '' });
  const [mesAnnonces, setMesAnnonces] = useState([]);
  const [mesGardes, setMesGardes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`http://172.17.74.1:3000/user/user-info`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            Alert.alert('Erreur', 'Impossible de récupérer les informations utilisateur.');
          }
        } catch (error) {
          Alert.alert('Erreur', 'Problème de réseau.');
        }
      } else {
        Alert.alert('Erreur', 'Aucun token disponible.');
      }
    };

    const fetchMesAnnonces = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://172.17.74.1:3000/annonces/myannonces`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMesAnnonces(data);
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer les annonces.');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Problème de réseau.');
      }
    };

    const fetchMesGardes = async () => {
      // Ici, vous pourrez éventuellement implémenter la logique pour récupérer les "gardes"
      setMesGardes([]); // Placeholder pour le moment
    };

    const fetchData = async () => {
      setIsLoading(true);
      await fetchUserInfo();
      await fetchMesAnnonces();
      await fetchMesGardes(); 
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const renderMesPlantes = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Chargement en cours...</Text>
        </View>
      );
    }

    if (mesAnnonces.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>Vous n'avez encore posté aucune annonce 🌱</Text>
        </View>
      );
    }

    return (
      <View style={styles.cardsWrapper}>
        {mesAnnonces.map((annonce, index) => (
          <CardProfil
            key={index}
            imageUrl={`http://172.17.74.1:3000/annonces/image/${annonce.photo}`}
            onPress={() => navigation.navigate('DetailPoste', { annonce })}
          />
        ))}
      </View>
    );
  };

  const renderMesGardes = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Chargement en cours...</Text>
        </View>
      );
    }

    if (mesGardes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>Vous n'avez encore gardé aucune plante 🌿</Text>
        </View>
      );
    }

    return (
      <View style={styles.cardsWrapper}>
        {/* Logique pour afficher les gardes une fois implémentée */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Bon retour, {userInfo.prenom}</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('mesPlantes')}
          style={[
            styles.tabButton,
            activeTab === 'mesPlantes' && styles.activeTabButton,
          ]}
        >
          <Text style={activeTab === 'mesPlantes' ? styles.activeTabText : styles.tabText}>
            🌱 Mes plantes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('mesGardes')}
          style={[
            styles.tabButton,
            activeTab === 'mesGardes' && styles.activeTabButton,
          ]}
        >
          <Text style={activeTab === 'mesGardes' ? styles.activeTabText : styles.tabText}>
            🌿 Mes gardes
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'mesPlantes' ? renderMesPlantes() : renderMesGardes()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 110,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#077B17',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontSize: 16,
    color: '#077B17',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
