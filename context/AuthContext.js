import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NOTIFICATION TOKEN LOGIC ---
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return null;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        const token = await registerForPushNotificationsAsync();
        // Save/Update token in Firestore
        if (token) {
          await updateDoc(doc(db, "users", userData.uid), { pushToken: token });
        }
        const userDoc = await getDoc(doc(db, "users", userData.uid));
        setUser({ uid: userData.uid, email: userData.email, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const signup = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const token = await registerForPushNotificationsAsync();
    await setDoc(doc(db, "users", res.user.uid), {
      name,
      email,
      role: 'user',
      pushToken: token || '',
      createdAt: new Date().toISOString()
    });
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);