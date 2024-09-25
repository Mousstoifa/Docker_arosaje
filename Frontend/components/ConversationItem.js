import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ConversationItem = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(conversation)} style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.userName}>{conversation.userName}</Text>
        <Text style={styles.lastMessage}>{conversation.lastMessage}</Text>
      </View>
      <Image source={{ uri: conversation.profilePic }} style={styles.profilePic} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#777',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default ConversationItem;
