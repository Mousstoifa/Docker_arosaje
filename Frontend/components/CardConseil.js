import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const getIcon = (theme) => {
  const iconSize = 32;
  const iconColor = '#077B17';

  switch (theme) {
    case 'Entretien Général':
      return <MaterialCommunityIcons name="flower" size={iconSize} color={iconColor} />;
    case 'Plantes d\'intérieur':
      return <Ionicons name="leaf" size={iconSize} color={iconColor} />;
    case 'Plantes d\'extérieur':
      return <MaterialCommunityIcons name="tree" size={iconSize} color={iconColor} />;
    case 'Hydroponie':
      return <Ionicons name="water" size={iconSize} color={iconColor} />;
    case 'Plantes Aromatiques':
      return <MaterialCommunityIcons name="seedling" size={iconSize} color={iconColor} />;
    case 'Jardinage Urbain':
      return <MaterialCommunityIcons name="city" size={iconSize} color={iconColor} />;
    default:
      return <Ionicons name="help-circle" size={iconSize} color={iconColor} />;
  }
};

const CardConseil = ({ conseil, onDelete, onEdit, isBotanist }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce conseil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(conseil.Code_Conseils) },
      ]
    );
  };

  const handleEdit = () => {
    onEdit(conseil);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{moment(conseil.Date).fromNow()}</Text>
        {isBotanist && (  // Affiche les boutons uniquement si l'utilisateur est un botaniste
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleEdit}>
              <Ionicons name="pencil-outline" size={20} color="#007bff" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-bin-outline" size={20} color="#d9534f" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.iconContainer}>
          {getIcon(conseil.Theme)}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{conseil.Titre}</Text>
          <Text style={styles.description}>
            {expanded ? conseil.Description : `${conseil.Description.substring(0, 100)}...`}
          </Text>
          {conseil.Description.length > 100 && (
            <TouchableOpacity onPress={toggleExpanded}>
              <Text style={styles.viewMore}>{expanded ? 'Voir moins' : 'Voir plus'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0,
    shadowColor: 'transparent',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  body: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginBottom: 13, 
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  viewMore: {
    fontSize: 14,
    color: '#007BFF',
    marginTop: 5,
  },
});

export default CardConseil;
