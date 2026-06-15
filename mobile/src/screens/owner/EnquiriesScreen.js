import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Linking, RefreshControl
} from 'react-native';
import { useSelector } from 'react-redux';
// import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATUS_FILTERS = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'pending', label: 'Pending', icon: 'hourglass-outline' },
  { key: 'contacted', label: 'Contacted', icon: 'call' },
  { key: 'visited', label: 'Visited', icon: 'home' },
  { key: 'closed', label: 'Closed', icon: 'checkmark-circle' }
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  contacted: '#6366f1',
  visited: '#10b981',
  closed: '#8b85a3'
};

export default function EnquiriesScreen() {
  const { token } = useSelector(state => state.auth);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const mockEnquiries = [
    {
      _id: '1',
      studentName: 'Asif Shaik',
      studentCollege: 'JNTU Hyderabad',
      status: 'pending',
      hostelName: 'Miyapur Metro View PG',
      message: 'I am interested in a single sharing room. Is it available next week?',
      studentPhone: '9876543210'
    },
    {
      _id: '2',
      studentName: 'Rahul Sharma',
      studentCollege: 'CBIT',
      status: 'contacted',
      hostelName: 'Central Boys PG',
      message: 'Need 2-sharing room with veg food only.',
      studentPhone: '9876543211'
    },
    {
      _id: '3',
      studentName: 'Priya Reddy',
      studentCollege: 'Osmania University',
      status: 'visited',
      hostelName: 'Sunrise Girls Hostel',
      message: 'Is AC available?',
      studentPhone: '9876543212'
    }
  ];

  const fetchEnquiries = () => {
    // If enquiries are empty, populate them first time
    if (enquiries.length === 0) {
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

  const handleStatusUpdate = (id, nextStatus) => {
    setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: nextStatus } : e));
    Alert.alert('Success', 'Status updated successfully.');
  };

  const handleCall = (phone) => {
    if (!phone) return Alert.alert('No phone', 'Phone number not available.');
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone, name) => {
    if (!phone) return Alert.alert('No phone', 'Phone number not available.');
    const msg = encodeURIComponent(
      `Hi ${name || 'there'}, I'm the hostel owner from HostelSathi. I'm following up on your enquiry. Please let me know when you'd like to visit!`
    );
    Linking.openURL(`https://wa.me/91${phone}?text=${msg}`).catch(() =>
      Alert.alert('WhatsApp not installed', 'Please install WhatsApp or use the call button.')
    );
  };

  // Badge counts per status
  const badgeCounts = useMemo(() => {
    const counts = { all: enquiries.length };
    STATUS_FILTERS.slice(1).forEach(f => {
      counts[f.key] = enquiries.filter(e => e.status === f.key).length;
    });
    return counts;
  }, [enquiries]);

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    if (activeFilter === 'all') return enquiries;
    return enquiries.filter(e => e.status === activeFilter);
  }, [enquiries, activeFilter]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{(item.studentName || 'S').charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.studentName || 'Student'}</Text>
            {item.studentCollege ? (
              <Text style={styles.studentCollege}>{item.studentCollege}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}18` }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Hostel name if available */}
      {item.hostelName ? (
        <View style={styles.hostelTag}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="home" size={10} color="#312E81" style={{ marginRight: 4 }} />
            <Text style={styles.hostelTagText}>{item.hostelName}</Text>
          </View>
        </View>
      ) : null}

      {/* Message */}
      {item.message ? (
        <View style={styles.msgBox}>
          <Text style={styles.msgText}>"{item.message}"</Text>
        </View>
      ) : null}

      {/* Contact Actions */}
      <View style={styles.contactRow}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => handleCall(item.studentPhone)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="call" size={13} color="#065f46" style={{ marginRight: 4 }} />
            <Text style={styles.callBtnText}>Call</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={() => handleWhatsApp(item.studentPhone, item.studentName)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="logo-whatsapp" size={13} color="#15803d" style={{ marginRight: 4 }} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Update Buttons */}
      <View style={styles.statusRow}>
        <Text style={styles.statusRowLabel}>Move to:</Text>
        <View style={styles.statusBtns}>
          {['contacted', 'visited', 'closed'].map(st => (
            <TouchableOpacity
              key={st}
              style={[
                styles.statusBtn,
                item.status === st && styles.statusBtnActive,
                { borderColor: STATUS_COLORS[st] }
              ]}
              onPress={() => handleStatusUpdate(item._id, st)}
            >
              <Text style={[
                styles.statusBtnText,
                item.status === st && { color: '#ffffff' }
              ]}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Student Leads</Text>
          <Ionicons name="mail" size={20} color="#1e1b29" style={{ marginLeft: 6 }} />
        </View>
        <Text style={styles.headerSub}>{enquiries.length} total enquiries</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrap}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Ionicons name={f.icon} size={12} color={activeFilter === f.key ? '#ffffff' : '#7c6ba8'} />
              <Text style={[styles.filterTabText, activeFilter === f.key && styles.filterTabTextActive]}>
                {f.label}
              </Text>
              {badgeCounts[f.key] > 0 && (
                <View style={[styles.filterBadge, activeFilter === f.key && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, activeFilter === f.key && styles.filterBadgeTextActive]}>
                    {badgeCounts[f.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="mail-open-outline" size={48} color="#8b85a3" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No enquiries {activeFilter !== 'all' ? `with "${activeFilter}" status` : 'yet'}</Text>
              <Text style={styles.emptySub}>
                {activeFilter !== 'all'
                  ? 'Try switching to a different filter tab.'
                  : 'When students enquire about your PG, they will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e1b29' },
  headerSub: { fontSize: 12, color: '#8b85a3', marginTop: 2 },
  filterTabsWrap: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.06)'
  },
  filterTabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    backgroundColor: '#EEF2FF'
  },
  filterTabActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#7c6ba8' },
  filterTabTextActive: { color: '#ffffff' },
  filterBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4F46E5' },
  filterBadgeTextActive: { color: '#ffffff' },
  listContent: { padding: 14, paddingBottom: 30 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#8b85a3', textAlign: 'center', paddingHorizontal: 32 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29' },
  studentCollege: { fontSize: 11, color: '#8b85a3', marginTop: 1 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  hostelTag: {
    backgroundColor: '#ffffff', borderRadius: 6, paddingVertical: 4,
    paddingHorizontal: 10, alignSelf: 'flex-start', marginBottom: 8
  },
  hostelTagText: { fontSize: 11, color: '#312E81', fontWeight: '600' },
  msgBox: {
    backgroundColor: '#ffffff', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.06)', marginBottom: 12
  },
  msgText: { fontSize: 13, fontStyle: 'italic', color: '#5f5a75' },
  contactRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  callBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7',
    alignItems: 'center'
  },
  callBtnText: { color: '#065f46', fontWeight: 'bold', fontSize: 13 },
  whatsappBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#4ade80',
    alignItems: 'center'
  },
  whatsappBtnText: { color: '#15803d', fontWeight: 'bold', fontSize: 13 },
  statusRow: { borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.06)', paddingTop: 10 },
  statusRowLabel: {
    fontSize: 10, color: '#a09abc', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8
  },
  statusBtns: { flexDirection: 'row', gap: 6 },
  statusBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, backgroundColor: '#EEF2FF'
  },
  statusBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  statusBtnText: { fontSize: 11, fontWeight: '600', color: '#5f5a75' }
});
