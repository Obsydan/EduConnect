// src/screens/courses/CourseDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Course } from '../../../types';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

export const CourseDetailScreen = ({ route, navigation }: any) => {
  const { courseId } = route.params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        
        if (courseDoc.exists()) {
          setCourse({
            id: courseDoc.id,
            ...courseDoc.data()
          } as Course);
        } else {
          Alert.alert('Erreur', 'Cours non trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails du cours');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce cours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true); // Ajout d'un indicateur de chargement pendant la suppression
              
              // Référence au document à supprimer
              const courseRef = doc(db, 'courses', courseId);
              
              // Suppression du document
              await deleteDoc(courseRef);
              
              // Navigation vers la liste après suppression réussie
              navigation.navigate('CourseList', { refresh: true });
              
              // Message de succès
              Toast.show({
                type: 'success',
                text1: 'Cours supprimé avec succès',
                position: 'bottom',
              });
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Toast.show({
                type: 'error',
                text1: 'Erreur de suppression',
                text2: 'Impossible de supprimer le cours. Veuillez réessayer.',
                position: 'bottom',
              });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B6CB7" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cours non trouvé</Text>
        <TouchableOpacity 
          style={styles.backButtonError}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonErrorText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.title}>Détails du cours</Text>
          </View>

          <View style={styles.courseHeader}>
            <View style={styles.courseIconContainer}>
              <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{course.code}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informations du cours</Text>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="star" size={22} color="#4B6CB7" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Crédits</Text>
                <Text style={styles.infoValue}>{course.credits}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-tie" size={22} color="#4B6CB7" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Enseignant</Text>
                <Text style={styles.infoValue}>{course.instructor}</Text>
              </View>
            </View>
            
            {course.department && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="school" size={22} color="#4B6CB7" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Département</Text>
                  <Text style={styles.infoValue}>{course.department}</Text>
                </View>
              </View>
            )}
            
            {course.semester && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar-month" size={22} color="#4B6CB7" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Semestre</Text>
                  <Text style={styles.infoValue}>{course.semester}</Text>
                </View>
              </View>
            )}
          </View>

          {course.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{course.description}</Text>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditCourse', { courseId: course.id })}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f3',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: '#4B6CB7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonErrorText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  courseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  courseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4B6CB7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(75, 108, 183, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeText: {
    color: '#4B6CB7',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f3',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#4B6CB7',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CourseDetailScreen;
