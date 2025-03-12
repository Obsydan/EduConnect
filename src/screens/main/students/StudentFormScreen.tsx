// src/screens/students/StudentFormScreen.tsx
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
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Student, User } from '../../../types';
import { Picker } from '@react-native-picker/picker';

export const StudentFormScreen = ({ route, navigation }: any) => {
  const { studentId } = route.params || {};
  const isEditing = !!studentId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    matricule: '',
    userId: '',
    promotion: '',
    department: '',
    phoneNumber: '',
    address: ''
  });

  // Charger la liste des utilisateurs pour le sélecteur
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setUsers(usersList);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Charger les données de l'étudiant si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchStudentData = async () => {
        try {
          const studentDoc = await getDoc(doc(db, 'students', studentId));
          
          if (studentDoc.exists()) {
            setFormData(studentDoc.data() as Student);
          } else {
            Alert.alert('Erreur', 'Étudiant non trouvé');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          Alert.alert('Erreur', 'Impossible de charger les données de l\'étudiant');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchStudentData();
    }
  }, [isEditing, studentId]);

  const handleChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis');
      return false;
    }
    if (!formData.lastName?.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }
    if (!formData.matricule?.trim()) {
      Alert.alert('Erreur', 'Le matricule est requis');
      return false;
    }
    if (!formData.userId?.trim()) {
      Alert.alert('Erreur', 'L\'utilisateur associé est requis');
      return false;
    }
    if (!formData.promotion?.trim()) {
      Alert.alert('Erreur', 'La promotion est requise');
      return false;
    }
    if (!formData.department?.trim()) {
      Alert.alert('Erreur', 'Le département est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Mise à jour d'un étudiant existant
        await updateDoc(doc(db, 'students', studentId), formData);
        Alert.alert('Succès', 'Étudiant mis à jour avec succès');
      } else {
        // Création d'un nouvel étudiant
        const newStudentRef = doc(collection(db, 'students'));
        await setDoc(newStudentRef, {
          ...formData,
          id: newStudentRef.id
        });
        Alert.alert('Succès', 'Étudiant créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'étudiant');
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
              {isEditing ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                placeholder="Prénom de l'étudiant"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                placeholder="Nom de l'étudiant"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Matricule *</Text>
              <TextInput
                style={styles.input}
                value={formData.matricule}
                onChangeText={(value) => handleChange('matricule', value)}
                placeholder="Matricule de l'étudiant"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Utilisateur associé *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.userId}
                  onValueChange={(value) => handleChange('userId', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un utilisateur" value="" />
                  {users.map(user => (
                    <Picker.Item 
                      key={user.id} 
                      label={`${user.firstName} ${user.lastName} (${user.email})`} 
                      value={user.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Promotion *</Text>
              <TextInput
                style={styles.input}
                value={formData.promotion}
                onChangeText={(value) => handleChange('promotion', value)}
                placeholder="Promotion (ex: 2025)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Département *</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(value) => handleChange('department', value)}
                placeholder="Département ou filière"
                placeholderTextColor="#999"
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
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Adresse complète"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
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
                  <MaterialCommunityIcons name={isEditing ? "content-save" : "account-plus"} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Enregistrer les modifications' : 'Ajouter l\'étudiant'}
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
    height: 100,
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

export default StudentFormScreen;
