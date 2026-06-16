import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BOOST_OPTIONS = [
  {
    id: '1',
    title: 'Featured Listing',
    desc: 'Show your hostel on top',
    price: '₹499',
    duration: ' /month',
    icon: 'star',
    color: '#4F46E5', // blue/purple
    bg: '#EEF2FF'
  },
  {
    id: '2',
    title: 'Top Placement',
    desc: 'Show above normal listings',
    price: '₹299',
    duration: ' /month',
    icon: 'arrow-up',
    color: '#10b981', // green
    bg: '#dcfce7'
  },
  {
    id: '3',
    title: 'Priority Leads',
    desc: 'Get leads before others',
    price: '₹399',
    duration: ' /month',
    icon: 'flash',
    color: '#f59e0b', // orange
    bg: '#fef3c7'
  },
  {
    id: '4',
    title: 'Banner Promotion',
    desc: 'Promote on app banner',
    price: '₹799',
    duration: ' /month',
    icon: 'easel',
    color: '#f43f5e', // red/pink
    bg: '#ffe4e6'
  }
];

export default function PremiumPromotionScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Boost Your Hostel</Text>
          <Text style={styles.subtitle}>Get more visibility & bookings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {BOOST_OPTIONS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
            
            <View style={styles.priceCol}>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Text style={styles.itemDuration}>{item.duration}</Text>
            </View>
          </View>
        ))}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.boostBtn}>
          <Text style={styles.boostBtnText}>Boost Now</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 24,
  },
  backBtn: { marginBottom: 16, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  itemDuration: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  boostBtn: {
    backgroundColor: '#4F46E5', // vibrant purple
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  boostBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
