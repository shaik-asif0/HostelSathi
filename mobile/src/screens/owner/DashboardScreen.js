import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl
} from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen({ navigation }) {
  const { user, token } = useSelector(state => state.auth);
  const [hostels, setHostels] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [selectedHostelAnalytics, setSelectedHostelAnalytics] = useState(null);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  // ✅ Fix Bug #10: Handle both user.id and user._id from MongoDB
  const userId = user?._id || user?.id;

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [hostelsRes, enquiriesRes] = await Promise.all([
        apiClient.get('/hostels'),
        apiClient.get('/enquiries/owner')
      ]);

      if (hostelsRes.data.success) {
        // ✅ Fix Bug #10: compare against both _id and id fields
        const myHostels = hostelsRes.data.hostels.filter(
          h => h.owner?.toString() === userId?.toString()
        );
        setHostels(myHostels);
      }

      if (enquiriesRes.data.success) {
        setLeadsCount(enquiriesRes.data.count || enquiriesRes.data.enquiries?.length || 0);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [userId]);

  const fetchHostelAnalytics = async (hostel) => {
    try {
      const res = await apiClient.get(`/hostels/${hostel._id}/analytics`);
      if (res.data.success) {
        setSelectedHostelAnalytics({ hostel, analytics: res.data.analytics });
        setAnalyticsModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Analytics Error', 'Failed to load analytics for this listing.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          apiClient.delete(`/hostels/${id}`)
            .then(res => {
              if (res.data.success) {
                Alert.alert('Deleted', 'Listing removed successfully.');
                fetchDashboardData();
              }
            })
            .catch(() => Alert.alert('Error', 'Could not delete listing. Try again.'));
        }
      }
    ]);
  };

  const calculatePotentialRevenue = () => {
    return hostels.reduce((sum, h) => {
      const single = (h.rent.single || 0) * (h.availability?.singleVacancy || 1);
      const sharing2 = (h.rent.sharing2 || 0) * (h.availability?.sharing2Vacancy || 4);
      const sharing3 = (h.rent.sharing3 || 0) * (h.availability?.sharing3Vacancy || 6);
      return sum + single + sharing2 + sharing3;
    }, 0);
  };

  const totalViews = Object.values(analyticsMap).reduce((s, a) => s + (a.totalViews || 0), 0);

  // Inline mini sparkline bar chart component
  const SparkLine = ({ data, color = '#7c3aed' }) => {
    const max = Math.max(...data, 1);
    return (
      <View style={styles.sparkline}>
        {data.map((v, i) => (
          <View key={i} style={styles.sparklineBarWrap}>
            <View style={[styles.sparklineBar, { height: Math.max(4, (v / max) * 36), backgroundColor: color }]} />
            <Text style={styles.sparklineLabel}>{DAY_LABELS[i].charAt(0)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Funnel step component
  const FunnelStep = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <View style={styles.funnelStep}>
        <View style={styles.funnelLabelRow}>
          <Text style={styles.funnelLabel}>{label}</Text>
          <Text style={[styles.funnelCount, { color }]}>{count}</Text>
        </View>
        <View style={styles.funnelBarBg}>
          <View style={[styles.funnelBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.funnelPct}>{pct}%</Text>
      </View>
    );
  };

  const renderHostelRow = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            {item.isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumText}>⭐</Text></View>}
          </View>
          <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.address}</Text>
        </View>
        <View style={[styles.statusBadge, item.isVerified ? styles.statusVerified : styles.statusPending]}>
          <Text style={styles.statusText}>{item.isVerified ? '✓ Verified' : '⏳ Pending'}</Text>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.cardStatsRow}>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatVal}>★ {item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
          <Text style={styles.cardStatLabel}>Rating</Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatVal}>{item.reviewCount}</Text>
          <Text style={styles.cardStatLabel}>Reviews</Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatVal}>{item.viewCount || 0}</Text>
          <Text style={styles.cardStatLabel}>Views</Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatVal}>
            ₹{Math.min(
              item.rent.single || 99999,
              item.rent.sharing2 || 99999,
              item.rent.sharing3 || 99999
            ).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.cardStatLabel}>Min Rent</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActionRow}>
        <TouchableOpacity
          style={styles.actionBtnAnalytics}
          onPress={() => fetchHostelAnalytics(item)}
        >
          <Text style={styles.actionBtnAnalyticsText}>📊 Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => navigation.navigate('AddHostel', { editHostel: item })}
        >
          <Text style={styles.actionBtnEditText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.actionBtnDeleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7c3aed" />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.ownerName}>{user?.name} Garu 🙏</Text>
          </View>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => navigation.navigate('AddHostel')}
          >
            <Text style={styles.btnAddText}>+ Add PG</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statCardIcon}>🏠</Text>
            <Text style={styles.statCardVal}>{hostels.length}</Text>
            <Text style={styles.statCardLabel}>Active Listings</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statCardIcon}>📩</Text>
            <Text style={styles.statCardVal}>{leadsCount}</Text>
            <Text style={styles.statCardLabel}>Total Leads</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAmber]}>
            <Text style={styles.statCardIcon}>👁️</Text>
            <Text style={styles.statCardVal}>
              {hostels.reduce((s, h) => s + (h.viewCount || 0), 0)}
            </Text>
            <Text style={styles.statCardLabel}>Total Views</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statCardIcon}>⭐</Text>
            <Text style={styles.statCardVal}>
              {hostels.length > 0
                ? (hostels.reduce((s, h) => s + (h.rating || 0), 0) / hostels.length).toFixed(1)
                : '—'
              }
            </Text>
            <Text style={styles.statCardLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Revenue Forecast Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>💰 Revenue Potential</Text>
            <Text style={styles.revenueSubtitle}>Estimated full-occupancy income</Text>
          </View>
          <Text style={styles.revenueVal}>
            ₹{calculatePotentialRevenue().toLocaleString('en-IN')}
            <Text style={styles.revenueUnit}>/month</Text>
          </Text>
          <View style={styles.revenueBreakdown}>
            {hostels.slice(0, 3).map(h => (
              <View key={h._id} style={styles.revenueRow}>
                <Text style={styles.revenueRowName} numberOfLines={1}>{h.name}</Text>
                <Text style={styles.revenueRowVal}>
                  ₹{(
                    (h.rent.single || 0) * (h.availability?.singleVacancy || 1) +
                    (h.rent.sharing2 || 0) * (h.availability?.sharing2Vacancy || 4) +
                    (h.rent.sharing3 || 0) * (h.availability?.sharing3Vacancy || 6)
                  ).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* My Listings */}
        <Text style={styles.sectionTitle}>My Hostel Profiles</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7c3aed" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={hostels}
            renderItem={renderHostelRow}
            keyExtractor={item => item._id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🏚️</Text>
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptySub}>Add your first PG to start getting leads!</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => navigation.navigate('AddHostel')}
                >
                  <Text style={styles.addBtnText}>+ Add Your First PG</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Analytics Modal */}
      <Modal
        visible={analyticsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAnalyticsModalVisible(false)}
      >
        <View style={styles.analyticsOverlay}>
          <View style={styles.analyticsSheet}>
            <View style={styles.analyticsHandle} />
            {selectedHostelAnalytics && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.analyticsTitle}>
                  📊 {selectedHostelAnalytics.hostel.name}
                </Text>

                {/* View Metrics */}
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>👁️ Views This Week</Text>
                  <Text style={styles.analyticsBigNum}>
                    {selectedHostelAnalytics.analytics.totalViews}
                    <Text style={styles.analyticsBigNumSub}> total views</Text>
                  </Text>
                  <SparkLine
                    data={selectedHostelAnalytics.analytics.weeklyViews || [0, 0, 0, 0, 0, 0, 0]}
                    color="#7c3aed"
                  />
                </View>

                {/* Enquiry Funnel */}
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>📋 Enquiry Funnel</Text>
                  <Text style={styles.funnelTotal}>
                    {selectedHostelAnalytics.analytics.totalEnquiries} total enquiries
                  </Text>
                  {selectedHostelAnalytics.analytics.enquiryFunnel && (() => {
                    const f = selectedHostelAnalytics.analytics.enquiryFunnel;
                    const total = f.pending + f.contacted + f.visited + f.closed;
                    return (
                      <View>
                        <FunnelStep label="📩 Pending" count={f.pending} total={total} color="#f59e0b" />
                        <FunnelStep label="📞 Contacted" count={f.contacted} total={total} color="#3b82f6" />
                        <FunnelStep label="🏠 Visited" count={f.visited} total={total} color="#8b5cf6" />
                        <FunnelStep label="✅ Closed" count={f.closed} total={total} color="#10b981" />
                      </View>
                    );
                  })()}
                </View>

                {/* Availability */}
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>🛏️ Room Availability</Text>
                  <View style={styles.availabilityGrid}>
                    {[
                      { label: 'Single', key: 'singleVacancy' },
                      { label: '2-Share', key: 'sharing2Vacancy' },
                      { label: '3-Share', key: 'sharing3Vacancy' }
                    ].map(r => {
                      const count = selectedHostelAnalytics.analytics.availability?.[r.key] || 0;
                      return (
                        <View key={r.key} style={[styles.availabilityCard, count === 0 && styles.availabilityCardFull]}>
                          <Text style={styles.availabilityCount}>{count}</Text>
                          <Text style={styles.availabilityLabel}>{r.label}</Text>
                          <Text style={[styles.availabilityStatus, count > 0 ? styles.available : styles.full]}>
                            {count > 0 ? 'Available' : 'Full'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Potential Revenue */}
                <View style={styles.analyticsSection}>
                  <Text style={styles.analyticsSectionTitle}>💰 Revenue Potential</Text>
                  {Object.entries(selectedHostelAnalytics.analytics.potentialRevenue || {}).map(([key, val]) => (
                    <View key={key} style={styles.revRow}>
                      <Text style={styles.revRowLabel}>
                        {key === 'single' ? '🛏 Single' : key === 'sharing2' ? '🛏🛏 2-Share' : '🛏🛏🛏 3-Share'}
                      </Text>
                      <Text style={styles.revRowVal}>₹{val.toLocaleString('en-IN')}/mo</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.analyticsCloseBtn}
              onPress={() => setAnalyticsModalVisible(false)}
            >
              <Text style={styles.analyticsCloseBtnText}>Close Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6fc' },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  welcomeText: { fontSize: 13, color: '#8b85a3' },
  ownerName: { fontSize: 20, fontWeight: 'bold', color: '#1e1b29' },
  btnAdd: {
    backgroundColor: '#7c3aed',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  btnAddText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start'
  },
  statCardPurple: { backgroundColor: '#ede9fe', borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)' },
  statCardGreen: { backgroundColor: '#d1fae5', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' },
  statCardAmber: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  statCardBlue: { backgroundColor: '#dbeafe', borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)' },
  statCardIcon: { fontSize: 22, marginBottom: 6 },
  statCardVal: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29' },
  statCardLabel: { fontSize: 11, color: '#5f5a75', marginTop: 2, fontWeight: '600' },
  revenueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  revenueHeader: { marginBottom: 8 },
  revenueTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e1b29' },
  revenueSubtitle: { fontSize: 11, color: '#a09abc', marginTop: 2 },
  revenueVal: { fontSize: 28, fontWeight: 'bold', color: '#7c3aed', marginBottom: 12 },
  revenueUnit: { fontSize: 14, fontWeight: 'normal', color: '#8b85a3' },
  revenueBreakdown: { borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.08)', paddingTop: 10 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  revenueRowName: { fontSize: 12, color: '#5f5a75', flex: 1 },
  revenueRowVal: { fontSize: 12, fontWeight: 'bold', color: '#7c3aed' },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e1b29', marginBottom: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29', flex: 1 },
  premiumBadge: { backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 4 },
  premiumText: { fontSize: 12 },
  cardAddress: { fontSize: 12, color: '#8b85a3' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 },
  statusVerified: { backgroundColor: '#d1fae5' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#059669' },
  cardStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f6fc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center'
  },
  cardStat: { flex: 1, alignItems: 'center' },
  cardStatVal: { fontSize: 13, fontWeight: 'bold', color: '#7c3aed' },
  cardStatLabel: { fontSize: 10, color: '#a09abc', marginTop: 2 },
  cardStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(124,58,237,0.12)' },
  cardActionRow: { flexDirection: 'row', gap: 8 },
  actionBtnAnalytics: {
    flex: 1,
    backgroundColor: 'rgba(124,58,237,0.08)',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)'
  },
  actionBtnAnalyticsText: { color: '#7c3aed', fontWeight: 'bold', fontSize: 12 },
  actionBtnEdit: {
    flex: 1,
    backgroundColor: '#f8f6fc',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)'
  },
  actionBtnEditText: { color: '#5f5a75', fontWeight: 'bold', fontSize: 12 },
  actionBtnDelete: {
    width: 42,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2'
  },
  actionBtnDeleteText: { fontSize: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', marginBottom: 20 },
  addBtn: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  addBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  // Analytics Modal
  analyticsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  analyticsSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%'
  },
  analyticsHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e0f8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  analyticsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 16 },
  analyticsSection: {
    marginBottom: 20,
    backgroundColor: '#f8f6fc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)'
  },
  analyticsSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  analyticsBigNum: { fontSize: 32, fontWeight: 'bold', color: '#7c3aed', marginBottom: 10 },
  analyticsBigNumSub: { fontSize: 14, fontWeight: 'normal', color: '#8b85a3' },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 56 },
  sparklineBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sparklineBar: { width: '70%', borderRadius: 3 },
  sparklineLabel: { fontSize: 9, color: '#a09abc', marginTop: 4 },
  funnelTotal: { fontSize: 12, color: '#8b85a3', marginBottom: 12 },
  funnelStep: { marginBottom: 10 },
  funnelLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  funnelLabel: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  funnelCount: { fontSize: 12, fontWeight: 'bold' },
  funnelBarBg: { height: 8, backgroundColor: '#e5e0f8', borderRadius: 4, overflow: 'hidden' },
  funnelBarFill: { height: '100%', borderRadius: 4 },
  funnelPct: { fontSize: 10, color: '#a09abc', textAlign: 'right', marginTop: 2 },
  availabilityGrid: { flexDirection: 'row', gap: 10 },
  availabilityCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)'
  },
  availabilityCardFull: { borderColor: 'rgba(239,68,68,0.2)' },
  availabilityCount: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29' },
  availabilityLabel: { fontSize: 11, color: '#8b85a3', marginTop: 2 },
  availabilityStatus: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  available: { color: '#10b981' },
  full: { color: '#ef4444' },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  revRowLabel: { fontSize: 13, color: '#5f5a75' },
  revRowVal: { fontSize: 13, fontWeight: 'bold', color: '#7c3aed' },
  analyticsCloseBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  analyticsCloseBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 }
});
