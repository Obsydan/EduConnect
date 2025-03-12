// src/screens/teachers/TeacherFormScreen.tsx
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
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

interface TeacherFormProps {
  route: any;
  navigation: any;
}

export const TeacherFormScreen: React.FC<TeacherFormProps> = ({ route, navigation }) => {
  const { teacherId } = route.params || {};
  const isEditing = !!teacherId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    title: '',
    specialization: '',
    bio: '',
    photoURL: '',
    officeLocation: '',
    officeHours: ''
  });

  // Charger les données de l'enseignant si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchTeacherData = async () => {
        try {
          const teacherDoc = await getDoc(doc(db, 'teachers', teacherId));
          
          if (teacherDoc.exists()) {
            const teacherData = teacherDoc.data();
            setFormData({
              firstName: teacherData.firstName || '',
              lastName: teacherData.lastName || '',
              email: teacherData.email || '',
              phoneNumber: teacherData.phoneNumber || '',
              department: teacherData.department || '',
              title: teacherData.title || '',
              specialization: teacherData.specialization || '',
              bio: teacherData.bio || '',
              photoURL: teacherData.photoURL || '',
              officeLocation: teacherData.officeLocation || '',
              officeHours: teacherData.officeHours || ''
            });
            
            if (teacherData.photoURL) {
              setSelectedImage(teacherData.photoURL);
            }
          } else {
            Alert.alert('Erreur', 'Enseignant non trouvé');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données de l\'enseignant');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchTeacherData();
    }
  }, [isEditing, teacherId]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est requis');
      return false;
    }
    if (!formData.department.trim()) {
      Alert.alert('Erreur', 'Le département est requis');
      return false;
    }
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return false;
    }
    return true;
  };

  const uploadImage = async () => {
    if (!selectedImage || selectedImage === formData.photoURL) return formData.photoURL;
    
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `teachers/${Date.now()}_profile`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progression du téléchargement
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            // Erreur
            console.error('Erreur lors du téléchargement:', error);
            reject(error);
          },
          async () => {
            // Succès
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let photoURL = formData.photoURL;
      
      // Si une nouvelle image a été sélectionnée, la télécharger
      if (selectedImage && selectedImage !== formData.photoURL) {
        photoURL = await uploadImage() || '';
      }
      
      const teacherData = {
        ...formData,
        photoURL
      };
      
      if (isEditing) {
        // Mise à jour d'un enseignant existant
        await updateDoc(doc(db, 'teachers', teacherId), teacherData);
        Alert.alert('Succès', 'Enseignant mis à jour avec succès');
      } else {
        // Création d'un nouvel enseignant
        const newTeacherRef = doc(collection(db, 'teachers'));
        await setDoc(newTeacherRef, {
          ...teacherData,
          id: newTeacherRef.id
        });
        Alert.alert('Succès', 'Enseignant créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'enseignant');
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
            {isEditing ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <MaterialCommunityIcons name="camera" size={40} color="#5D7599" />
                  <Text style={styles.imagePickerText}>Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                placeholder="Prénom"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                placeholder="Nom"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => handleChange('phoneNumber', value)}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Département *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un département" value="" />
                  <Picker.Item label="Informatique" value="Informatique" />
                  <Picker.Item label="Mathématiques" value="Mathématiques" />
                  <Picker.Item label="Physique" value="Physique" />
                  <Picker.Item label="Chimie" value="Chimie" />
                  <Picker.Item label="Biologie" value="Biologie" />
                  <Picker.Item label="Langues" value="Langues" />
                  <Picker.Item label="Sciences Humaines" value="Sciences Humaines" />
                  <Picker.Item label="Économie" value="Économie" />
                  <Picker.Item label="Droit" value="Droit" />
                  <Picker.Item label="Médecine" value="Médecine" />
                  <Picker.Item label="Autre" value="Autre" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.title}
                  onValueChange={(value) => handleChange('title', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un titre" value="" />
                  <Picker.Item label="Professeur" value="Professeur" />
                  <Picker.Item label="Maître de conférences" value="Maître de conférences" />
                  <Picker.Item label="Chargé de cours" value="Chargé de cours" />
                  <Picker.Item label="Assistant" value="Assistant" />
                  <Picker.Item label="Doctorant" value="Doctorant" />
                  <Picker.Item label="Intervenant externe" value="Intervenant externe" />
                  <Picker.Item label="Autre" value="Autre" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Spécialisation</Text>
              <TextInput
                style={styles.input}
                value={formData.specialization}
                onChangeText={(value) => handleChange('specialization', value)}
                placeholder="Spécialisation"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bureau</Text>
              <TextInput
                style={styles.input}
                value={formData.officeLocation}
                onChangeText={(value) => handleChange('officeLocation', value)}
                placeholder="Localisation du bureau"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Heures de permanence</Text>
              <TextInput
                style={styles.input}
                value={formData.officeHours}
                onChangeText={(value) => handleChange('officeHours', value)}
                placeholder="Ex: Lundi 14h-16h, Jeudi 10h-12h"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Biographie</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(value) => handleChange('bio', value)}
                placeholder="Biographie"
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
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter l\'enseignant'}
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
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#5D7599',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#5D7599',
    marginTop: 8,
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

export default TeacherFormScreen;
