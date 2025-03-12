// src/screens/projects/ProjectDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: any;
  supervisor: string;
  participants: string[];
  category: string;
  objectives?: string;
  resources?: string;
}

export const ProjectDetailScreen = ({ route, navigation }: any) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (projectDoc.exists()) {
          setProject({
            id: projectDoc.id,
            ...projectDoc.data()
          } as Project);
        } else {
          Alert.alert('Erreur', 'Projet non trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails du projet');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce projet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'projects', projectId));
              Alert.alert('Succès', 'Projet supprimé avec succès');
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le projet');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en cours':
        return '#4CAF50';
      case 'terminé':
        return '#5D7599';
      case 'en attente':
        return '#FFA726';
      case 'annulé':
        return '#FF6B6B';
      default:
        return '#5D7599';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Non définie';
    return date.toDate 
      ? date.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D7599" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Projet non trouvé</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>Détails du projet</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.projectHeader}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                {project.status}
              </Text>
            </View>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectCategory}>{project.category}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations générales</Text>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={22} color="#5D7599" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date d'échéance</Text>
                <Text style={styles.infoValue}>{formatDate(project.deadline)}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-tie" size={22} color="#5D7599" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Superviseur</Text>
                <Text style={styles.infoValue}>{project.supervisor}</Text>
              </View>
            </View>
            
            {project.participants && project.participants.length > 0 && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-group" size={22} color="#5D7599" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Participants</Text>
                  <Text style={styles.infoValue}>{project.participants.join(', ')}</Text>
                </View>
              </View>
            )}
          </View>

          {project.description && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          )}

          {project.objectives && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Objectifs</Text>
              <Text style={styles.descriptionText}>{project.objectives}</Text>
            </View>
          )}

          {project.resources && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ressources</Text>
              <Text style={styles.descriptionText}>{project.resources}</Text>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditProject', { projectId: project.id })}
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
    color: '#FF6B6B',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  projectHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  projectCategory: {
    fontSize: 16,
    color: '#8C7569',
    marginBottom: 8,
  },
  card: {
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
  cardTitle: {
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
  infoContent: {
    flex: 1,
    marginLeft: 16,
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
    backgroundColor: '#5D7599',
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

export default ProjectDetailScreen;
