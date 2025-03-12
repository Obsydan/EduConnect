// src/screens/resources/ResourcesListScreen.tsx
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

// Type pour les ressources
interface Resource {
  id: string;
  title: string;
  type: string;
  courseId?: string;
  courseName?: string;
  fileUrl: string;
  fileType: string;
  uploadDate: any;
  description?: string;
}

export const ResourcesListScreen = ({ navigation }: any) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourcesCollection = collection(db, 'resources');
        const resourcesSnapshot = await getDocs(resourcesCollection);
        const resourcesList = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
        
        setResources(resourcesList);
      } catch (error) {
        console.error('Erreur lors du chargement des ressources:', error);
        Alert.alert('Erreur', 'Impossible de charger la liste des ressources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchResources();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteResource = async (resourceId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette ressource ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'resources', resourceId));
              setResources(resources.filter(resource => resource.id !== resourceId));
              Alert.alert('Succès', 'Ressource supprimée avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la ressource');
            }
          }
        }
      ]
    );
  };

  const filteredResources = resources.filter(resource => {
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      (resource.courseName && resource.courseName.toLowerCase().includes(query)) ||
      resource.type.toLowerCase().includes(query)
    );
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'file-pdf-box';
      case 'doc':
      case 'docx':
        return 'file-word';
      case 'xls':
      case 'xlsx':
        return 'file-excel';
      case 'ppt':
      case 'pptx':
        return 'file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'file-image';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'file-video';
      default:
        return 'file-document-outline';
    }
  };

  const renderResourceItem = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => navigation.navigate('ResourceDetails', { resourceId: item.id })}
    >
      <View style={styles.resourceIconContainer}>
        <MaterialCommunityIcons 
          name={getFileIcon(item.fileType)} 
          size={32} 
          color="#5D7599" 
        />
      </View>
      
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.resourceMeta}>
          <Text style={styles.resourceType}>{item.type}</Text>
          {item.courseName && (
            <Text style={styles.resourceCourse} numberOfLines={1}>
              {item.courseName}
            </Text>
          )}
          <Text style={styles.resourceDate}>
            {new Date(item.uploadDate.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditResource', { resourceId: item.id })}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#5D7599" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteResource(item.id)}
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
          <Text style={styles.title}>Ressources pédagogiques</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddResource')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8C7569" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ressource..."
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
        ) : filteredResources.length > 0 ? (
          <FlatList
            data={filteredResources}
            renderItem={renderResourceItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../../assets/empty-resources.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? "Aucune ressource ne correspond à votre recherche" 
                : "Aucune ressource disponible"}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddResource')}
            >
              <Text style={styles.emptyButtonText}>Ajouter une ressource</Text>
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
    paddingBottom: 80, // Pour éviter que le contenu soit caché par la tab bar
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
  resourceCard: {
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
  resourceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resourceType: {
    fontSize: 12,
    color: '#5D7599',
    fontWeight: '500',
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  resourceCourse: {
    fontSize: 12,
    color: '#8C7569',
    marginRight: 8,
    flex: 1,
  },
  resourceDate: {
    fontSize: 12,
    color: '#999',
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

export default ResourcesListScreen;
