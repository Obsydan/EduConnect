// src/screens/auth/LoginScreen.tsx
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
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, loginWithGithub } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // La redirection sera automatique grâce au contexte d'authentification
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer plus tard');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setError('La connexion avec Google a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGithub();
    } catch (err: any) {
      setError('La connexion avec GitHub a échoué. Veuillez réessayer.');
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
                <Text style={styles.title}>Connexion</Text>
              </Animated.View>

              {/* Section supérieure */}
              <View style={styles.topSection}>
                <Animated.View 
                  entering={FadeInDown.delay(400).duration(1000)}
                  style={styles.subtitleContainer}
                >
                  <Text style={styles.subtitle}>
                    Accédez à votre espace académique
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
                      size={32} 
                      color="#FFFFFF" 
                    />
                  </View>
                </View>
              </View>

              {/* Section inférieure avec formulaire */}
              <View style={styles.bottomSection}>
                <Animated.View 
                  entering={FadeInDown.delay(500).duration(1000)}
                  style={styles.formContainer}
                >
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

                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons 
                        name="lock-outline" 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="rgba(255,255,255,0.7)" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}

                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Mot de passe oublié ?
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Boutons */}
                <Animated.View
                  entering={FadeInDown.delay(700).duration(1000)}
                  style={styles.buttonContainer}
                >
                  <TouchableOpacity
                    style={[styles.loginButton, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>Se connecter</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OU</Text>
                    <View style={styles.line} />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.socialButton, styles.googleButton]}
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <MaterialCommunityIcons 
                        name="google" 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.socialButton, styles.githubButton]}
                      onPress={handleGithubSignIn}
                      disabled={loading}
                    >
                      <AntDesign 
                        name="github" 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                    disabled={loading}
                  >
                    <Text style={styles.registerButtonText}>
                      Nouveau ? Créer un compte académique
                    </Text>
                  </TouchableOpacity>
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
    marginBottom: 20,
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
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
    padding: 4,
  },
  forgotPasswordText: {
    color: '#4B6CB7',
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 32,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Effet neumorphique
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 7,
  },
  googleButton: {
    backgroundColor: 'rgba(219, 68, 55, 0.8)',
  },
  githubButton: {
    backgroundColor: 'rgba(36, 41, 46, 0.8)',
  },
  registerButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
