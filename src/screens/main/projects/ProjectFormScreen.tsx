// src/screens/projects/ProjectFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: any;
  supervisor: string;
  participants: string[];
  category: string;
  objectives?: string;
  resources?: string;
}

export const ProjectFormScreen = ({ route, navigation }: any) => {
  const { projectId } = route.params || {};
  const isEditing = !!projectId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    status: 'En attente',
    deadline: new Date(),
    supervisor: '',
    participants: [],
    category: 'Recherche',
    objectives: '',
    resources: ''
  });

  // Charger les données du projet si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchProjectData = async () => {
        try {
          const projectDoc = await getDoc(doc(db, 'projects', projectId));
          
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            // Convertir la date Firestore en objet Date
            const deadline = projectData.deadline?.toDate ? 
              projectData.deadline.toDate() : 
              new Date(projectData.deadline);
              
            setFormData({
              ...projectData,
              deadline
            });
          } else {
            Alert.alert('Erreur', 'Projet non trouvé');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données du projet');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchProjectData();
    }
  }, [isEditing, projectId]);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('deadline', selectedDate);
    }
  };

  const handleParticipantsChange = (text: string) => {
    // Convertir la chaîne en tableau en séparant par des virgules
    const participantsArray = text.split(',').map(p => p.trim()).filter(p => p);
    handleChange('participants', participantsArray);
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      Alert.alert('Erreur', 'Le titre du projet est requis');
      return false;
    }
    if (!formData.supervisor?.trim()) {
      Alert.alert('Erreur', 'Le nom du superviseur est requis');
      return false;
    }
    if (!formData.category?.trim()) {
      Alert.alert('Erreur', 'La catégorie du projet est requise');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Mise à jour d'un projet existant
        await updateDoc(doc(db, 'projects', projectId), formData);
        Alert.alert('Succès', 'Projet mis à jour avec succès');
      } else {
        // Création d'un nouveau projet
        const newProjectRef = doc(collection(db, 'projects'));
        await setDoc(newProjectRef, {
          ...formData,
          id: newProjectRef.id
        });
        Alert.alert('Succès', 'Projet créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le projet');
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
          <Text style={styles.title}>
            {isEditing ? 'Modifier le projet' : 'Ajouter un projet'}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre du projet *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="Titre du projet"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catégorie *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Recherche" value="Recherche" />
                  <Picker.Item label="Développement" value="Développement" />
                  <Picker.Item label="Innovation" value="Innovation" />
                  <Picker.Item label="Éducation" value="Éducation" />
                  <Picker.Item label="Autre" value="Autre" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Statut *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="En attente" value="En attente" />
                  <Picker.Item label="En cours" value="En cours" />
                  <Picker.Item label="Terminé" value="Terminé" />
                  <Picker.Item label="Annulé" value="Annulé" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date d'échéance *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.deadline?.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <MaterialCommunityIcons name="calendar" size={22} color="#5D7599" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.deadline || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Superviseur *</Text>
              <TextInput
                style={styles.input}
                value={formData.supervisor}
                onChangeText={(value) => handleChange('supervisor', value)}
                placeholder="Nom du superviseur"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Participants (séparés par des virgules)</Text>
              <TextInput
                style={styles.input}
                value={formData.participants?.join(', ')}
                onChangeText={handleParticipantsChange}
                placeholder="Nom1, Nom2, Nom3..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Description du projet"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Objectifs</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.objectives}
                onChangeText={(value) => handleChange('objectives', value)}
                placeholder="Objectifs du projet"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ressources</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.resources}
                onChangeText={(value) => handleChange('resources', value)}
                placeholder="Ressources nécessaires"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
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
                  <MaterialCommunityIcons name={isEditing ? "content-save" : "clipboard-plus"} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter le projet'}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  dateInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProjectFormScreen;
