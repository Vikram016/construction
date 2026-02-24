// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,     setUser]     = useState(null);
  const [userRole, setUserRole] = useState(null);
  // ── KEY FIX: start as false so the app renders immediately ──
  // We only set true during the brief auth-state check on mount.
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchUserRole = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) return snap.data().role || 'user';
      await setDoc(doc(db, 'users', uid), {
        role: 'user', createdAt: new Date(), email: auth.currentUser?.email,
      });
      return 'user';
    } catch { return 'user'; }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserRole(await fetchUserRole(firebaseUser.uid));
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);   // done — render the app
    });
    // Safety net: if onAuthStateChanged never fires (e.g. network issue),
    // still show the app after 3 seconds instead of a blank screen forever.
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => { unsub(); clearTimeout(timer); };
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUserRole(await fetchUserRole(result.user.uid));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, role = 'user') => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', result.user.uid), { email, role, createdAt: new Date() });
      setUserRole(role);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); setUserRole(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // While checking auth state, render children with a loading state
  // so the layout (Header, Footer) still shows — just not user-specific UI
  return (
    <AuthContext.Provider value={{
      user, userRole, loading, error,
      signIn, signUp, signOut,
      isAdmin: () => userRole === 'admin',
      isAuthenticated: () => !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
