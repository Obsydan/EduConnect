// src/screens/resources/ResourceDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Share
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

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
  uploadedBy?: string;
  size?: number;
}

export const ResourceDetailScreen = ({ route, navigation }: any) => {
  const { resourceId } = route.params;
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        setLoading(true);
        const resourceDoc = await getDoc(doc(db, 'resources', resourceId));
        
        if (resourceDoc.exists()) {
          setResource({
            id: resourceDoc.id,
            ...resourceDoc.data()
          } as Resource);
        } else {
          Alert.alert('Erreur', 'Ressource non trouvée');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de la ressource');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [resourceId]);

  const handleDelete = () => {
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
              Alert.alert('Succès', 'Ressource supprimée avec succès');
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la ressource');
            }
          }
        }
      ]
    );
  };

  const handleOpenFile = async () => {
    if (resource?.fileUrl) {
      const supported = await Linking.canOpenURL(resource.fileUrl);
      if (supported) {
        await Linking.openURL(resource.fileUrl);
      } else {
        Alert.alert('Erreur', "Impossible d'ouvrir ce fichier");
      }
    }
  };

  const handleShare = async () => {
    if (resource) {
      try {
        await Share.share({
          message: `Consultez cette ressource pédagogique: ${resource.title} - ${resource.fileUrl}`,
          title: resource.title,
          url: resource.fileUrl,
        });
      } catch (error) {
        Alert.alert('Erreur', "Impossible de partager cette ressource");
      }
    }
  };

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D7599" />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ressource non disponible</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>Détails de la ressource</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.resourceHeader}>
            <View style={styles.resourceIconContainer}>
              <MaterialCommunityIcons 
                name={getFileIcon(resource.fileType)} 
                size={40} 
                color="#5D7599" 
              />
            </View>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <View style={styles.resourceBadge}>
              <Text style={styles.resourceType}>{resource.type}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="calendar" size={20} color="#8C7569" />
              <Text style={styles.cardLabel}>Date d'ajout:</Text>
              <Text style={styles.cardValue}>
                {new Date(resource.uploadDate.toDate()).toLocaleDateString()}
              </Text>
            </View>
            
            {resource.courseName && (
              <View style={styles.cardRow}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#8C7569" />
                <Text style={styles.cardLabel}>Cours associé:</Text>
                <Text style={styles.cardValue}>{resource.courseName}</Text>
              </View>
            )}
            
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="file" size={20} color="#8C7569" />
              <Text style={styles.cardLabel}>Type de fichier:</Text>
              <Text style={styles.cardValue}>{resource.fileType.toUpperCase()}</Text>
            </View>
            
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="weight" size={20} color="#8C7569" />
              <Text style={styles.cardLabel}>Taille:</Text>
              <Text style={styles.cardValue}>{formatFileSize(resource.size)}</Text>
            </View>
            
            {resource.uploadedBy && (
              <View style={styles.cardRow}>
                <MaterialCommunityIcons name="account" size={20} color="#8C7569" />
                <Text style={styles.cardLabel}>Ajouté par:</Text>
                <Text style={styles.cardValue}>{resource.uploadedBy}</Text>
              </View>
            )}
          </View>

          {resource.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{resource.description}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={handleOpenFile}
            >
              <MaterialCommunityIcons name="download" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Télécharger</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="share-variant" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Partager</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditResource', { resourceId: resource.id })}
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
  resourceHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resourceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  resourceBadge: {
    backgroundColor: 'rgba(93, 117, 153, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resourceType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D7599',
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    width: 100,
  },
  cardValue: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  descriptionCard: {
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
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButton: {
    backgroundColor: '#5D7599',
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: '#8C7569',
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
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

export default ResourceDetailScreen;
