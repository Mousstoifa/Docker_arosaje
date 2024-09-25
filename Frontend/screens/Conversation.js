import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Animated, Text, Image, BackHandler } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';

import Header from '../components/HeaderMessage';
import { CommonActions } from '@react-navigation/native';


const Conversation = ({ route, navigation }) => {
  const { ownerId, annonceId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showSendButton, setShowSendButton] = useState(false);
  const [buttonOpacity] = useState(new Animated.Value(0));

  const handleBackPress = () => {
    // Réinitialise la pile de navigation et redirige vers l'écran Messages
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Messages' }],
      })
    );
    return true;
  };

  useEffect(() => {
    socket.on('SERVER_MSG', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('SERVER_MSG');
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Messages');
      return true; // Empêche la fermeture automatique de l'écran
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleTextChange = (value) => {
    setText(value);
    if (value.length > 0) {
      setShowSendButton(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setShowSendButton(false));
    }
  };

  const sendMessage = () => {
    const msg = {
      text,
      ownerId,
      annonceId,
    };
    socket.emit('CLIENT_MSG', msg);
    setText('');
    handleTextChange('');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const msg = {
        image: result.uri,
        ownerId,
        annonceId,
      };
      socket.emit('CLIENT_MSG', msg);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isOwnMessage = item.ownerId === ownerId;
    return (
      <View style={[styles.messageBubble, isOwnMessage ? styles.myMessage : styles.theirMessage]}>
        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
        {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Header
        userName="John Doe"
        onBackPress={() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Messages' }],
            })
          );
        }}
      />

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messages}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="smile-o" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={text}
          onChangeText={handleTextChange}
          placeholderTextColor="#ddd"
        />
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Text>
            <MaterialIcons name="photo-library" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
        {showSendButton && (
          <Animated.View style={{ opacity: buttonOpacity }}>
            <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
              <Text>
                <Ionicons name="send" size={24} color="#fff" />
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messages: {
    flex: 1,
    marginBottom: 10,
  },
  messageList: {
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#075E54',
    borderRadius: 30,
    margin: 10,
    height: 50,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: 'white',
  },
  iconButton: {
    marginHorizontal: 5,
  },
});

export default Conversation;