// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

// Import du contexte d'authentification
import { AuthProvider } from './src/contexts/AuthContext';
import { NavigationRoot } from './src/navigation/NavigationRoot';

// Essayer d'importer SplashScreen, mais gérer l'erreur si le module n'existe pas
let SplashScreen: any;
try {
  SplashScreen = require('expo-splash-screen');
  // Maintenir l'écran de démarrage visible
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Ignorer l'erreur si elle se produit
  });
} catch (error) {
  console.log('expo-splash-screen n\'est pas disponible');
}

const App = () => {
  useEffect(() => {
    // Ignorer certains avertissements non critiques
    LogBox.ignoreLogs([
      'AsyncStorage has been extracted from react-native core',
      'Setting a timer for a long period of time',
      'VirtualizedLists should never be nested inside plain ScrollViews',
    ]);

    // Cacher l'écran de démarrage après le chargement complet
    const hideSplash = async () => {
      if (SplashScreen) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          // Ignorer l'erreur
        }
      }
    };
    
    hideSplash();
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <NavigationRoot />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
};

export default App;
