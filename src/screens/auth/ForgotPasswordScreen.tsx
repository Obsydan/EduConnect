// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte associé à cette adresse email');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../../assets/bg-university.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.content}
            >
              {/* En-tête et titre */}
              <Animated.View 
                entering={FadeInDown.delay(300).duration(1000)}
                style={styles.header}
              >
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Mot de passe oublié</Text>
              </Animated.View>

              {/* Section supérieure */}
              <View style={styles.topSection}>
                <Animated.View 
                  entering={FadeInDown.delay(400).duration(1000)}
                  style={styles.subtitleContainer}
                >
                  <Text style={styles.subtitle}>
                    Saisissez votre adresse email pour réinitialiser votre mot de passe
                  </Text>
                </Animated.View>
              </View>
              
              {/* Ligne de séparation circulaire avec logo au centre */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.logoOuterContainer}>
                  <View style={styles.logoContainer}>
                    <MaterialCommunityIcons 
                      name="lock-reset" 
                      size={32} 
                      color="#FFFFFF" 
                    />
                  </View>
                </View>
              </View>

              {/* Section inférieure */}
              <View style={styles.bottomSection}>
                <Animated.View 
                  entering={FadeInDown.delay(500).duration(1000)}
                  style={styles.formContainer}
                >
                  {success ? (
                    <View style={styles.successContainer}>
                      <MaterialCommunityIcons 
                        name="email-check" 
                        size={60} 
                        color="#4B6CB7" 
                        style={styles.successIcon}
                      />
                      <Text style={styles.successText}>
                        Un email de réinitialisation a été envoyé à {email}
                      </Text>
                      <Text style={styles.instructionText}>
                        Veuillez vérifier votre boîte de réception et suivre les instructions
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                          <MaterialCommunityIcons 
                            name="email-outline" 
                            size={20} 
                            color="rgba(255,255,255,0.7)" 
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Adresse email"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                          />
                        </View>
                      </View>

                      {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                      ) : null}
                    </>
                  )}
                </Animated.View>

                {/* Boutons */}
                <Animated.View
                  entering={FadeInDown.delay(700).duration(1000)}
                  style={styles.buttonContainer}
                >
                  {success ? (
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => navigation.navigate('Login')}
                    >
                      <Text style={styles.loginButtonText}>Retour à la connexion</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.resetButton, loading && styles.buttonDisabled]}
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </View>
            </KeyboardAvoidingView>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Section supérieure
  topSection: {
    marginBottom: 20,
  },
  subtitleContainer: {
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  // Ligne de séparation circulaire
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 20,
    height: 80,
  },
  dividerLine: {
    position: 'absolute',
    top: 40,
    width: width - 48, // Ajustement pour le paddingHorizontal
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoOuterContainer: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    // Effet neumorphique subtil
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: '#4B6CB7',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique
    shadowColor: '#3A5599',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    // Effet neumorphique pour l'icône de succès
    shadowColor: '#3A5599',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#4B6CB7',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique
    shadowColor: '#3A5599',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
