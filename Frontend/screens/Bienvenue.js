import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Bienvenue ({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenue sur{"\n"}A ’Rosa-je</Text>
      <MaterialCommunityIcons name="flower" size={190} color="#077B17" style={styles.icon} />
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate('Sign')}>
        <Text style={[styles.buttonText, styles.signupButtonText]}>Inscription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '300',
    marginBottom: 90,
    textAlign: 'center',
    color: 'black',
    fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif-light' }),
  },
  icon: {
    marginBottom: 90,
  },
  button: {
    backgroundColor: '#077B17',
    padding: 10,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  signupButtonText: {
    color: 'white',
  },
});
