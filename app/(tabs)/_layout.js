import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext'; // Switch to Context

export default function TabLayout() {
  // Use the context instead of the useEffect/Firebase listener
  const { cartItems } = useCart();

  // Calculate the total number of items
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
          // Now updates instantly when you click "Add to Cart"
          tabBarBadge: cartCount > 0 ? cartCount : null,
          tabBarBadgeStyle: { backgroundColor: '#e74c3c' },
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