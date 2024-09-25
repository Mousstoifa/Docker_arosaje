import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//import { IPV4 } = require('../Backend/config/config');

export default function Login({ navigation, setIsLoggedIn }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [errorShakeAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            startShakeAnimation();
        }
    }, [errors]);

    const startShakeAnimation = useCallback(() => {
        Animated.sequence([
            Animated.timing(errorShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(errorShakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(errorShakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(errorShakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    }, [errorShakeAnimation]);

    const validateEmail = useCallback((email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }, []);

    const showAlert = (message) => {
        Alert.alert(
            "Erreur",
            message,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
            { cancelable: false }
        );
    };

    const handleLogin = async () => {
        const validationErrors = {};

        if (!formData.email.trim()) {
            validationErrors.email = "L'email est requis.";
        } else if (!validateEmail(formData.email)) {
            validationErrors.email = "L'email n'est pas valide.";
            showAlert("L'email n'est pas valide.");
        }
        if (!formData.password.trim()) validationErrors.password = "Le mot de passe est requis.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await fetch(`http://172.17.74.1:3000/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: formData.email, password: formData.password }),
                });

                const data = await response.json();

                if (response.ok) {
                    const token = data.token;
                    if (token) {
                        await AsyncStorage.setItem('token', token); // Stockage du token
                        setIsLoggedIn(true); // Met à jour l'état global d'authentification
                        Alert.alert("Connexion réussie", "Vous êtes maintenant connecté.");
                        navigation.navigate('Main'); // Navigue vers 'Main' après une connexion réussie
                    } else {
                        Alert.alert("Erreur de connexion", "Token non reçu.");
                    }
                } else {
                    Alert.alert("Erreur de connexion", data.error || "Email ou mot de passe incorrect.");
                }
                
            } catch (error) {
                console.error('Network error:', error);
                Alert.alert("Erreur de connexion", "Une erreur s'est produite. Veuillez réessayer.");
            }
        }
    };

    const handleTextChange = (field) => (text) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: text,
        }));
        if (errors[field]) {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>A’rosa-je</Text>
                        <MaterialCommunityIcons name="flower" size={100} color="black" style={styles.icon} />
                    </View>
                    <Animated.View style={[styles.formContainer, { transform: [{ translateX: errorShakeAnimation }] }]}>
                        <Text style={styles.formTitle}>Connexion</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={handleTextChange('email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={errors.email ? 'red' : '#ccc'}
                        />
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChangeText={handleTextChange('password')}
                            secureTextEntry
                            autoCapitalize="none"
                            placeholderTextColor={errors.password ? 'red' : '#ccc'}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Connexion</Text>
                        </TouchableOpacity>
                        <Text style={styles.switchText}>
                            Vous n’avez pas de compte?{' '}
                            <Text style={styles.switchLink} onPress={() => navigation.navigate('Sign')}>
                                Inscription
                            </Text>
                        </Text>
                    </Animated.View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#077B17',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif-light' }),
    },
    icon: {
        marginVertical: 10,
    },
    formContainer: {
        width: '100%',
        height: '60%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        marginTop: 0,
        padding: 20,
    },
    formTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 0,
        marginBottom: 50,
    },    
    input: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
    },
    inputError: {
        borderColor: 'red',
    },
    button: {
        backgroundColor: '#077B17',
        padding: 10,
        borderRadius: 30,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 19,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 50,
        color: 'black',
    },
    switchLink: {
        color: '#077B17',
        fontWeight: 'bold',
    },
});
