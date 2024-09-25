import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

const CameraPreview = ({ route }) => {
  const { photo } = route.params || {};
  const navigation = useNavigation();
  const [base64Photo, setBase64Photo] = useState(null);

  useEffect(() => {
    if (photo) {
      FileSystem.readAsStringAsync(photo, { encoding: FileSystem.EncodingType.Base64 })
        .then(encoded => {
          setBase64Photo(`data:image/jpeg;base64,${encoded}`);
        })
        .catch(error => {
          console.error('Error converting image to base64:', error);
          Alert.alert('Erreur', 'Impossible de convertir l\'image.');
        });
    }
  }, [photo]);

  return (
    <ImageBackground source={require('../assets/backrloundpost.png')} style={styles.background}>
      <View style={styles.container}>
        {base64Photo && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: base64Photo }} style={styles.image} />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ContactExpert')}
          >
            <Text style={styles.buttonText}>Contacter un expert</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Formulaire', { photo: base64Photo })}
          >
            <Text style={styles.buttonText}>Créer un post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 0,
    borderRadius: 30,
    margin: 30,
  },
  imageContainer: {
    width: '90%',
    aspectRatio: 3 / 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#5DB075',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraPreview;