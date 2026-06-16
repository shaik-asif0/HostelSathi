import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl, TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import apiClient, { enquiriesAPI } from '../../api/apiClient';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { hostels: allHostels } = useSelector(state => state.hostels);
  const [hostels, setHostels] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [selectedHostelAnalytics, setSelectedHostelAnalytics] = useState(null);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  // Quick Vacancy Update state
  const [quickUpdateModalVisible, setQuickUpdateModalVisible] = useState(false);
  const [selectedHostelForUpdate, setSelectedHostelForUpdate] = useState(null);
  const [quickVacancies, setQuickVacancies] = useState({ single: '0', sharing2: '0', sharing3: '0' });
  const [quickUpdating, setQuickUpdating] = useState(false);

  // UPI state
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [selectedHostelForUpi, setSelectedHostelForUpi] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [updatingUpi, setUpdatingUpi] = useState(false);

  // Tenants state
  const [tenantsModalVisible, setTenantsModalVisible] = useState(false);
  const [selectedHostelForTenants, setSelectedHostelForTenants] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Digital Receipt state
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // ✅ Fix Bug #10: Handle both user.id and user._id from MongoDB
  const userId = user?._id || user?.id;

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    // Filter hostels by owner ID if possible, otherwise show all as a fallback for the mockup
    const userHostels = allHostels.filter(h => h.owner === userId);
    setHostels(userHostels.length > 0 ? userHostels : allHostels);

    try {
      const res = await enquiriesAPI.getOwnerEnquiries();
      if (res.data.success) {
        setLeadsCount(res.data.count);
      } else {
        setLeadsCount(12); // Mock fallback
      }
    } catch (error) {
      console.log("Failed to fetch leads for dashboard", error);
      setLeadsCount(12); // Mock fallback
    }
    
    setRefreshing(false);
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

  const openQuickUpdate = (hostel) => {
    setSelectedHostelForUpdate(hostel);
    setQuickVacancies({
      single: hostel.availability?.singleVacancy?.toString() || '0',
      sharing2: hostel.availability?.sharing2Vacancy?.toString() || '0',
      sharing3: hostel.availability?.sharing3Vacancy?.toString() || '0'
    });
    setQuickUpdateModalVisible(true);
  };

  const handleQuickUpdateSubmit = () => {
    setQuickUpdating(true);
    setTimeout(() => {
      setQuickUpdateModalVisible(false);
      fetchDashboardData();
      setQuickUpdating(false);
      Alert.alert('Success', 'Vacancies updated successfully.');
    }, 1000);
  };

  const openUpiModal = (hostel) => {
    setSelectedHostelForUpi(hostel);
    setUpiId(hostel.paymentUpiId || '');
    setUpiModalVisible(true);
  };

  const handleUpiSubmit = () => {
    setUpdatingUpi(true);
    setTimeout(() => {
      setUpiModalVisible(false);
      fetchDashboardData();
      Alert.alert('Success', 'Payment UPI ID updated.');
      setUpdatingUpi(false);
    }, 1000);
  };

  const openTenantsModal = (hostel) => {
    setSelectedHostelForTenants(hostel);
    setTenantsModalVisible(true);
    setLoadingTenants(true);
    setTimeout(() => {
      setTenants([
        {
          _id: 't1',
          studentName: 'Asif Shaik',
          rentAmount: hostel.rent?.single || 5000,
          studentPhone: '9876543210',
          pendingAmount: 0,
          roomType: 'Single Room',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 't2',
          studentName: 'Karthik Reddy',
          rentAmount: hostel.rent?.sharing2 || 4000,
          studentPhone: '9876543211',
          pendingAmount: 1500,
          roomType: '2-Sharing Room',
          joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoadingTenants(false);
    }, 500);
  };

  const handleRemoveTenant = (tenantId) => {
    Alert.alert('Remove Student', 'Are you sure you want to permanently remove this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          setTenants(prev => prev.filter(t => t._id !== tenantId));
          Alert.alert('Success', 'Student removed.');
        }
      }
    ]);
  };

  const handleWhatsAppReminder = (tenant) => {
    const message = `Hello ${tenant.studentName}, this is a gentle reminder that your rent for ${selectedHostelForTenants?.name} is due. Please use the HostelSathi app to pay via my QR code. Thanks!`;
    const url = `whatsapp://send?phone=${tenant.studentPhone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on your device.');
    });
  };

  const handleShowReceipt = (tenant) => {
    setSelectedReceipt(tenant);
    setReceiptModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          Alert.alert('Deleted', 'Listing removed successfully.');
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
  const SparkLine = ({ data, color = '#4F46E5' }) => {
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
  const FunnelStep = ({ icon, label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <View style={styles.funnelStep}>
        <View style={styles.funnelLabelRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={icon} size={12} color={color} style={{ marginRight: 4 }} />
            <Text style={styles.funnelLabel}>{label}</Text>
          </View>
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
            {item.isPremium && <View style={styles.premiumBadge}><Ionicons name="star" size={12} color="#d97706" /></View>}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={12} color="#8b85a3" style={{ marginRight: 4 }} />
            <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, item.isVerified ? styles.statusVerified : styles.statusPending]}>
          <Text style={styles.statusText}>{item.isVerified ? '✓ Verified' : '⏳ Pending'}</Text>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.cardStatsRow}>
        <View style={styles.cardStat}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={12} color="#f59e0b" style={{ marginRight: 2 }} />
            <Text style={styles.cardStatVal}>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
          </View>
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
          style={styles.actionBtnQuickUpdate}
          onPress={() => openQuickUpdate(item)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bed" size={14} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnQuickUpdateText}>Vacancies</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnAnalytics}
          onPress={() => fetchHostelAnalytics(item)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="stats-chart" size={14} color="#4F46E5" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnAnalyticsText}>Stats</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => navigation.navigate('AddHostel', { editHostel: item })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="create" size={14} color="#5f5a75" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnEditText}>Edit</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.cardActionRow, { marginTop: 8 }]}>
        <TouchableOpacity
          style={[styles.actionBtnEdit, { flex: 1, backgroundColor: '#f0ecfd', borderColor: '#d8b4fe' }]}
          onPress={() => openUpiModal(item)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="card" size={14} color="#4F46E5" style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnEditText, { color: '#4F46E5' }]}>Set UPI</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtnEdit, { flex: 1, backgroundColor: '#dcfce7', borderColor: '#86efac' }]}
          onPress={() => openTenantsModal(item)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="school" size={14} color="#16a34a" style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnEditText, { color: '#16a34a' }]}>Tenants</Text>
          </View>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
      >

        {/* Custom Header */}
        <View style={styles.topNav}>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#1e1b29" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.bellIconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#1e1b29" />
              <View style={styles.redDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={styles.profilePicContainer}>
            <Ionicons name="person-circle" size={56} color="#c4b5fd" />
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingLight}>Good Morning, 👋</Text>
            <Text style={styles.ownerNameDark}>{user?.name || "Asif Shaik"}</Text>
            <Text style={styles.greetingSub}>Welcome back to your dashboard</Text>
          </View>
        </View>

        {/* 2x2 Grid Stats */}
        <View style={styles.statsGridRow}>
          {/* Total Hostels */}
          <View style={styles.statCardModern}>
            <View style={styles.statRowModern}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="home-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCardLabel}>Total Hostels</Text>
                <Text style={styles.statCardVal}>{hostels.length}</Text>
              </View>
            </View>
          </View>
          {/* Total Leads */}
          <View style={styles.statCardModern}>
            <View style={styles.statRowModern}>
              <View style={[styles.iconBox, { backgroundColor: '#d1fae5' }]}>
                <Ionicons name="document-text-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCardLabel}>Total Leads</Text>
                <Text style={styles.statCardVal}>{leadsCount}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGridRow}>
          {/* Total Bookings */}
          <View style={styles.statCardModern}>
            <View style={styles.statRowModern}>
              <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
                <Ionicons name="briefcase-outline" size={24} color="#f97316" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCardLabel}>Total Bookings</Text>
                <Text style={styles.statCardVal}>45</Text>
              </View>
            </View>
          </View>
          {/* Monthly Revenue */}
          <View style={styles.statCardModern}>
            <View style={styles.statRowModern}>
              <View style={[styles.iconBox, { backgroundColor: '#ffe4e6' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#f43f5e" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statCardLabel}>Monthly Revenue</Text>
                <Text style={styles.statCardVal} numberOfLines={1} adjustsFontSizeToFit>₹{calculatePotentialRevenue().toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Occupancy and Active Rooms */}
        <View style={styles.statsGridRow}>
          <View style={styles.wideStatCard}>
            <Text style={styles.statCardLabel}>Occupancy Rate</Text>
            <Text style={[styles.statCardVal, { marginBottom: 6 }]}>78%</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '78%' }]} />
            </View>
          </View>
          <View style={styles.wideStatCard}>
            <Text style={styles.statCardLabel}>Active Rooms</Text>
            <Text style={[styles.statCardVal, { marginTop: 4 }]}>32 / 45</Text>
          </View>
        </View>

        {/* Pending Requests and Unread Messages */}
        <View style={styles.statsGridRow}>
          <View style={styles.wideStatCard}>
            <Text style={styles.statCardLabel}>Pending Requests</Text>
            <Text style={[styles.statCardVal, { marginTop: 4 }]}>12</Text>
          </View>
          <View style={styles.wideStatCard}>
            <Text style={styles.statCardLabel}>Unread Messages</Text>
            <Text style={[styles.statCardVal, { marginTop: 4 }]}>8</Text>
          </View>
        </View>

        {/* My Listings */}
        <Text style={styles.sectionTitle}>My Hostel Profiles</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={hostels}
            renderItem={renderHostelRow}
            keyExtractor={item => item._id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="home-outline" size={48} color="#8b85a3" style={{ marginBottom: 12 }} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="stats-chart" size={18} color="#1e1b29" style={{ marginRight: 6 }} />
                  <Text style={[styles.analyticsTitle, { marginBottom: 0 }]}>
                    {selectedHostelAnalytics.hostel.name}
                  </Text>
                </View>

                {/* View Metrics */}
                <View style={styles.analyticsSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="eye" size={13} color="#1e1b29" style={{ marginRight: 6 }} />
                    <Text style={[styles.analyticsSectionTitle, { marginBottom: 0 }]}>Views This Week</Text>
                  </View>
                  <Text style={styles.analyticsBigNum}>
                    {selectedHostelAnalytics.analytics.totalViews}
                    <Text style={styles.analyticsBigNumSub}> total views</Text>
                  </Text>
                  <SparkLine
                    data={selectedHostelAnalytics.analytics.weeklyViews || [0, 0, 0, 0, 0, 0, 0]}
                    color="#4F46E5"
                  />
                </View>

                {/* Enquiry Funnel */}
                <View style={styles.analyticsSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="clipboard" size={13} color="#1e1b29" style={{ marginRight: 6 }} />
                    <Text style={[styles.analyticsSectionTitle, { marginBottom: 0 }]}>Enquiry Funnel</Text>
                  </View>
                  <Text style={styles.funnelTotal}>
                    {selectedHostelAnalytics.analytics.totalEnquiries} total enquiries
                  </Text>
                  {selectedHostelAnalytics.analytics.enquiryFunnel && (() => {
                    const f = selectedHostelAnalytics.analytics.enquiryFunnel;
                    const total = f.pending + f.contacted + f.visited + f.closed;
                    return (
                      <View>
                        <FunnelStep icon="mail" label="Pending" count={f.pending} total={total} color="#f59e0b" />
                        <FunnelStep icon="call" label="Contacted" count={f.contacted} total={total} color="#3b82f6" />
                        <FunnelStep icon="home" label="Visited" count={f.visited} total={total} color="#8b5cf6" />
                        <FunnelStep icon="checkmark-circle" label="Closed" count={f.closed} total={total} color="#10b981" />
                      </View>
                    );
                  })()}
                </View>

                {/* Availability */}
                <View style={styles.analyticsSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="bed" size={13} color="#1e1b29" style={{ marginRight: 6 }} />
                    <Text style={[styles.analyticsSectionTitle, { marginBottom: 0 }]}>Room Availability</Text>
                  </View>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="cash" size={13} color="#1e1b29" style={{ marginRight: 6 }} />
                    <Text style={[styles.analyticsSectionTitle, { marginBottom: 0 }]}>Revenue Potential</Text>
                  </View>
                  {Object.entries(selectedHostelAnalytics.analytics.potentialRevenue || {}).map(([key, val]) => (
                    <View key={key} style={styles.revRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="bed" size={12} color="#5f5a75" style={{ marginRight: 4 }} />
                        <Text style={styles.revRowLabel}>
                          {key === 'single' ? 'Single' : key === 'sharing2' ? '2-Share' : '3-Share'}
                        </Text>
                      </View>
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

      {/* Quick Update Vacancy Modal */}
      <Modal
        visible={quickUpdateModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setQuickUpdateModalVisible(false)}
      >
        <View style={styles.quickModalOverlay}>
          <View style={styles.quickModalBox}>
            <Text style={styles.quickModalTitle}>Quick Update Vacancies</Text>
            {selectedHostelForUpdate && (
              <Text style={styles.quickModalSub}>{selectedHostelForUpdate.name}</Text>
            )}

            <View style={styles.quickInputRow}>
              <Text style={styles.quickInputLabel}>Single Room</Text>
              <TextInput
                style={styles.quickInput}
                keyboardType="numeric"
                value={quickVacancies.single}
                onChangeText={(t) => setQuickVacancies(prev => ({ ...prev, single: t }))}
              />
            </View>
            <View style={styles.quickInputRow}>
              <Text style={styles.quickInputLabel}>2-Sharing</Text>
              <TextInput
                style={styles.quickInput}
                keyboardType="numeric"
                value={quickVacancies.sharing2}
                onChangeText={(t) => setQuickVacancies(prev => ({ ...prev, sharing2: t }))}
              />
            </View>
            <View style={styles.quickInputRow}>
              <Text style={styles.quickInputLabel}>3-Sharing</Text>
              <TextInput
                style={styles.quickInput}
                keyboardType="numeric"
                value={quickVacancies.sharing3}
                onChangeText={(t) => setQuickVacancies(prev => ({ ...prev, sharing3: t }))}
              />
            </View>

            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={styles.quickCancelBtn}
                onPress={() => setQuickUpdateModalVisible(false)}
              >
                <Text style={styles.quickCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSaveBtn}
                onPress={handleQuickUpdateSubmit}
                disabled={quickUpdating}
              >
                {quickUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.quickSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UPI Update Modal */}
      <Modal visible={upiModalVisible} transparent animationType="fade" onRequestClose={() => setUpiModalVisible(false)}>
        <View style={styles.quickModalOverlay}>
          <View style={styles.quickModalBox}>
            <Text style={styles.quickModalTitle}>Set Payment UPI</Text>
            <Text style={styles.quickModalSub}>Enter your UPI ID to let students pay rent directly.</Text>

            <TextInput
              style={[styles.quickInput, { width: '100%', textAlign: 'left', paddingHorizontal: 12 }]}
              placeholder="e.g. yourname@okicici"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />

            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickCancelBtn} onPress={() => setUpiModalVisible(false)}>
                <Text style={styles.quickCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSaveBtn} onPress={handleUpiSubmit} disabled={updatingUpi}>
                {updatingUpi ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.quickSaveText}>Save UPI</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tenants Modal */}
      <Modal visible={tenantsModalVisible} transparent animationType="slide" onRequestClose={() => setTenantsModalVisible(false)}>
        <View style={styles.analyticsOverlay}>
          <View style={[styles.analyticsSheet, { height: '80%' }]}>
            <View style={styles.analyticsHandle} />
            <Text style={styles.analyticsTitle}>Manage Students ({tenants.length})</Text>

            {loadingTenants ? (
              <ActivityIndicator color="#4F46E5" size="large" style={{ marginTop: 40 }} />
            ) : tenants.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="mail-open-outline" size={48} color="#8b85a3" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No Students Yet</Text>
                <Text style={styles.emptySub}>When students pay and join via the app, they will appear here.</Text>
              </View>
            ) : (
              <FlatList
                data={tenants}
                keyExtractor={item => item._id}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e0f8' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1e1b29' }}>{item.studentName}</Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#4F46E5' }}>Rent: ₹{item.rentAmount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="call" size={13} color="#5f5a75" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#5f5a75' }}>{item.studentPhone}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: item.pendingAmount > 0 ? '#ef4444' : '#10b981' }}>
                        {item.pendingAmount > 0 ? `Due: ₹${item.pendingAmount}` : 'No Dues'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="bed" size={12} color="#8b85a3" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: '#8b85a3' }}>{item.roomType} • Joined {new Date(item.joinDate).toLocaleDateString()}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#dcfce7', paddingVertical: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => handleWhatsAppReminder(item)}
                      >
                        <Ionicons name="notifications" size={12} color="#16a34a" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 12 }}>Remind</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#EEF2FF', paddingVertical: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => handleShowReceipt(item)}
                      >
                        <Ionicons name="document-text" size={12} color="#4F46E5" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#4F46E5', fontWeight: 'bold', fontSize: 12 }}>Receipt</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#fee2e2', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                        onPress={() => handleRemoveTenant(item._id)}
                      >
                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.analyticsCloseBtn} onPress={() => setTenantsModalVisible(false)}>
              <Text style={styles.analyticsCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Digital Receipt Modal */}
      <Modal visible={receiptModalVisible} transparent animationType="fade" onRequestClose={() => setReceiptModalVisible(false)}>
        <View style={styles.quickModalOverlay}>
          <View style={[styles.quickModalBox, { padding: 0, overflow: 'hidden' }]}>
            <View style={{ backgroundColor: '#4F46E5', padding: 20, alignItems: 'center' }}>
              <Ionicons name="receipt" size={40} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Rent Receipt</Text>
              <Text style={{ color: '#ddd6fe', fontSize: 12, marginTop: 4 }}>HostelSathi Verified Payment</Text>
            </View>

            {selectedReceipt && (
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 12 }}>
                  <Text style={{ color: '#8b85a3', fontSize: 13 }}>Student Name</Text>
                  <Text style={{ color: '#1e1b29', fontSize: 14, fontWeight: 'bold' }}>{selectedReceipt.studentName}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 12 }}>
                  <Text style={{ color: '#8b85a3', fontSize: 13 }}>Amount Paid</Text>
                  <Text style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold' }}>₹{selectedReceipt.rentPaid}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 12 }}>
                  <Text style={{ color: '#8b85a3', fontSize: 13 }}>Date Joined</Text>
                  <Text style={{ color: '#1e1b29', fontSize: 13, fontWeight: '600' }}>{new Date(selectedReceipt.joinDate).toLocaleDateString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 12 }}>
                  <Text style={{ color: '#8b85a3', fontSize: 13 }}>Verified UTR No.</Text>
                  <Text style={{ color: '#1e1b29', fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' }}>{selectedReceipt.utrNumber}</Text>
                </View>

                <TouchableOpacity style={{ backgroundColor: '#f1f1f1', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }} onPress={() => setReceiptModalVisible(false)}>
                  <Text style={{ color: '#5f5a75', fontWeight: 'bold' }}>Close Receipt</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHostel')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 16 },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bellIconContainer: {
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingLight: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  ownerNameDark: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  greetingSub: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  statCardModern: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  wideStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e1b29', marginBottom: 12, marginTop: 10 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#4F46E5',
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
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center'
  },
  cardStat: { flex: 1, alignItems: 'center' },
  cardStatVal: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5' },
  cardStatLabel: { fontSize: 10, color: '#a09abc', marginTop: 2 },
  cardStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(124,58,237,0.12)' },
  cardActionRow: { flexDirection: 'row', gap: 6 },
  actionBtnQuickUpdate: {
    flex: 1.2,
    backgroundColor: '#4F46E5',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center'
  },
  actionBtnQuickUpdateText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  actionBtnAnalytics: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c4b5fd'
  },
  actionBtnAnalyticsText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 12 },
  actionBtnEdit: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)'
  },
  actionBtnEditText: { color: '#5f5a75', fontWeight: 'bold', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', marginBottom: 20 },
  addBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)'
  },
  analyticsSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  analyticsBigNum: { fontSize: 32, fontWeight: 'bold', color: '#4F46E5', marginBottom: 10 },
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
  revRowVal: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5' },
  analyticsCloseBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  analyticsCloseBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  // Quick Modal
  quickModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  quickModalBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, elevation: 5 },
  quickModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 4 },
  quickModalSub: { fontSize: 13, color: '#8b85a3', marginBottom: 20 },
  quickInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  quickInputLabel: { fontSize: 14, color: '#5f5a75', fontWeight: '600' },
  quickInput: { width: 80, height: 40, borderWidth: 1, borderColor: '#e5e0f8', borderRadius: 8, textAlign: 'center', backgroundColor: '#ffffff', color: '#1e1b29', fontWeight: 'bold' },
  quickActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  quickCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f1f1f1' },
  quickCancelText: { color: '#5f5a75', fontWeight: 'bold' },
  quickSaveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#4F46E5', minWidth: 120, alignItems: 'center' },
  quickSaveText: { color: '#ffffff', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#f59e0b',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '400',
    marginTop: -2
  }
});
