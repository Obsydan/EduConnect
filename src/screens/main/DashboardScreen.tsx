// src/screens/main/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Nouvelle palette de couleurs moderne
const COLORS = {
  primary: '#4B6CB7',
  secondary: '#182848',
  accent1: '#5D7599',
  accent2: '#6A85B6',
  accent3: '#8A9FC1',
  background: '#F8F9FB',
  cardBg: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
};

const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    resources: 0,
    events: 0,
    projects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques de chaque collection
        const collections = ['students', 'teachers', 'courses', 'resources', 'events', 'projects'];
        const statsData = { students: 0, teachers: 0, courses: 0, resources: 0, events: 0, projects: 0 };
        
        for (const collectionName of collections) {
          try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            statsData[collectionName as keyof typeof statsData] = querySnapshot.size;
          } catch (error) {
            console.error(`Erreur lors de la récupération de ${collectionName}:`, error);
          }
        }
        
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Nouvelles couleurs pour les cartes statistiques
  const statCardColors: Record<string, [string, string]> = {
    students: ['#4B6CB7', '#182848'],
    teachers: ['#6A85B6', '#5D7599'],
    courses: ['#5D7599', '#4B6CB7'],
    resources: ['#6A85B6', '#4B6CB7'],
    events: ['#4B6CB7', '#6A85B6'],
    projects: ['#5D7599', '#182848']
  };

  const renderStatCard = (
    title: string, 
    count: number, 
    icon: keyof typeof MaterialCommunityIcons.glyphMap, 
    colors: [string, string], // Explicitly require a tuple of two strings
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickAccessItem = (
    title: string, 
    icon: keyof typeof MaterialCommunityIcons.glyphMap, 
    colors: [string, string], 
    onPress: () => void
  ) => (
    <TouchableOpacity 
      style={styles.quickAccessItem}
      onPress={onPress}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickAccessGradient}
      >
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.quickAccessItemText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nouvel en-tête amélioré avec photo de profil */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>EduConnect</Text>
            <Text style={styles.headerSubtitle}>Tableau de bord</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[COLORS.background, '#F0F2F8']}
        style={styles.background}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Bonjour, {user?.displayName || 'Utilisateur'}
            </Text>
            <Text style={styles.subTitle}>
              Bienvenue dans votre espace de gestion
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Aperçu général</Text>
            
            <View style={styles.statsGrid}>
              {renderStatCard('Étudiants', stats.students, 'account-group', 
                statCardColors.students, () => navigation.navigate('Students'))}
              
              {renderStatCard('Enseignants', stats.teachers, 'school', 
                statCardColors.teachers, () => navigation.navigate('Teachers'))}
              
              {renderStatCard('Cours', stats.courses, 'book-open-variant', 
                statCardColors.courses, () => navigation.navigate('Courses'))}
              
              {renderStatCard('Ressources', stats.resources, 'file-document-multiple', 
                statCardColors.resources, () => navigation.navigate('Resources'))}
              
              {renderStatCard('Événements', stats.events, 'calendar', 
                statCardColors.events, () => navigation.navigate('Events'))}
              
              {renderStatCard('Projets', stats.projects, 'clipboard-text', 
                statCardColors.projects, () => navigation.navigate('Projects'))}
            </View>
          </View>

          <View style={styles.quickAccessContainer}>
            <View style={styles.quickAccessHeader}>
              <Text style={styles.sectionTitle}>Accès rapide</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickAccessGrid}>
              {renderQuickAccessItem(
                'Ajouter un étudiant', 
                'account-plus', 
                statCardColors.students, 
                () => navigation.navigate('Students', { screen: 'AddStudent' })
              )}
              
              {renderQuickAccessItem(
                'Ajouter un cours', 
                'book-plus', 
                statCardColors.courses, 
                () => navigation.navigate('Courses', { screen: 'AddCourse' })
              )}
              
              {renderQuickAccessItem(
                'Ajouter un événement', 
                'calendar-plus', 
                statCardColors.events, 
                () => navigation.navigate('Events', { screen: 'AddEvent' })
              )}
              
              {renderQuickAccessItem(
                'Ajouter un enseignant', 
                'account-tie', 
                statCardColors.teachers, 
                () => navigation.navigate('Teachers', { screen: 'AddTeacher' })
              )}
              
              {renderQuickAccessItem(
                'Ajouter une ressource', 
                'file-plus', 
                statCardColors.resources, 
                () => navigation.navigate('Resources', { screen: 'AddResource' })
              )}
              
              {renderQuickAccessItem(
                'Ajouter un projet', 
                'clipboard-plus', 
                statCardColors.projects, 
                () => navigation.navigate('Projects', { screen: 'AddProject' })
              )}
            </View>
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerGradient: {
    paddingTop: 50, // Pour tenir compte de la barre d'état
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  background: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  welcomeContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    height: 120,
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickAccessContainer: {
    marginBottom: 24,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: width / 3 - 22,
    marginBottom: 20,
    alignItems: 'center',
  },
  quickAccessGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 80, // Augmenté pour tenir compte de la tab bar
  },
});

export default DashboardScreen;
