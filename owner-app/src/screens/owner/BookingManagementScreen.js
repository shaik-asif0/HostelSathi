import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FILTER_TABS = ['All', 'Upcoming', 'Current', 'Cancelled'];

const MOCK_BOOKINGS = [
  {
    id: '1',
    studentName: 'Rahul Kumar',
    roomType: '2 Sharing Room',
    details: 'Move-in: 20 May 2024',
    status: 'Upcoming'
  },
  {
    id: '2',
    studentName: 'Anjali Sharma',
    roomType: '3 Sharing Room',
    details: 'Move-in: 18 May 2024',
    status: 'Current'
  },
  {
    id: '3',
    studentName: 'Vikram Reddy',
    roomType: 'Single Room',
    details: 'Move-in: 10 Apr 2024',
    status: 'Completed'
  },
  {
    id: '4',
    studentName: 'Sneha Patil',
    roomType: '2 Sharing Room',
    details: 'Cancelled',
    status: 'Cancelled'
  }
];

export default function BookingManagementScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredBookings = MOCK_BOOKINGS.filter(booking => {
    if (activeFilter === 'All') return true;
    return booking.status === activeFilter;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return { bg: '#eff6ff', text: '#3b82f6' }; // blue
      case 'Current':
        return { bg: '#dcfce7', text: '#10b981' }; // green
      case 'Completed':
        return { bg: '#f3e8ff', text: '#9333ea' }; // purple
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#ef4444' }; // red
      default:
        return { bg: '#f3f4f6', text: '#6b7280' }; // gray
    }
  };

  const renderItem = ({ item }) => {
    const badgeStyle = getStatusBadgeStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.avatarBox}>
          <Ionicons name="person-circle" size={48} color="#c7d2fe" />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.roomType}>{item.roomType}</Text>
          <Text style={styles.detailsText}>{item.details}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <Text style={styles.title}>Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        {FILTER_TABS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} bookings found.</Text>
          </View>
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 16,
  },
  backBtn: { marginBottom: 16, marginLeft: -8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29' },

  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF', // light purple inactive
    borderRadius: 8,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#4F46E5', // vibrant purple active
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarBox: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginTop: 4,
  },
  roomType: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 15,
  }
});
