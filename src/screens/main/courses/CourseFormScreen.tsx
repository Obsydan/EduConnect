// src/screens/courses/CourseFormScreen.tsx
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
import { Course } from '../../../types';
import { Picker } from '@react-native-picker/picker';

export const CourseFormScreen = ({ route, navigation }: any) => {
  const { courseId } = route.params || {};
  const isEditing = !!courseId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    code: '',
    credits: 0,
    instructor: '',
    department: '',
    semester: '',
    description: ''
  });

  // Charger les données du cours si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchCourseData = async () => {
        try {
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          
          if (courseDoc.exists()) {
            setFormData(courseDoc.data() as Course);
          } else {
            Alert.alert('Erreur', 'Cours non trouvé');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données du cours');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchCourseData();
    }
  }, [isEditing, courseId]);

  const handleChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'credits' ? Number(value) : value
    }));
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      Alert.alert('Erreur', 'Le titre du cours est requis');
      return false;
    }
    if (!formData.code?.trim()) {
      Alert.alert('Erreur', 'Le code du cours est requis');
      return false;
    }
    if (formData.credits === undefined || formData.credits <= 0) {
      Alert.alert('Erreur', 'Le nombre de crédits doit être supérieur à 0');
      return false;
    }
    if (!formData.instructor?.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'enseignant est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Mise à jour d'un cours existant
        await updateDoc(doc(db, 'courses', courseId), formData);
        Alert.alert('Succès', 'Cours mis à jour avec succès');
      } else {
        // Création d'un nouveau cours
        const newCourseRef = doc(collection(db, 'courses'));
        await setDoc(newCourseRef, {
          ...formData,
          id: newCourseRef.id
        });
        Alert.alert('Succès', 'Cours créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le cours');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B6CB7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#f0f0f3', '#e6e6e6']}
        style={styles.background}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditing ? 'Modifier le cours' : 'Ajouter un cours'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre du cours *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="Titre du cours"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Code du cours *</Text>
              <TextInput
                style={styles.input}
                value={formData.code}
                onChangeText={(value) => handleChange('code', value)}
                placeholder="Ex: INFO101"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Crédits *</Text>
              <TextInput
                style={styles.input}
                value={formData.credits?.toString()}
                onChangeText={(value) => handleChange('credits', value)}
                placeholder="Nombre de crédits"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Enseignant *</Text>
              <TextInput
                style={styles.input}
                value={formData.instructor}
                onChangeText={(value) => handleChange('instructor', value)}
                placeholder="Nom de l'enseignant"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Département</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(value) => handleChange('department', value)}
                placeholder="Département"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Semestre</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.semester}
                  onValueChange={(value) => handleChange('semester', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un semestre" value="" />
                  <Picker.Item label="Semestre 1" value="Semestre 1" />
                  <Picker.Item label="Semestre 2" value="Semestre 2" />
                  <Picker.Item label="Semestre 3" value="Semestre 3" />
                  <Picker.Item label="Semestre 4" value="Semestre 4" />
                  <Picker.Item label="Semestre 5" value="Semestre 5" />
                  <Picker.Item label="Semestre 6" value="Semestre 6" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Description du cours"
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
                  <MaterialCommunityIcons name={isEditing ? "content-save" : "book-plus"} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter le cours'}
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
    backgroundColor: '#f0f0f3',
  },
  background: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f3',
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
    backgroundColor: '#f0f0f3',
    shadowColor: '#BABECC',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B6CB7',
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

export default CourseFormScreen;
