import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RoomManagementScreen({ navigation, route }) {
  // Capture data passed from previous steps
  const hostelData = route.params?.hostelData || {};

  // Mock data for rooms based on the design
  const rooms = [
    { id: 1, title: 'Single Room', total: 10, available: 2 },
    { id: 2, title: '2 Sharing Room', total: 15, available: 5 },
    { id: 3, title: '3 Sharing Room', total: 10, available: 3 },
    { id: 4, title: '4 Sharing Room', total: 5, available: 1 },
    { id: 5, title: '5 Sharing Room', total: 5, available: 2 },
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
          <Text style={styles.title}>Room Management</Text>
          <Text style={styles.subtitle}>Manage your rooms & availability</Text>
        </View>

        <View style={styles.roomList}>
          {rooms.map((room) => (
            <TouchableOpacity key={room.id} style={styles.roomCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="bed-outline" size={20} color="#1e1b29" />
                </View>
                <View style={styles.cardTextContent}>
                  <Text style={styles.roomTitle}>{room.title}</Text>
                  <Text style={styles.roomSubtitle}>
                    {room.total} Rooms • {room.available} Available
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddNewRoom')}>
          <Ionicons name="add" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.addBtnText}>Add New Room</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('PricingManagement')}>
          <Text style={styles.nextBtnText}>Next Step: Pricing Management</Text>
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
  
  titleSection: { paddingHorizontal: 24, marginTop: 8, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  roomList: {
    paddingHorizontal: 24,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f3f4f6', // Light gray/purple from mockup
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContent: {
    justifyContent: 'center',
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },

  footer: {
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#ffffff',
  },
  addBtn: { 
    flexDirection: 'row',
    backgroundColor: '#4F46E5', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  addBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  nextBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextBtnText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 15 },
});
