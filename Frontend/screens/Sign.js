import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Switch, Alert, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//import { IPV4 } = require('../../Backend/config/config');
import 'dotenv/config';

// Remplacez la clé botaniste ici
const BOTANIST_SECRET_KEY = '2468';

export default function Sign() {
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        isBotanist: false,
        botanistKey: '', // Ajout du champ botanistKey
    });
    
    const [errors, setErrors] = useState({});
    const [errorShakeAnimation] = useState(new Animated.Value(0));
    const [botanistAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            startShakeAnimation();
        }
    }, [errors]);

    useEffect(() => {
        Animated.timing(botanistAnimation, {
            toValue: formData.isBotanist ? 1 : 0,
            duration: 300,
            useNativeDriver: false
        }).start();
    }, [formData.isBotanist]);

    useFocusEffect(
        React.useCallback(() => {
            setFormData({
                name: '',
                surname: '',
                email: '',
                password: '',
                isBotanist: false,
                botanistKey: '', // Réinitialisation du champ botanistKey
            });
            setErrors({});
        }, [])
    );

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

    const handleSignUp = async () => {
        const validationErrors = {};
        if (!formData.name.trim()) validationErrors.name = "Le nom est requis.";
        if (!formData.surname.trim()) validationErrors.surname = "Le prénom est requis.";
        if (!formData.email.trim()) {
            validationErrors.email = "L'email est requis.";
        } else if (!validateEmail(formData.email)) {
            validationErrors.email = "L'email n'est pas valide.";
            showAlert("L'email n'est pas valide.");
        }
        if (!formData.password.trim()) validationErrors.password = "Le mot de passe est requis.";
        if (formData.isBotanist && formData.botanistKey !== BOTANIST_SECRET_KEY) {
            validationErrors.botanistKey = "La clé botaniste est incorrecte.";
            showAlert("La clé botaniste est incorrecte.");
        }
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_API_KEY_IPV4}3000/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    password: formData.password,
                    isBotanist: formData.isBotanist,
                }),
            });
            if (!response.ok) {
                console.error('Erreur lors de l\'inscription:', response.statusText);
                throw new Error('Erreur lors de l\'inscription');
            }
            const data = await response.json();
            console.log('Inscription réussie. ID utilisateur:', data.userId);
            Alert.alert("Inscription réussie", "Votre compte a été créé avec succès.", [
                { text: "OK", onPress: () => navigation.navigate('Login') } // Rediriger vers l'écran de connexion après inscription réussie
            ]);
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'inscription.");
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

    const getTextInputStyle = (errorField) => {
        return [
            styles.input,
            errors[errorField] && styles.inputError,
            {
                transform: [
                    { translateX: errors[errorField] ? errorShakeAnimation : 0 }
                ]
            }
        ];
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>A’rosa-je</Text>
                        <MaterialCommunityIcons name="flower" size={100} color="black" style={styles.icon} />
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Inscription</Text>
                        <Animated.View style={getTextInputStyle('name')}>
                            <TextInput 
                                placeholder="Nom" 
                                placeholderTextColor={errors.name ? 'red' : '#ccc'}
                                value={formData.name} 
                                onChangeText={handleTextChange('name')} 
                            />
                        </Animated.View>
                        <Animated.View style={getTextInputStyle('surname')}>
                            <TextInput 
                                placeholder="Prénom" 
                                placeholderTextColor={errors.surname ? 'red' : '#ccc'}
                                value={formData.surname} 
                                onChangeText={handleTextChange('surname')} 
                            />
                        </Animated.View>
                        <Animated.View style={getTextInputStyle('email')}>
                            <TextInput 
                                placeholder="Email" 
                                placeholderTextColor={errors.email ? 'red' : '#ccc'}
                                value={formData.email} 
                                onChangeText={handleTextChange('email')} 
                                keyboardType="email-address" 
                                autoCapitalize="none" 
                            />
                        </Animated.View>
                        <Animated.View style={getTextInputStyle('password')}>
                            <TextInput 
                                placeholder="Mot de passe" 
                                placeholderTextColor={errors.password ? 'red' : '#ccc'}
                                value={formData.password} 
                                onChangeText={handleTextChange('password')} 
                                secureTextEntry 
                                autoCapitalize="none" 
                            />
                        </Animated.View>
                        {formData.isBotanist ? (
                            <Animated.View style={[styles.botanistContainer, { opacity: botanistAnimation, transform: [{ scale: botanistAnimation }] }]}>
                                <TextInput 
                                    style={styles.botanistInput}
                                    placeholder="Code Botaniste" 
                                    value={formData.botanistKey}
                                    onChangeText={handleTextChange('botanistKey')} 
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                                <TouchableOpacity onPress={() => setFormData((prevData) => ({ ...prevData, isBotanist: false }))} style={styles.closeButton}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="black" />
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            <View style={styles.switchContainer}>
                                <Text style={styles.switchLabel}>Êtes-vous un botaniste?</Text>
                                <Switch value={formData.isBotanist} onValueChange={(value) => setFormData((prevData) => ({ ...prevData, isBotanist: value }))} />
                            </View>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            <Text style={styles.buttonText}>Inscription</Text>
                        </TouchableOpacity>
                        <Text style={styles.switchText}>
                            Vous avez déjà un compte?{' '}
                            <Text style={styles.switchLink} onPress={() => navigation.navigate('Login')}>
                                Se connecter
                            </Text>
                        </Text>
                    </View>
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
        padding: 53,
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
        height: '70%', 
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
        marginBottom: 40,
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
        marginRight: 10,
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
        marginTop: 20,
        color: 'black',
    },
    switchLink: {
        color: '#077B17',
        fontWeight: 'bold',
    },
    botanistContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 20,
        position: 'relative',
    },
    botanistInput: {
        padding: 12,
        width: '50%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        textAlign: 'center',
        marginLeft: '20%',
    },       
    closeButton: {
        position: 'absolute',
        right: 5,
        top: '50%',
        marginTop: -10, 
    },
});
