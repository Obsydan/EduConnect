// src/screens/events/EventDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: any;
  endDate?: any;
  location: string;
  description?: string;
  organizer?: string;
  status: string;
}

export const EventDetailScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (eventDoc.exists()) {
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data()
          } as Event);
        } else {
          Alert.alert('Erreur', 'Événement non trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', eventId));
              Alert.alert('Succès', 'Événement supprimé avec succès');
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (event) {
      try {
        const startDate = event.startDate.toDate ? 
          event.startDate.toDate().toLocaleDateString() : 
          new Date(event.startDate).toLocaleDateString();
          
        await Share.share({
          message: `Événement: ${event.title}\nDate: ${startDate}\nLieu: ${event.location}\n\n${event.description || ''}`,
          title: event.title,
        });
      } catch (error) {
        Alert.alert('Erreur', "Impossible de partager cet événement");
      }
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'à venir':
        return '#5D7599';
      case 'en cours':
        return '#4CAF50';
      case 'terminé':
        return '#8C7569';
      case 'annulé':
        return '#FF6B6B';
      default:
        return '#5D7599';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D7599" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Événement non disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5EEE6', '#F0E9E2']}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Détails de l'événement</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={[styles.eventStatusBadge, { backgroundColor: `${getStatusColor(event.status)}20` }]}>
              <Text style={[styles.eventStatus, { color: getStatusColor(event.status) }]}>
                {event.status}
              </Text>
            </View>
            <Text style={styles.eventType}>{event.type}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="calendar" size={22} color="#5D7599" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardValue}>{formatDate(event.startDate)}</Text>
                {event.endDate && (
                  <Text style={styles.cardValue}>
                    {event.startDate.toDate().toDateString() !== event.endDate.toDate().toDateString() && 
                      `au ${formatDate(event.endDate)}`}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="clock-outline" size={22} color="#5D7599" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Heure</Text>
                <Text style={styles.cardValue}>
                  {formatTime(event.startDate)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="map-marker" size={22} color="#5D7599" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Lieu</Text>
                <Text style={styles.cardValue}>{event.location}</Text>
              </View>
            </View>
            
            {event.organizer && (
              <View style={styles.cardRow}>
                <MaterialCommunityIcons name="account-group" size={22} color="#5D7599" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Organisateur</Text>
                  <Text style={styles.cardValue}>{event.organizer}</Text>
                </View>
              </View>
            )}
          </View>

          {event.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="share-variant" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Partager</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditEvent', { eventId: event.id })}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#5D7599" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#FF6B6B" />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE6',
  },
  background: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE6',
  },
  errorText: {
    fontSize: 18,
    color: '#8C7569',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  eventHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  eventStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  eventStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 16,
    color: '#8C7569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  cardContent: {
    marginLeft: 12,
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8C7569',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#333',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    backgroundColor: '#8C7569',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: '#5D7599',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EventDetailScreen;
