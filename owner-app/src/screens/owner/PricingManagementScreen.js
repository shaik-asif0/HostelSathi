import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PricingManagementScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('Room Rent');
  const tabs = ['Room Rent', 'Security Deposit', 'Maintenance'];

  // Mock data for pricing
  const pricingData = [
    { id: 1, title: 'Single Room', price: '14,700' },
    { id: 2, title: '2 Sharing Room', price: '11,000' },
    { id: 3, title: '3 Sharing Room', price: '8,800' },
    { id: 4, title: '4 Sharing Room', price: '7,400' },
    { id: 5, title: '5 Sharing Room', price: '5,800' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pricing Management</Text>
          <Text style={styles.subtitle}>Update your room pricing</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pricing List */}
        <View style={styles.listContainer}>
          {pricingData.map((item) => (
            <View key={item.id} style={styles.pricingCard}>
              <View>
                <Text style={styles.roomTitle}>{item.title}</Text>
                <Text style={styles.priceRow}>
                  <Text style={styles.priceAmount}>₹{item.price}</Text>
                  <Text style={styles.pricePeriod}> /mo</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.updateBtn} onPress={() => {}}>
          <Text style={styles.updateBtnText}>Update Pricing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('AvailabilityCalendar')}>
          <Text style={styles.nextBtnText}>Next Step: Availability Calendar</Text>
          <Ionicons name="arrow-forward" size={18} color="#4F46E5" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, height: 60 },
  backBtn: { padding: 8, marginLeft: -8 },
  scrollContent: { paddingBottom: 40 },
  
  titleSection: { paddingHorizontal: 24, marginTop: 8, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  tabsContainer: { marginBottom: 20 },
  tabsScroll: { paddingHorizontal: 24, gap: 10 },
  tabBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#ffffff',
  },

  listContainer: { paddingHorizontal: 24 },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5', // vibrant purple for price
  },
  pricePeriod: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  editBtn: {
    padding: 8,
  },

  footer: {
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#ffffff',
  },
  updateBtn: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  updateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  nextBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextBtnText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 15 },
});
