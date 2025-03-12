// src/screens/resources/ResourceFormScreen.tsx
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
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  code: string;
}

interface ResourceFormProps {
  route: any;
  navigation: any;
}

export const ResourceFormScreen: React.FC<ResourceFormProps> = ({ route, navigation }) => {
  const { resourceId } = route.params || {};
  const isEditing = !!resourceId;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    courseId: '',
    courseName: '',
    description: '',
    fileUrl: '',
    fileType: '',
    size: 0
  });

  // Charger les cours disponibles
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          code: doc.data().code
        }));
        
        setCourses(coursesList);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      }
    };

    fetchCourses();
  }, []);

  // Charger les données de la ressource si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchResourceData = async () => {
        try {
          const resourceDoc = await getDoc(doc(db, 'resources', resourceId));
          
          if (resourceDoc.exists()) {
            const resourceData = resourceDoc.data();
            setFormData({
              title: resourceData.title || '',
              type: resourceData.type || '',
              courseId: resourceData.courseId || '',
              courseName: resourceData.courseName || '',
              description: resourceData.description || '',
              fileUrl: resourceData.fileUrl || '',
              fileType: resourceData.fileType || '',
              size: resourceData.size || 0
            });
          } else {
            Alert.alert('Erreur', 'Ressource non trouvée');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données de la ressource');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchResourceData();
    }
  }, [isEditing, resourceId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si le cours change, mettre à jour le nom du cours
    if (field === 'courseId' && value) {
      const selectedCourse = courses.find(course => course.id === value);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          courseName: selectedCourse.title
        }));
      }
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.canceled === false) {
        setSelectedFile(result);
        
        // Extraire le type de fichier de l'extension
        const fileNameParts = result.assets[0].name.split('.');
        const fileType = fileNameParts[fileNameParts.length - 1].toLowerCase();
        
        setFormData(prev => ({
          ...prev,
          fileType: fileType,
          size: result.assets[0].size || 0
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre de la ressource est requis');
      return false;
    }
    if (!formData.type.trim()) {
      Alert.alert('Erreur', 'Le type de ressource est requis');
      return false;
    }
    if (!isEditing && !selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier');
      return false;
    }
    return true;
  };

  const uploadFile = async () => {
    if (!selectedFile || selectedFile.canceled) return null;
    
    const asset = selectedFile.assets[0];
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `resources/${Date.now()}_${asset.name}`);
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
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let fileUrl = formData.fileUrl;
      
      // Si un nouveau fichier a été sélectionné, le télécharger
      if (selectedFile && !selectedFile.canceled) {
        fileUrl = await uploadFile() || '';
      }
      
      const resourceData = {
        title: formData.title,
        type: formData.type,
        courseId: formData.courseId,
        courseName: formData.courseName,
        description: formData.description,
        fileUrl: fileUrl,
        fileType: formData.fileType,
        size: formData.size,
        uploadDate: new Date(),
        uploadedBy: user?.displayName || user?.email || 'Utilisateur inconnu'
      };
      
      if (isEditing) {
        // Mise à jour d'une ressource existante
        await updateDoc(doc(db, 'resources', resourceId), resourceData);
        Alert.alert('Succès', 'Ressource mise à jour avec succès');
      } else {
        // Création d'une nouvelle ressource
        const newResourceRef = doc(collection(db, 'resources'));
        await setDoc(newResourceRef, {
          ...resourceData,
          id: newResourceRef.id
        });
        Alert.alert('Succès', 'Ressource créée avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la ressource');
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
            {isEditing ? 'Modifier la ressource' : 'Ajouter une ressource'}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre de la ressource *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="Titre de la ressource"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de ressource *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un type" value="" />
                  <Picker.Item label="Cours" value="Cours" />
                  <Picker.Item label="TD" value="TD" />
                  <Picker.Item label="TP" value="TP" />
                  <Picker.Item label="Examen" value="Examen" />
                  <Picker.Item label="Projet" value="Projet" />
                  <Picker.Item label="Documentation" value="Documentation" />
                  <Picker.Item label="Autre" value="Autre" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cours associé</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.courseId}
                  onValueChange={(value) => handleChange('courseId', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Aucun cours associé" value="" />
                  {courses.map((course) => (
                    <Picker.Item 
                      key={course.id} 
                      label={`${course.code} - ${course.title}`} 
                      value={course.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Description de la ressource"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fichier *</Text>
              {isEditing && formData.fileUrl ? (
                <View style={styles.existingFileContainer}>
                  <MaterialCommunityIcons 
                    name="file-document" 
                    size={24} 
                    color="#5D7599" 
                  />
                  <Text style={styles.existingFileName} numberOfLines={1}>
                    {formData.fileUrl.split('/').pop() || 'Fichier existant'}
                  </Text>
                </View>
              ) : null}
              
              <TouchableOpacity
                style={styles.filePicker}
                onPress={pickDocument}
              >
                <MaterialCommunityIcons name="upload" size={24} color="#5D7599" />
                <Text style={styles.filePickerText}>
                  {selectedFile && !selectedFile.canceled 
                    ? selectedFile.assets[0].name 
                    : isEditing 
                      ? 'Remplacer le fichier' 
                      : 'Sélectionner un fichier'}
                </Text>
              </TouchableOpacity>
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
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter la ressource'}
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
  existingFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  existingFileName: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    borderRadius: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#5D7599',
    borderStyle: 'dashed',
  },
  filePickerText: {
    fontSize: 16,
    color: '#5D7599',
    marginLeft: 10,
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

export default ResourceFormScreen;
