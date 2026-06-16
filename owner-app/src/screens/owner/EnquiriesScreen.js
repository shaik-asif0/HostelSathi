import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSelector } from 'react-redux';
import { enquiriesAPI } from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'closed', label: 'Closed' }
];

export default function EnquiriesScreen({ navigation }) {
  const { token } = useSelector(state => state.auth);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const mockEnquiries = [
    {
      _id: '1',
      studentName: 'Rahul Kumar',
      studentCollege: 'JNTU Hyderabad',
      status: 'new',
      price: '₹8,000',
      sharing: '2 Sharing',
      date: '12 May',
      moveInDate: '20 May 2024',
      phone: '+91 98765 43210',
      message: 'Looking for a good hostel near JNTU with WiFi and food.'
    },
    {
      _id: '2',
      studentName: 'Anjali Sharma',
      studentCollege: 'CBIT Hyderabad',
      status: 'new',
      price: '₹7,000',
      sharing: '2 Sharing',
      date: '12 May',
      moveInDate: '25 May 2024',
      phone: '+91 98765 43211',
      message: 'Is there a 2 sharing room available?'
    },
    {
      _id: '3',
      studentName: 'Vikram Reddy',
      studentCollege: 'OU Hyderabad',
      status: 'contacted',
      price: '₹10,000',
      sharing: 'Single',
      date: '11 May',
      moveInDate: '15 June 2024',
      phone: '+91 98765 43212',
      message: 'I want a single room with attached bathroom.'
    },
    {
      _id: '4',
      studentName: 'Sneha Patil',
      studentCollege: 'MGU Hyderabad',
      status: 'closed',
      price: '₹6,000',
      sharing: '2 Sharing',
      date: '11 May',
      moveInDate: '01 June 2024',
      phone: '+91 98765 43213',
      message: 'Need accommodation starting next month.'
    },
    {
      _id: '5',
      studentName: 'Arjun Mehta',
      studentCollege: 'IIT Hyderabad',
      status: 'contacted',
      price: '₹12,000',
      sharing: 'Single',
      date: '10 May',
      moveInDate: '10 May 2024',
      phone: '+91 98765 43214',
      message: 'Ready to move in immediately if AC is provided.'
    }
  ];

  const fetchEnquiries = async () => {
    try {
      // In a real app, we fetch from API. For exact mockup matching, we use the mock data
      setEnquiries(mockEnquiries);
    } catch (error) {
      console.log('Error fetching enquiries:', error);
      setEnquiries(mockEnquiries);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    if (activeFilter === 'all') return enquiries;
    return enquiries.filter(e => e.status === activeFilter);
  }, [enquiries, activeFilter]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('LeadDetails', { lead: item })}
    >
      <View style={styles.avatarBox}>
        <Ionicons name="person-circle" size={48} color="#c7d2fe" />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.studentCollege}>{item.studentCollege}</Text>
        <Text style={styles.budgetRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.sharingText}> • {item.sharing}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        {/* We use navigation.canGoBack() to only show back button if pushed onto stack,
            otherwise it's the root tab screen and we can just show the title */}
        {navigation?.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e1b29" />
          </TouchableOpacity>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Student Leads</Text>
          <Text style={styles.subtitle}>All incoming leads from students</Text>
        </View>
      </View>

      {/* List Content */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={filteredEnquiries}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyTitle}>No leads found</Text>
            </View>
          }
        />
      )}

      {/* Bottom Filter Tabs */}
      <View style={styles.bottomFiltersContainer}>
        <View style={styles.filterTabsRow}>
          {STATUS_FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  backBtn: { marginBottom: 12, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100, // leave space for absolute bottom filters
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarBox: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b29',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  studentCollege: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  sharingText: {
    fontSize: 14,
    color: '#6b7280',
  },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#8b85a3' },

  bottomFiltersContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: '#4F46E5', // vibrant purple
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },
});
