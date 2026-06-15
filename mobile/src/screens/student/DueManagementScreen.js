import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import RazorpayCheckout from 'react-native-razorpay';
import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function DueManagementScreen({ navigation }) {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    fetchTenantInfo();
  }, []);

  const fetchTenantInfo = async () => {
    try {
      const res = await apiClient.get(`/tenants/me`);
      if (res.data.success) {
        setTenantInfo(res.data.tenant);
      }
    } catch (err) {
      console.error(err);
      // It's possible the user is not a tenant yet
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!tenantInfo || tenantInfo.pendingAmount <= 0) return;

    try {
      setLoading(true);
      // 1. Create order on backend
      const { data } = await apiClient.post(`/payments/create-order`, {
        amount: tenantInfo.pendingAmount,
        type: 'rent',
        tenantId: tenantInfo._id,
        hostelId: tenantInfo.hostel
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: 'Monthly Rent Payment',
        image: 'https://hostelsathi.com/logo.png', // Optional
        currency: data.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: data.amount,
        name: 'HostelSathi',
        order_id: data.orderId,
        prefill: {
          email: user.email,
          contact: user.phone,
          name: user.name
        },
        theme: { color: '#4F46E5' }
      };

      RazorpayCheckout.open(options).then(async (paymentData) => {
        // 3. Verify Payment
        const verifyRes = await apiClient.post(`/payments/verify`, {
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          payment_record_id: data.paymentId
        });

        if (verifyRes.data.success) {
          Alert.alert('Success', 'Rent payment successful!');
          fetchTenantInfo();
          // Optionally navigate to Receipt
        }
      }).catch((error) => {
        console.log(error);
        Alert.alert('Payment Cancelled', 'You cancelled the payment or it failed.');
      });
    } catch (err) {
      console.error('Payment Error:', err);
      Alert.alert('Error', 'Could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!tenantInfo) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="home-outline" size={60} color="#8b85a3" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>No Active Tenancy</Text>
          <Text style={styles.subtitle}>You haven't joined a hostel yet.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('StudentTabs')}>
            <Text style={styles.btnText}>Explore Hostels</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Dues</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent:</Text>
            <Text style={styles.value}>₹{tenantInfo.rentAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paid Amount:</Text>
            <Text style={[styles.value, { color: '#10b981' }]}>₹{tenantInfo.paidAmount || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Pending Amount:</Text>
            <Text style={[styles.value, { color: '#ef4444', fontWeight: 'bold' }]}>
              ₹{tenantInfo.pendingAmount}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Late Fee:</Text>
            <Text style={styles.value}>₹{tenantInfo.lateFee || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {tenantInfo.dueDate ? new Date(tenantInfo.dueDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>

          {tenantInfo.pendingAmount > 0 ? (
            <TouchableOpacity style={styles.payBtn} onPress={handlePayNow} disabled={loading}>
              <Text style={styles.payBtnText}>Pay ₹{tenantInfo.pendingAmount + (tenantInfo.lateFee || 0)}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>✓ All Dues Cleared</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8b85a3', marginBottom: 24 },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: '#5f5a75' },
  value: { fontSize: 14, color: '#1e1b29', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e2dff0', marginVertical: 12 },
  payBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  paidBadge: { backgroundColor: '#d1fae5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  paidBadgeText: { color: '#059669', fontSize: 16, fontWeight: 'bold' }
});
