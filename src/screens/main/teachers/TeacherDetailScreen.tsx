// src/screens/teachers/TeacherDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  title: string;
  phoneNumber?: string;
  specialization?: string;
  bio?: string;
  photoURL?: string;
  officeLocation?: string;
  officeHours?: string;
}

export const TeacherDetailScreen = ({ route, navigation }: any) => {
  const { teacherId } = route.params;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        setLoading(true);
        const teacherDoc = await getDoc(doc(db, 'teachers', teacherId));
        
        if (teacherDoc.exists()) {
          setTeacher({
            id: teacherDoc.id,
            ...teacherDoc.data()
          } as Teacher);
        } else {
          Alert.alert('Erreur', 'Enseignant non trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'enseignant');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [teacherId]);

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet enseignant ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'teachers', teacherId));
              Alert.alert('Succès', 'Enseignant supprimé avec succès');
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'enseignant');
            }
          }
        }
      ]
    );
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (!teacher) return;

    if (type === 'email' && teacher.email) {
      Linking.openURL(`mailto:${teacher.email}`);
    } else if (type === 'phone' && teacher.phoneNumber) {
      Linking.openURL(`tel:${teacher.phoneNumber}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D7599" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Enseignant non disponible</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>Détails de l'enseignant</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            {teacher.photoURL ? (
              <Image source={{ uri: teacher.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.profileName}>{teacher.firstName} {teacher.lastName}</Text>
            <Text style={styles.profileTitle}>{teacher.title}</Text>
            <Text style={styles.profileDepartment}>{teacher.department}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations de contact</Text>
            
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={22} color="#5D7599" />
              <Text style={styles.contactText}>{teacher.email}</Text>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContact('email')}
              >
                <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {teacher.phoneNumber && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="phone" size={22} color="#5D7599" />
                <Text style={styles.contactText}>{teacher.phoneNumber}</Text>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleContact('phone')}
                >
                  <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            
            {teacher.officeLocation && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="office-building" size={22} color="#5D7599" />
                <Text style={styles.contactText}>{teacher.officeLocation}</Text>
              </View>
            )}
            
            {teacher.officeHours && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#5D7599" />
                <Text style={styles.contactText}>{teacher.officeHours}</Text>
              </View>
            )}
          </View>

          {teacher.specialization && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spécialisation</Text>
              <Text style={styles.cardText}>{teacher.specialization}</Text>
            </View>
          )}

          {teacher.bio && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Biographie</Text>
              <Text style={styles.cardText}>{teacher.bio}</Text>
            </View>
          )}

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditTeacher', { teacherId: teacher.id })}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(93, 117, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#5D7599',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D7599',
    marginBottom: 6,
  },
  profileDepartment: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5D7599',
    justifyContent: 'center',
    alignItems: 'center',
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

export default TeacherDetailScreen;
