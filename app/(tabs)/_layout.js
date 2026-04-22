import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function TabLayout() {
  const [cartCount, setCartCount] = useState(0);

  // Live listener for the red badge count
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cart"), (snap) => {
      setCartCount(snap.docs.length);
    });
    return unsub;
  }, []);

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: { height: 65, paddingBottom: 10, backgroundColor: '#fff' },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : null, // The red badge logic
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}