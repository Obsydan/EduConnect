// src/screens/users/AddUserScreen.tsx
import React, { useState } from 'react';
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
import { Shadow } from '@react-native-shadow/shadow';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../config/firebase';
import { useNavigation } from '@react-navigation/native';

export const AddUserScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'professor' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleAddUser = async () => {
    // Validation
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Ajouter les informations supplémentaires dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        role,
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert('Succès', 'Utilisateur créé avec succès');
      navigation.goBack();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erreur', 'Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erreur', 'Adresse email invalide');
      } else {
        Alert.alert('Erreur', 'Impossible de créer l\'utilisateur');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>Ajouter un utilisateur</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <Shadow
                inner={false}
                useArt={true}
                style={styles.inputShadow}
              >
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account" size={20} color="#8B8B8B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez le nom complet"
                    placeholderTextColor="#8B8B8B"
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </View>
              </Shadow>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Shadow
                inner={false}
                useArt={true}
                style={styles.inputShadow}
              >
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="email" size={20} color="#8B8B8B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez l'adresse email"
                    placeholderTextColor="#8B8B8B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </Shadow>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <Shadow
                inner={false}
                useArt={true}
                style={styles.inputShadow}
              >
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="lock" size={20} color="#8B8B8B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez le mot de passe"
                    placeholderTextColor="#8B8B8B"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </Shadow>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rôle</Text>
              <Shadow
                inner={false}
                useArt={true}
                style={styles.pickerShadow}
              >
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue as 'student' | 'professor' | 'admin')}
                    style={styles.picker}
                  >
                    <Picker.Item label="Étudiant" value="student" />
                    <Picker.Item label="Professeur" value="professor" />
                    <Picker.Item label="Administrateur" value="admin" />
                  </Picker>
                </View>
              </Shadow>
            </View>

            <Shadow
              inner={false}
              useArt={true}
              style={styles.buttonShadow}
            >
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddUser}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#4B6CB7', '#3A5599']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Créer l'utilisateur</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Shadow>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputShadow: {
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowColor: '#BABECC',
    shadowRadius: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f3',
    width: '100%',
    height: 56,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  pickerShadow: {
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowColor: '#BABECC',
    shadowRadius: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f3',
    width: '100%',
    height: 56,
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f3',
  },
  picker: {
    height: 56,
    width: '100%',
  },
  buttonShadow: {
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowColor: '#BABECC',
    shadowRadius: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f3',
    width: '100%',
    height: 56,
    marginTop: 10,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    height: 56,
  },
  buttonGradient: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddUserScreen;

