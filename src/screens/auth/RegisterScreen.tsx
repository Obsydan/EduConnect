// src/screens/auth/RegisterScreen.tsx
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
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle, loginWithGithub } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !fullName ) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    // vérifier si l'email est valide
    if (!email.includes('@') || !email.includes('.')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    setLoading(true);
    try {
      await register(email, password, fullName);
    } catch (err: any) {
      const errorMessage = err.message.toLowerCase();
      if (errorMessage.includes('email-already-in-use')) {
        setError('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser une autre adresse.');
      } else if (errorMessage.includes('weak-password')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Format d\'email invalide.');
      } else {
        setError('Une erreur est survenue lors de l\'inscription.');
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
              <ScrollView showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.title}>Créer un compte</Text>
                </Animated.View>

                {/* Section supérieure */}
                <View style={styles.topSection}>
                  <Animated.View 
                    entering={FadeInDown.delay(400).duration(1000)}
                    style={styles.subtitleContainer}
                  >
                    <Text style={styles.subtitle}>
                      Rejoignez notre communauté académique
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
                          name="account-outline"
                          size={20}
                          color="rgba(255,255,255,0.7)"
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Nom complet"
                          placeholderTextColor="rgba(255,255,255,0.5)"
                          value={fullName}
                          onChangeText={setFullName}
                          editable={!loading}
                        />
                      </View>

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

                    <Text style={styles.termsText}>
                      En vous inscrivant, vous acceptez nos{' '}
                      <Text style={styles.termsLink}>Conditions d'utilisation</Text>{' '}
                      et notre{' '}
                      <Text style={styles.termsLink}>Politique de confidentialité</Text>
                    </Text>
                  </Animated.View>

                  {/* Boutons */}
                  <Animated.View
                    entering={FadeInDown.delay(700).duration(1000)}
                    style={styles.buttonContainer}
                  >
                    <TouchableOpacity
                      style={[styles.registerButton, loading && styles.buttonDisabled]}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.registerButtonText}>S'inscrire</Text>
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
                      style={styles.loginButton}
                      onPress={() => navigation.navigate('Login')}
                      disabled={loading}
                    >
                      <Text style={styles.loginButtonText}>
                        Déjà inscrit ? Se connecter
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </ScrollView>
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
  termsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  termsLink: {
    color: '#4B6CB7',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  registerButton: {
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
  registerButtonText: {
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
  loginButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
