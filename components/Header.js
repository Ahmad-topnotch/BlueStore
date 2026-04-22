import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function Header({ onSearch }) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput 
          style={styles.input} 
          placeholder="Search in Daraz" 
          placeholderTextColor="#999"
          onChangeText={(text) => onSearch(text)} // Passing text up to Home
        />
      </View>
      <TouchableOpacity style={styles.cartBtn}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darazOrange,
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#333' },
  cartBtn: { marginLeft: 15 },
});