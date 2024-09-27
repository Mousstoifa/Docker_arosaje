import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Image, Keyboard, FlatList, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-loading-spinner-overlay';
import Card from '../components/Card';
//import { IPV4 } from '../Backend/config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import 'dotenv/config';


const CardsPage = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleAnnonces, setVisibleAnnonces] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigation = useNavigation();
    const searchWidth = useRef(new Animated.Value(0)).current;
    const textInputRef = useRef(null);

    const fetchAnnonces = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_API_KEY_IPV4}3000/annonces/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des annonces');
            }
            let data = await response.json();
            data.sort((a, b) => new Date(b.datePoste) - new Date(a.datePoste));
            setAnnonces(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des annonces:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnonces();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAnnonces();
        }, [])
    );

    const handleSearchPress = () => {
        setIsSearchOpen(true);
        Animated.timing(searchWidth, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            textInputRef.current.focus();
        });
    };

    const handleCloseSearch = () => {
        Keyboard.dismiss();
        setIsSearchOpen(false);
        setSearchText('');
        Animated.timing(searchWidth, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const handleSearch = () => {
        if (searchText) {
            navigation.navigate('SearchResults', { query: searchText });
        }
    };

    const handleFilterPress = () => {
        console.log('Filtre pressé');
    };

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleAnnonces(prevVisibleAnnonces => prevVisibleAnnonces + 10);
            setIsLoadingMore(false);
        }, 2000);
    };

    const handleScroll = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        if (isCloseToBottom && visibleAnnonces < annonces.length && !isLoadingMore) {
            handleLoadMore();
        }
    };

    const handleMapPress = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Spinner visible={loading} textContent={'Chargement...'} textStyle={styles.spinnerTextStyle} />
            <View style={styles.header}>
                {!isSearchOpen && (
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                        <Image
                            source={require('../assets/loupe.png')}
                            style={{ width: 30, height: 30 }}
                        />
                    </TouchableOpacity>
                )}
                <Animated.View style={[styles.searchBar, {
                    width: searchWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['30%', '65%'],
                    }),
                    opacity: searchWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    }),
                }]}>
                    <TextInput
                        ref={textInputRef}
                        style={styles.input}
                        placeholder="Rechercher..."
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleCloseSearch}>
                        <Icon name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
                {isSearchOpen && (
                    <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
                        <Icon name="filter-outline" size={30} color="#000" />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={annonces.slice(0, visibleAnnonces)}
                keyExtractor={(item) => item.Code_Postes.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('DetailPoste', { annonce: item })}
                    >
                        <Card
                            plantImage={item.photo}
                            plantName={item.titre}
                            location={item.localisation}
                            userName={item.userName}
                            userImage={item.userImage}
                            status={item.status}
                            datePoste={item.datePoste}
                        />
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
                onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
                ListFooterComponent={isLoadingMore && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#0000ff" />
                        <Text style={styles.loadingText}>Chargement des autres annonces...</Text>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
                <Ionicons name="map-outline" size={30} color="#fff" />
            </TouchableOpacity>

            {isModalVisible && (
                <>
                    <View style={styles.modalBackground} />
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={handleCloseModal}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                    <Icon name="close" size={30} color="#000" />
                                </TouchableOpacity>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: 37.78825,
                                        longitude: -122.4324,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mapButton: {
        position: 'absolute',
        bottom: 70,
        right: 30,
        backgroundColor: '#077B17',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    header: {
        height: 160,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
    },
    searchButton: {
        position: 'absolute',
        top: 80,
        right: 150,
        padding: 10,
        zIndex: 2,
    },
    searchBar: {
        position: 'absolute',
        top: 85,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 38,
    },
    filterButton: {
        position: 'absolute',
        top: 84,
        right: 10,
        padding: 5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#077B17',
    },
    spinnerTextStyle: {
        color: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 2, 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        height: '70%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default CardsPage;