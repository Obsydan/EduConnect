// src/screens/main/ProfileScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 120;
const PROFILE_IMAGE_MAX_SIZE = 120;
const PROFILE_IMAGE_MIN_SIZE = 80;

// Nouvelle palette de couleurs plus harmonieuse
const COLORS = {
  primary: '#8C7569',       // Marron principal (plus foncé)
  primaryLight: '#A89B91',  // Marron clair
  background: '#F5EEE6',    // Fond beige clair
  accent: '#B9846F',        // Accent terracotta
  text: '#3A3238',          // Texte principal presque noir
  textLight: '#6D6A75',     // Texte secondaire gris
  white: '#FFFFFF',
  error: '#D64045',         // Rouge pour les erreurs
  success: '#6B9080',       // Vert pour le succès
  divider: '#E8E2D7',       // Couleur des séparateurs
};
const ProfileScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  const { user, updateUserProfile, updateUserEmail, updateUserPassword, logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    role: '',
    createdAt: '',
  });
  
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Animation pour l'en-tête rétractable
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Interpolations pour les animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp'
  });
  
  const profileImageSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [PROFILE_IMAGE_MAX_SIZE, PROFILE_IMAGE_MIN_SIZE],
    extrapolate: 'clamp'
  });
  
  const profileImageBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [PROFILE_IMAGE_MAX_SIZE / 2, PROFILE_IMAGE_MIN_SIZE / 2],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp'
  });
  
  const userNameFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [24, 20],
    extrapolate: 'clamp'
  });

  // Récupérer les données utilisateur depuis Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              fullName: data.fullName || user.displayName || '',
              email: data.email || user.email || '',
              role: data.role || 'Utilisateur',
              createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '',
            });
            setNewName(data.fullName || user.displayName || '');
            setNewEmail(data.email || user.email || '');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Sélection d'image de profil
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner cette image.');
    }
  };
  
  // Téléchargement de l'image de profil
  const uploadProfileImage = async (uri: string) => {
    if (!user) return;
    
    setUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Mettre à jour le profil utilisateur avec la nouvelle image
      await updateUserProfile(downloadURL);
      
      // Mettre à jour Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
      });
      
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.');
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour votre photo de profil.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Enregistrer les modifications du profil
  const saveChanges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mettre à jour le nom d'utilisateur si modifié
      if (newName !== userData.fullName) {
        await updateUserProfile(newName);
        setUserData(prev => ({ ...prev, fullName: newName }));
      }
      
      // Mettre à jour l'email si modifié
      if (newEmail !== userData.email) {
        await updateUserEmail(newEmail);
        setUserData(prev => ({ ...prev, email: newEmail }));
      }
      
      // Mettre à jour le mot de passe si saisi
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
        
        if (!currentPassword) {
          Alert.alert('Erreur', 'Veuillez saisir votre mot de passe actuel.');
          setLoading(false);
          return;
        }
        
        await updateUserPassword(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Succès', 'Votre mot de passe a été mis à jour.');
      }
      
      setEditMode(false);
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de votre profil.');
    } finally {
      setLoading(false);
    }
  };
  
  // Déconnexion
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
    }
  };
  
  // Confirmation de déconnexion
  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {/* En-tête animé */}
      <Animated.View 
        style={[
          styles.headerSection, 
          { 
            height: headerHeight,
            opacity: headerOpacity
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.profileImageContainer,
            {
              width: profileImageSize,
              height: profileImageSize,
              borderRadius: profileImageBorderRadius
            }
          ]}
        >
          {uploadingImage ? (
            <ActivityIndicator size="large" color={COLORS.white} />
          ) : (
            <>
              {user?.photoURL ? (
                <Animated.Image 
                  source={{ uri: user.photoURL }} 
                  style={[
                    styles.profileImage,
                    {
                      width: profileImageSize,
                      height: profileImageSize,
                      borderRadius: profileImageBorderRadius
                    }
                  ]} 
                />
              ) : (
                <Animated.View 
                  style={[
                    styles.profilePlaceholder,
                    {
                      width: profileImageSize,
                      height: profileImageSize,
                      borderRadius: profileImageBorderRadius
                    }
                  ]}
                >
                  <Animated.Text 
                    style={[
                      styles.profileInitial,
                      {
                        fontSize: scrollY.interpolate({
                          inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
                          outputRange: [48, 32],
                          extrapolate: 'clamp'
                        })
                      }
                    ]}
                  >
                    {userData.fullName.charAt(0).toUpperCase()}
                  </Animated.Text>
                </Animated.View>
              )}
              <TouchableOpacity 
                style={styles.changePhotoButton} 
                onPress={pickImage}
              >
                <MaterialCommunityIcons name="camera" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.userName,
            { fontSize: userNameFontSize }
          ]}
        >
          {userData.fullName}
        </Animated.Text>
        
        <Animated.View 
          style={[
            styles.roleBadge,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
                outputRange: [1, 0.8],
                extrapolate: 'clamp'
              })
            }
          ]}
        >
          <Text style={styles.roleText}>{userData.role}</Text>
        </Animated.View>
      </Animated.View>
      
      <Animated.ScrollView 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: HEADER_MAX_HEIGHT + 10 }
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Section des informations utilisateur */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            {!editMode && (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setEditMode(true)}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {editMode ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Votre nom complet"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Votre email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.passwordSection}>
                <Text style={styles.passwordSectionTitle}>Changer le mot de passe</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mot de passe actuel</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Mot de passe actuel"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nouveau mot de passe"
                    secureTextEntry
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmer le mot de passe"
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setEditMode(false);
                    setNewName(userData.fullName);
                    setNewEmail(userData.email);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={saveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nom complet</Text>
                  <Text style={styles.infoValue}>{userData.fullName}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="email" size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData.email}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Membre depuis</Text>
                  <Text style={styles.infoValue}>{userData.createdAt || 'Non disponible'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        {/* Section des paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.primary} />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textLight} style={styles.settingArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="shield-outline" size={22} color={COLORS.primary} />
            <Text style={styles.settingText}>Confidentialité</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textLight} style={styles.settingArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.settingText}>Aide et support</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textLight} style={styles.settingArrow} />
          </TouchableOpacity>
        </View>
        
        {/* Bouton de déconnexion */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={confirmLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        
        {/* Espace supplémentaire en bas pour s'assurer que tout est visible */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  headerSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImageContainer: {
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  profileImage: {
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePlaceholder: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileInitial: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    zIndex: 10,
  },
  userName: {
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  roleText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
  infoList: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 2,
  },
  editForm: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f8f5f2',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  passwordSection: {
    marginTop: 20,
    marginBottom: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  passwordSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 15,
    flex: 1,
  },
  settingArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
