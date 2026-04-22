import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {/* User Avatar Circle */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          {/* 👤 SHOWING THE NAME */}
          <Text style={styles.userName}>
            {user?.displayName || "BlueStore User"}
          </Text>
          
          {/* 📧 SHOWING THE EMAIL */}
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>
      
      {/* ... rest of your profile buttons (Orders, Logout, etc.) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  infoContainer: { marginLeft: 20 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  userEmail: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
});