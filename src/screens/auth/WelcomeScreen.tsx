// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../../assets/university-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Section supérieure */}
            <View style={styles.topSection}>
              <Animated.View 
                entering={FadeInDown.delay(300).duration(1000)}
                style={styles.titleContainer}
              >
                <Text style={styles.appTitle}>EduConnect</Text>
                <Text style={styles.appSubtitle}>
                  Votre portail académique
                </Text>
              </Animated.View>
            </View>
            
            {/* Ligne de séparation circulaire avec logo au centre */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.logoOuterContainer}>
                <View style={styles.logoContainer}>
                  <MaterialCommunityIcons 
                    name="school" 
                    size={48} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>
            </View>
            
            {/* Section inférieure */}
            <View style={styles.bottomSection}>
              {/* Description */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(1000)}
                style={styles.descriptionContainer}
              >
                <Text style={styles.descriptionText}>
                  Accédez à vos cours, projets et ressources académiques en un seul endroit
                </Text>
              </Animated.View>

              {/* Bouton unique */}
              <Animated.View
                entering={FadeInDown.delay(700).duration(1000)}
                style={styles.buttonContainer}
              >
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>
                    Commencer
                  </Text>
                  <MaterialCommunityIcons 
                    name="arrow-right" 
                    size={22} 
                    color="#FFFFFF" 
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  © 2025 EduConnect - Tous droits réservés
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  // Section supérieure
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Ligne de séparation circulaire
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 20,
    height: 100,
  },
  dividerLine: {
    position: 'absolute',
    top: 50,
    width: width - 48, // Ajustement pour le paddingHorizontal
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  logoOuterContainer: {
    position: 'absolute',
    top: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique léger
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4B6CB7',
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique
    shadowColor: '#2D3748',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  // Section inférieure
  bottomSection: {
    flex: 1.2,
    justifyContent: 'space-evenly',
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4B6CB7',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique modéré
    shadowColor: '#2D3748',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
