import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title, showBackButton, headerRight }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {headerRight && (
          <View style={styles.headerRight}>
            {headerRight()}
          </View>
        )}
        <LinearGradient
          colors={['transparent', '#d3d3d3', 'transparent']}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.gradientLine}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientLine: {
    position: 'absolute',
    bottom: 10,
    left: '25%',
    right: '25%',
    height: 2,
  },
  backButton: {
    position: 'absolute',
    left: 15,
  },
  headerRight: {
    position: 'absolute',
    right: 15,
  },
});

export default Header;
