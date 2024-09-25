import React, { useState, useRef } from 'react';
import { StyleSheet, Text, Pressable, View, Image, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';

export default function Photos({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
        <Button onPress={requestPermission} title="Accorder la permission" />
      </View>
    );
  }

  const takePicture = async () => {
    try {
      if (cameraRef.current) {
        setIsTakingPicture(true);
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedPhoto(photo.uri);
        setLoading(false);
        setIsTakingPicture(false);
        navigation.navigate('CameraPreview', { photo: photo.uri });
      }
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      setLoading(false);
      setIsTakingPicture(false);
      // Ajoutez des gestionnaires d'erreurs supplémentaires ici si nécessaire
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setCapturedPhoto(result.assets[0].uri);
        navigation.navigate('CameraPreview', { photo: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      // Ajoutez des gestionnaires d'erreurs supplémentaires ici si nécessaire
    }
  };

  const toggleFlashMode = () => {
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
    setIsFlashOn(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        ref={cameraRef}
      >
        <View style={styles.topLeftContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={32} color="white" />
          </Pressable>
        </View>
        <View style={styles.topRightContainer}>
          <View style={styles.flashButtonContainer}>
            {isFlashOn && (
              <View style={styles.flashIndicator}></View>
            )}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={toggleFlashMode}>
              <MaterialCommunityIcons name="flash-outline" size={32} color="white" />
            </Pressable>
          </View>
        </View>
        <View style={styles.topCenterContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={() => setInfoVisible(true)}>
            <Ionicons name="information-circle-outline" size={32} color="white" />
          </Pressable>
        </View>
        <View style={styles.centerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.cameraButton,
              loading && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
            onPress={loading ? null : takePicture}
            disabled={loading}
          >
            {loading ? (
              <LottieView
                source={require('../assets/loading.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : (
              <View style={styles.imageContainer}>
                {isTakingPicture ? (
                  <LottieView
                    source={require('../assets/loading.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                  />
                ) : (
                  <Image
                    style={styles.cameraImage}
                    source={require('../assets/plantecamera.png')}
                  />
                )}
              </View>
            )}
          </Pressable>
        </View>
        <View style={styles.bottomRightContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={pickImage}>
            <Ionicons name="images-outline" size={32} color="white" />
          </Pressable>
        </View>
        <View style={styles.cornerTopLeft}></View>
        <View style={styles.cornerTopRight}></View>
        <View style={styles.cornerBottomLeft}></View>
        <View style={styles.cornerBottomRight}></View>
      </CameraView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={infoVisible}
        onRequestClose={() => {
          setInfoVisible(!infoVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <Animatable.View animation="bounceIn" duration={600} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conseils pour la prise de photos de plantes</Text>
            <Text style={styles.modalText}>1. Assurez-vous d'avoir une bonne lumière naturelle.</Text>
            <Text style={styles.modalText}>2. Évitez les ombres dures en utilisant un éclairage diffus.</Text>
            <Text style={styles.modalText}>3. Prenez la photo de près pour capturer les détails.</Text>
            <Pressable style={styles.closeButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  camera: {
    flex: 1,
  },
  topLeftContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  topRightContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  topCenterContainer: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -16 }],
  },
  centerContainer: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -35 }],
  },
  bottomRightContainer: {
    position: 'absolute',
    bottom: 70,
    right: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    padding: 10,
    borderRadius: 50,
  },
  cameraButton: {
    borderRadius: 50,
  },
  lottieAnimation: {
    width: 80,
    height: 80,
  },
  imageContainer: {
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 50,
    padding: 5,
  },
  cameraImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  flashButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashIndicator: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#F48E34',
    zIndex: -1,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: 60,
    height: 60,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
    borderTopLeftRadius: 30,
  },
  cornerTopRight: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: 60,
    height: 60,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
    borderTopRightRadius: 30,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '35%',
    left: '15%',
    width: 60,
    height: 60,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
    borderBottomLeftRadius: 30,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '35%',
    right: '15%',
    width: 60,
    height: 60,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
    borderBottomRightRadius: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FF6347',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
  },
});