import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();

  // Organised Menu Sections
  const adminSections = [
    {
      title: "Store Management",
      items: [
        { id: 1, title: 'Add Product', subtitle: 'Add new items & descriptions', icon: 'add-circle', route: '/admin/add-product', color: '#3498db' },
        { id: 2, title: 'Manage Inventory', subtitle: 'Edit or Delete items', icon: 'list', route: '/admin/manage-products', color: '#e67e22' },
      ]
    },
    {
      title: "Orders & Shipping",
      items: [
        { id: 3, title: 'Active Orders', subtitle: 'Ship & Manage new orders', icon: 'cart', route: '/admin/orders', color: '#2ecc71' },
        { id: 4, title: 'History', subtitle: 'View & Delete delivered items', icon: 'checkmark-done-circle', route: '/admin/delivered-history', color: '#95a5a6' },
      ]
    },
    {
      title: "Marketing & Sales",
      items: [
        { id: 5, title: 'App Banners', subtitle: 'Update home screen slider', icon: 'image', route: '/admin/banners', color: '#9b59b6' },
        { id: 6, title: 'Discounts', subtitle: 'Price cuts & sale offers', icon: 'pricetag', route: '/admin/manage-products', color: '#e74c3c' },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/account')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>Manage your products, orders, and sales</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {adminSections.map((section, idx) => (
          <View key={idx} style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.card} 
                  onPress={() => router.push(item.route)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSub} numberOfLines={2}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Statistics Placeholder (Optional UI Touch) */}
        <View style={styles.statsCard}>
          <Ionicons name="flash" size={20} color="#f1c40f" />
          <Text style={styles.statsText}>Firebase Connection Live</Text>
        </View>

        <TouchableOpacity 
          style={styles.exitBtn} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.exitText}>Exit Admin Mode</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { 
    backgroundColor: '#3498db', 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 25, 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#d1e9ff', fontSize: 13, marginTop: 8, opacity: 0.9 },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionBox: { marginBottom: 25 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#fff', 
    width: '48%', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    minHeight: 140
  },
  iconCircle: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  cardSub: { fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 14 },
  statsCard: { 
    flexDirection: 'row', 
    backgroundColor: '#2c3e50', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20,
    gap: 10
  },
  statsText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  exitBtn: { backgroundColor: '#e74c3c', padding: 18, borderRadius: 18, alignItems: 'center', elevation: 4 },
  exitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});