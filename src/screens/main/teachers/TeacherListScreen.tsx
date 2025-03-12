// src/screens/teachers/TeacherListScreen.tsx
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
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

// Type pour les enseignants
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  title: string;
  phoneNumber?: string;
  specialization?: string;
  photoURL?: string;
}

export const TeacherListScreen = ({ navigation }: any) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const teachersCollection = collection(db, 'teachers');
        const teachersSnapshot = await getDocs(teachersCollection);
        const teachersList = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Teacher[];
        
        setTeachers(teachersList);
      } catch (error) {
        console.error('Erreur lors du chargement des enseignants:', error);
        Alert.alert('Erreur', 'Impossible de charger la liste des enseignants');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTeachers();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteTeacher = async (teacherId: string) => {
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
              setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
              Alert.alert('Succès', 'Enseignant supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'enseignant');
            }
          }
        }
      ]
    );
  };

  const filteredTeachers = teachers.filter(teacher => {
    const query = searchQuery.toLowerCase();
    return (
      teacher.firstName.toLowerCase().includes(query) ||
      teacher.lastName.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      teacher.department.toLowerCase().includes(query) ||
      (teacher.specialization && teacher.specialization.toLowerCase().includes(query))
    );
  });

  const renderTeacherItem = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => navigation.navigate('TeacherDetails', { teacherId: item.id })}
    >
      <View style={styles.teacherAvatarContainer}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.teacherAvatar} />
        ) : (
          <View style={styles.teacherAvatarPlaceholder}>
            <Text style={styles.teacherInitials}>
              {item.firstName.charAt(0)}{item.lastName.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.teacherTitle}>{item.title}</Text>
        <Text style={styles.teacherDepartment}>{item.department}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditTeacher', { teacherId: item.id })}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#5D7599" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTeacher(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5EEE6', '#F0E9E2']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enseignants</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTeacher')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8C7569" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un enseignant..."
            placeholderTextColor="#8C7569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={20} color="#8C7569" />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5D7599" />
          </View>
        ) : filteredTeachers.length > 0 ? (
          <FlatList
            data={filteredTeachers}
            renderItem={renderTeacherItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../../assets/empty-teachers.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? "Aucun enseignant ne correspond à votre recherche" 
                : "Aucun enseignant enregistré"}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddTeacher')}
            >
              <Text style={styles.emptyButtonText}>Ajouter un enseignant</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5D7599',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 10,
  },
  teacherCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#8C7569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherAvatarContainer: {
    marginRight: 15,
  },
  teacherAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teacherAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(93, 117, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D7599',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teacherTitle: {
    fontSize: 14,
    color: '#5D7599',
    fontWeight: '500',
    marginBottom: 4,
  },
  teacherDepartment: {
    fontSize: 14,
    color: '#8C7569',
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
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#8C7569',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#5D7599',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TeacherListScreen;
