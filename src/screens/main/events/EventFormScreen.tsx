// src/screens/events/EventFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EventFormProps {
  route: any;
  navigation: any;
}

export const EventFormScreen: React.FC<EventFormProps> = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  const isEditing = !!eventId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // +2 heures par défaut
    location: '',
    description: '',
    organizer: '',
    status: 'À venir'
  });

  // Charger les données de l'événement si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchEventData = async () => {
        try {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setFormData({
              title: eventData.title || '',
              type: eventData.type || '',
              startDate: eventData.startDate.toDate() || new Date(),
              endDate: eventData.endDate ? eventData.endDate.toDate() : new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
              location: eventData.location || '',
              description: eventData.description || '',
              organizer: eventData.organizer || '',
              status: eventData.status || 'À venir'
            });
          } else {
            Alert.alert('Erreur', 'Événement non trouvé');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données de l\'événement');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchEventData();
    }
  }, [isEditing, eventId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (showStartDatePicker) {
      setShowStartDatePicker(false);
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        const currentStartDate = new Date(formData.startDate);
        
        newDate.setHours(currentStartDate.getHours());
        newDate.setMinutes(currentStartDate.getMinutes());
        
        handleChange('startDate', newDate);
      }
    } else if (showStartTimePicker) {
      setShowStartTimePicker(false);
      if (selectedDate) {
        const newDate = new Date(formData.startDate);
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        
        handleChange('startDate', newDate);
      }
    } else if (showEndDatePicker) {
      setShowEndDatePicker(false);
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        const currentEndDate = new Date(formData.endDate);
        
        newDate.setHours(currentEndDate.getHours());
        newDate.setMinutes(currentEndDate.getMinutes());
        
        handleChange('endDate', newDate);
      }
    } else if (showEndTimePicker) {
      setShowEndTimePicker(false);
      if (selectedDate) {
        const newDate = new Date(formData.endDate);
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        
        handleChange('endDate', newDate);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return false;
    }
    if (!formData.type.trim()) {
      Alert.alert('Erreur', 'Le type d\'événement est requis');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Erreur', 'Le lieu est requis');
      return false;
    }
    if (formData.endDate < formData.startDate) {
      Alert.alert('Erreur', 'La date de fin doit être postérieure à la date de début');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const eventData = {
        ...formData
      };
      
      if (isEditing) {
        // Mise à jour d'un événement existant
        await updateDoc(doc(db, 'events', eventId), eventData);
        Alert.alert('Succès', 'Événement mis à jour avec succès');
      } else {
        // Création d'un nouvel événement
        const newEventRef = doc(collection(db, 'events'));
        await setDoc(newEventRef, {
          ...eventData,
          id: newEventRef.id
        });
        Alert.alert('Succès', 'Événement créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'événement');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D7599" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Text style={styles.headerTitle}>
            {isEditing ? 'Modifier l\'événement' : 'Ajouter un événement'}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="Titre de l'événement"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type d'événement *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un type" value="" />
                  <Picker.Item label="Conférence" value="Conférence" />
                  <Picker.Item label="Séminaire" value="Séminaire" />
                  <Picker.Item label="Atelier" value="Atelier" />
                  <Picker.Item label="Réunion" value="Réunion" />
                  <Picker.Item label="Examen" value="Examen" />
                  <Picker.Item label="Événement social" value="Événement social" />
                  <Picker.Item label="Autre" value="Autre" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date et heure de début *</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#5D7599" />
                  <Text style={styles.dateTimeText}>{formatDate(formData.startDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#5D7599" />
                  <Text style={styles.dateTimeText}>{formatTime(formData.startDate)}</Text>
                </TouchableOpacity>
              </View>
              
              {(showStartDatePicker || showStartTimePicker) && (
                <DateTimePicker
                  value={formData.startDate}
                  mode={showStartDatePicker ? 'date' : 'time'}
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date et heure de fin *</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#5D7599" />
                  <Text style={styles.dateTimeText}>{formatDate(formData.endDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#5D7599" />
                  <Text style={styles.dateTimeText}>{formatTime(formData.endDate)}</Text>
                </TouchableOpacity>
              </View>
              
              {(showEndDatePicker || showEndTimePicker) && (
                <DateTimePicker
                  value={formData.endDate}
                  mode={showEndDatePicker ? 'date' : 'time'}
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Lieu *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleChange('location', value)}
                placeholder="Lieu de l'événement"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Organisateur</Text>
              <TextInput
                style={styles.input}
                value={formData.organizer}
                onChangeText={(value) => handleChange('organizer', value)}
                placeholder="Organisateur de l'événement"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Statut</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="À venir" value="À venir" />
                  <Picker.Item label="En cours" value="En cours" />
                  <Picker.Item label="Terminé" value="Terminé" />
                  <Picker.Item label="Annulé" value="Annulé" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Description de l'événement"
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "plus-circle"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter l\'événement'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 0.48,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D7599',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default EventFormScreen;
