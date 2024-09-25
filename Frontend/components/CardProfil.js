import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const CardProfil = ({ imageUrl, onPress }) => {
  return (
    <TouchableOpacity style={styles.photo} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.photoImage} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  photo: {
    width: '32%',
    marginBottom: 10,
  },
  photoImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
  },
});

export default CardProfil;
