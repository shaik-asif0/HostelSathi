import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATUS_FILTERS = ['Pending', 'Approved', 'Completed'];

const MOCK_REQUESTS = [
  {
    id: '1',
    studentName: 'Rahul Kumar',
    requestedDate: '12 May 2024',
    requestedTime: '10:00 AM',
    postedTime: '10:00 AM',
    status: 'Pending'
  },
  {
    id: '2',
    studentName: 'Anjali Sharma',
    requestedDate: '13 May 2024',
    requestedTime: '04:00 PM',
    postedTime: '04:00 PM',
    status: 'Pending'
  },
  {
    id: '3',
    studentName: 'Vikram Reddy',
    requestedDate: '14 May 2024',
    requestedTime: '11:00 AM',
    postedTime: '11:00 AM',
    status: 'Pending'
  }
];

export default function VisitRequestsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const filteredRequests = requests.filter(req => req.status === activeFilter);

  const handleStatusUpdate = (id, newStatus) => {
    // Optimistic Update
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    // Provide user feedback that it feels like a real app
    Alert.alert(
      'Success',
      `Visit request has been ${newStatus.toLowerCase()}!`,
      [{ text: 'OK' }]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarBox}>
          <Ionicons name="person-circle" size={48} color="#c7d2fe" />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.postedTime}>{item.postedTime}</Text>
          </View>
          <Text style={styles.requestDate}>Request for {item.requestedDate}</Text>
          <Text style={styles.requestTime}>{item.requestedTime}</Text>
          
          {/* Action Buttons */}
          {item.status === 'Pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleStatusUpdate(item.id, 'Approved')}
              >
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleStatusUpdate(item.id, 'Rejected')}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'Approved' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn, { backgroundColor: '#EEF2FF' }]}
                onPress={() => handleStatusUpdate(item.id, 'Completed')}
              >
                <Text style={[styles.approveBtnText, { color: '#4F46E5' }]}>Mark Completed</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Visit Requests</Text>
          <Text style={styles.subtitle}>Manage student visit requests</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        {STATUS_FILTERS.map((filter) => {
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
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} visit requests.</Text>
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
  backBtn: { marginBottom: 12, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#1e1b29',
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTop: {
    flexDirection: 'row',
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
  postedTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  requestDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: '#d1fae5', // light green
  },
  approveBtnText: {
    color: '#059669', // dark green text
    fontWeight: 'bold',
    fontSize: 13,
  },
  rejectBtn: {
    backgroundColor: '#fee2e2', // light red
  },
  rejectBtnText: {
    color: '#dc2626', // dark red text
    fontWeight: 'bold',
    fontSize: 13,
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
