// src/components/CustomDrawerContent.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const CustomDrawerContent = (props: any) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
      >
        <LinearGradient
          colors={['#5D7599', '#4B6CB7']}
          style={styles.profileSection}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {user?.displayName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>
            {user?.displayName || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </LinearGradient>

        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout();
          }}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#FF6B6B" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 0,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0E9E2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default CustomDrawerContent;
