// src/screens/courses/CourseListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Course } from '../../../types';
import { LinearGradient } from 'expo-linear-gradient';

export const CourseListScreen = ({ navigation }: any) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesCollection = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesCollection);
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesList);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des cours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCourses();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteCourse = async (courseId: string) => {
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
              
              // Mise à jour de l'état local après suppression réussie
              setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
              
              Alert.alert('Succès', 'Cours supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le cours. Veuillez réessayer.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
    >
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseCode}>Code: {item.code}</Text>
        <Text style={styles.courseCredits}>{item.credits} crédits</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditCourse', { courseId: item.id })}
        >
          <MaterialCommunityIcons name="pencil" size={22} color="#4B6CB7" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteCourse(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0f0f3', '#e6e6e6']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cours</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCourse')}
          >
            <LinearGradient
              colors={['#4B6CB7', '#3A5599']}
              style={styles.addButtonGradient}
            >
              <MaterialCommunityIcons name="book-plus" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8B8B8B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un cours..."
            placeholderTextColor="#8B8B8B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B6CB7" />
          </View>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <FlatList
                data={filteredCourses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="book-search" size={60} color="#CCCCCC" />
                <Text style={styles.emptyText}>Aucun cours trouvé</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchCourses}
                >
                  <Text style={styles.refreshButtonText}>Rafraîchir</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
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
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    padding: 12,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseCredits: {
    fontSize: 12,
    color: '#4B6CB7',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f0f0f3',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f3',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4B6CB7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CourseListScreen;
