import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';

//const { IPV4 } = require('../Backend/config/config');

const Formulaire = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { photo } = route.params || {};
  const [nomPlante, setNomPlante] = useState('');
  const [description, setDescription] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [isDateDebutPickerVisible, setDateDebutPickerVisibility] = useState(false);
  const [isDateFinPickerVisible, setDateFinPickerVisibility] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReset, setFormReset] = useState(false);
  const [villesSuggestions, setVillesSuggestions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setNomPlante('');
      setDescription('');
      setLocalisation('');
      setCodePostal('');
      setDateDebut(new Date());
      setDateFin(new Date());
      setIsSubmitting(false);
      setFormReset(true); // Réinitialise le statut du formulaire
    }, [])
  );

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          console.error('Aucun token trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
      }
    };

    fetchToken();
  }, []);

  // Fonction pour récupérer les suggestions de villes
  const fetchVilles = async (query) => {
    if (!query) {
      setVillesSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${query}&fields=code,codesPostaux,nom&boost=population&limit=5`);
      const data = await response.json();
      setVillesSuggestions(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }
  };

  // Fonction pour gérer la saisie de la ville
  const handleVilleChange = (text) => {
    setLocalisation(text);
    fetchVilles(text);
  };

  // Fonction pour sélectionner une ville dans les suggestions
  const handleVilleSelect = (ville) => {
    setLocalisation(ville.nom);
    setCodePostal(ville.codesPostaux[0]);
    setVillesSuggestions([]);
  };

  // Fonction pour gérer la saisie du code postal
  const handleCodePostalChange = async (text) => {
    setCodePostal(text.replace(/[^0-9]/g, ''));
    if (text.length === 5) {
      try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${text}`);
        const data = await response.json();

        if (data.length > 0) {
          setLocalisation(data[0].nom);
          setVillesSuggestions([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la ville par code postal:', error);
      }
    }
  };

  const showDateDebutPicker = () => {
    setDateDebutPickerVisibility(true);
  };

  const hideDateDebutPicker = () => {
    setDateDebutPickerVisibility(false);
  };

  const handleDateDebutConfirm = (date) => {
    setDateDebut(date);
    hideDateDebutPicker();
  };

  const showDateFinPicker = () => {
    setDateFinPickerVisibility(true);
  };

  const hideDateFinPicker = () => {
    setDateFinPickerVisibility(false);
  };

  const handleDateFinConfirm = (date) => {
    setDateFin(date);
    hideDateFinPicker();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' });
  };

  const handleLocationPress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission de localisation est nécessaire pour récupérer votre ville.');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      console.log('Réponse de l\'API:', data);

      if (data && data.address) {
        const village = data.address.village || '';
        const department = data.address.county || '';
        const postalCode = data.address.postcode || '';
        if (village && department && postalCode) {
          setLocalisation(`${village.toUpperCase()}, ${department}`);
          setCodePostal(postalCode);
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer le village, le département ou le code postal.');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les informations de localisation.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations de localisation.');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Si déjà en cours de soumission, ne rien faire

    setIsSubmitting(true); // Empêcher d'autres soumissions
    setLoading(true); // Afficher le spinner de chargement

    const fullLocalisation = `${localisation}, ${codePostal}`;
    const formData = new FormData();
    formData.append('nomPlante', nomPlante);
    formData.append('description', description);
    formData.append('localisation', fullLocalisation);
    formData.append('dateDebut', dateDebut.toISOString());
    formData.append('dateFin', dateFin.toISOString());
    if (photo) {
      const photoFile = {
        uri: photo,
        name: `${nomPlante}.webp`,
        type: 'image/webp',
      };
      formData.append('photo', photoFile);
    }

    try {
      if (!token) {
        console.error('Aucun token disponible pour la soumission');
        setLoading(false); // Masquer le spinner de chargement
        setIsSubmitting(false); // Réactiver la soumission
        return;
      }

      console.log('Données soumises:', formData);
      console.log('Utilisation du token:', token);

      const response = await fetch(`http://172.17.74.1:3000/annonces/addannonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Statut de la réponse:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Données de la réponse:', responseData);
        Alert.alert(
          'Succès',
          'Votre annonce a été ajoutée avec succès!',
          [{
            text: 'OK', onPress: () => {
              // Réinitialiser l'état du formulaire
              setNomPlante('');
              setDescription('');
              setLocalisation('');
              setCodePostal('');
              setDateDebut(new Date());
              setDateFin(new Date());
              navigation.navigate('Photos'); // Naviguer vers la caméra

              // Après un délai, naviguer vers les annonces
              setTimeout(() => {
                navigation.navigate('Annonces');
              }, 1); // Ajustez le délai selon vos besoins
            }
          }]
        );
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la soumission du formulaire:', errorData);
        setIsSubmitting(false); // Réactiver la soumission
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setIsSubmitting(false); // Réactiver la soumission
    } finally {
      setLoading(false); // Masquer le spinner de chargement après la soumission
      setFormReset(false); // Désactiver la réinitialisation du formulaire
    }
  };

  return (
    <View style={styles.wrapper}>
      <Spinner
        visible={loading}
        textContent={'Chargement...'}
        textStyle={styles.spinnerTextStyle}
      />
      <FlatList
        data={[]}
        ListHeaderComponent={(
          <View style={styles.container}>
            <Text style={styles.label}>Photo de la plante :</Text>
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
              />
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>Choisir une photo</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.label}>Nom de la plante :</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Monstera Deliciosa"
              placeholderTextColor="#666"
              value={nomPlante}
              onChangeText={setNomPlante}
            />
            <Text style={styles.label}>Descriptif :</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: J'ai besoin de quelqu'un pour garder ma plante pendant mes vacances."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Text style={styles.label}>Ville :</Text>
            <View style={styles.locationContainer}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Ex: Paris, Île-de-France"
                placeholderTextColor="#666"
                value={localisation}
                onChangeText={handleVilleChange}
              />
              <TouchableOpacity onPress={handleLocationPress} style={styles.locationIcon}>
                <Icon name="location-on" size={30} color="#333" />
              </TouchableOpacity>
            </View>
            {villesSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {villesSuggestions.map((ville) => (
                  <TouchableOpacity key={ville.code} onPress={() => handleVilleSelect(ville)}>
                    <Text style={styles.suggestionText}>{ville.nom}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.label}>Code Postal :</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 75001"
              placeholderTextColor="#666"
              value={codePostal}
              onChangeText={handleCodePostalChange}
              maxLength={5}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Période de garde :</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>du</Text>
              <TouchableOpacity onPress={showDateDebutPicker} style={styles.dateInputContainer}>
                <Text style={styles.dateInput}>{formatDate(dateDebut)}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDateDebutPickerVisible}
                mode="date"
                onConfirm={handleDateDebutConfirm}
                onCancel={hideDateDebutPicker}
              />
              <Text style={styles.dateLabel}>au</Text>
              <TouchableOpacity onPress={showDateFinPicker} style={styles.dateInputContainer}>
                <Text style={styles.dateInput}>{formatDate(dateFin)}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDateFinPickerVisible}
                mode="date"
                onConfirm={handleDateFinConfirm}
                onCancel={hideDateFinPicker}
              />
            </View>
            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || !formReset) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || !formReset}
            >
              <Text style={styles.submitButtonText}>Poster</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={<Toast ref={(ref) => Toast.setRef(ref)} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  textArea: {
    height: 100,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationInput: {
    flex: 1,
  },
  locationIcon: {
    marginLeft: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: -10,
    marginBottom: 20,
    zIndex: 1,
  },
  suggestionText: {
    padding: 10,
    fontSize: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateInputContainer: {
    flex: 1,
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  dateInput: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 40,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  photoButton: {
    backgroundColor: '#5DB075',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#077B17',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#aaa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
});

export default Formulaire;