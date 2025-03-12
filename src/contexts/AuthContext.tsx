// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db} from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  User,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;

  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observer le changement d'état de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Inscription avec email et mot de passe
  const register = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      setError("L'inscription a échoué. Veuillez vérifier vos informations et réessayer.");
      throw error;
    }
  };

  // Connexion avec email et mot de passe
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError("La connexion a échoué. Veuillez vérifier votre email et mot de passe.");
      throw error;
    }
  };

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Vérifier si c'est un nouvel utilisateur
      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName,
        email: user.email,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error: any) {
      setError("La connexion avec Google a échoué. Veuillez réessayer ultérieurement.");
      throw error;
    }
  };

    // Connexion avec Github
    const loginWithGithub = async () => {
        try {
            setError(null);
            const provider = new GithubAuthProvider();
            const { user } = await signInWithPopup(auth, provider);

            // Vérifier si c'est un nouvel utilisateur
            await setDoc(doc(db, 'users', user.uid), {
                fullName: user.displayName,
                email: user.email,
                createdAt: new Date().toISOString(),
            }, { merge: true });
        } catch (error: any) {
            setError("La connexion avec Github a échoué. Veuillez réessayer ultérieurement.");
            throw error;
        }
    }

    // Reinitaliser le mot de passe
    const resetPassword = async (email: string) => {
      try {
        setError(null);
        await sendPasswordResetEmail(auth, email);
      }
      catch (error: any) {
        setError("Le mot de passe n'a pas pu être réinitialisé. Veuillez réessayer ultérieurement.");
        throw error;
      }
    }

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (displayName: string) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          fullName: displayName,
        }, { merge: true });
      }
    } catch (error: any) {
      setError("La mise à jour du profil a échoué.");
      throw error;
    }
  };

  // Mettre à jour l'email utilisateur
  const updateUserEmail = async (email: string) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, email);
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          email,
        }, { merge: true });
      }
    } catch (error: any) {
      setError("La mise à jour de l'email a échoué.");
      throw error;
    }
  };

  // Mettre à jour le mot de passe utilisateur
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email, 
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      }
    } catch (error: any) {
      setError("La mise à jour du mot de passe a échoué.");
      throw error;
    }
  };

    // Déconnexion
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (error: any) {
            setError("La déconnexion a échoué. Veuillez réessayer ultérieurement.");
            throw error;
        }
    };


    const value = {
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      loginWithGithub,
      resetPassword,
      logout,
      updateUserProfile,
      updateUserEmail,
      updateUserPassword,
      error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
