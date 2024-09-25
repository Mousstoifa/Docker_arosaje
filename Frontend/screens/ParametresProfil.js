import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Animated, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

//import { IPV4 } = require('../Backend/config/config');

const ParametresProfil = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          fetchProfilePic(storedToken);
        } else {
          Alert.alert('Token not found');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        Alert.alert('Error fetching token');
      }
    };

    fetchToken();
  }, []);

  const fetchProfilePic = async (token) => {
    try {
      const response = await fetch(`http://172.17.74.1:3000/user/profile-pic`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 404) {
        // Si le serveur répond avec un 404, cela signifie que l'utilisateur n'a pas de photo de profil
        console.log('Aucune photo de profil trouvée pour cet utilisateur.'); 
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch profile pic');
      }
  
      const imageData = await response.blob();
  
      // Convert Blob to Base64 string
      const reader = new FileReader();
      reader.readAsDataURL(imageData);
      reader.onloadend = () => {
        const base64data = reader.result;
        setProfilePic(base64data);
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la photo de profil:', error);
      // Ne rien afficher si l'erreur est due à l'absence de photo de profil
    }
  };  

  const handleVerifyCurrentPassword = async () => {
    if (!token) {
      Alert.alert('Token not found. Please try again.');
      return;
    }

    try {
      const response = await fetch(`http://172.17.74.1:3000/user/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error response:', data.error);
        Alert.alert(data.error);
        shake();
      } else {
        setShowNewPasswordFields(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Une erreur est survenue. Veuillez réessayer.');
      shake();
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      Alert.alert('Token not found. Please try again.');
      return;
    }

    try {
      const response = await fetch(`http://172.17.74.1:3000/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error response:', data.error);
        Alert.alert(data.error);
      } else {
        console.log('Success response:', data.message);
        Alert.alert(data.message);
        resetPasswordFields();
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPasswordFields(false);
  };

  const handleDeleteAccount = async () => {
    if (!token) {
      Alert.alert('Token not found. Please try again.');
      return;
    }

    try {
      const response = await fetch(`http://172.17.74.1:3000/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error response:', data.error);
        Alert.alert(data.error);
      } else {
        console.log('Success response:', data.message);
        Alert.alert(data.message);
        await AsyncStorage.removeItem('token');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Bienvenue' }],
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Bienvenue' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error during logout');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setProfilePic(pickerResult.assets[0].uri);
    }
  };

  const convertToWebP = async (uri) => {
    const webPImage = await manipulateAsync(
      uri,
      [],
      { compress: 1, format: SaveFormat.WEBP }
    );
    return webPImage.uri;
  };

  const handleUpdateProfilePic = async () => {
    if (!profilePic) {
      Alert.alert('Aucune photo sélectionnée');
      return;
    }

    if (!token) {
      Alert.alert('Token not found. Please try again.');
      return;
    }

    try {
      const webPImageUri = await convertToWebP(profilePic);

      const formData = new FormData();
      formData.append('profilePic', {
        uri: webPImageUri,
        name: 'profile.webp',
        type: 'image/webp',
      });

      const response = await fetch(`http://172.17.74.1:3000/user/upload-profile-pic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error response:', data.error);
        Alert.alert(data.error);
      } else {
        console.log('Success response:', data.message);
        Alert.alert(data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.profilePicContainer}>
            <View style={styles.profilePicWrapper}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
              ) : (
                <View style={styles.defaultProfilePic}>
                  <Icon name="person-circle-outline" size={80} color="#ccc" />
                </View>
              )}
            </View>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changePicText}>Changer la photo de profil</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe actuel :</Text>
            <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe actuel"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </Animated.View>
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCurrentPassword}>
              <Text style={styles.verifyButtonText}>Vérifier</Text>
            </TouchableOpacity>
          </View>
          {showNewPasswordFields && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nouveau mot de passe :</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nouveau mot de passe"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le nouveau mot de passe :</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmez votre nouveau mot de passe"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfilePic}>
            <Text style={styles.saveButtonText}>Mettre à jour la photo de profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences utilisateur</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Langue préférée :</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre langue préférée"
              value={language}
              onChangeText={setLanguage}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Activer les notifications :</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres de compte</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 110, // Ajout d'un padding pour compenser l'espace du header
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  profilePic: {
    width: 100,
    height: 100,
  },
  defaultProfilePic: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },
  changePicText: {
    marginTop: 10,
    color: '#077B17',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 12,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 13,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#077B17',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#B92915',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#B92915',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#077B17',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ParametresProfil;
