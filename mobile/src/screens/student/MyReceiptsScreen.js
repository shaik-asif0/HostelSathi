import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MyReceiptsScreen({ navigation }) {
  const { token } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await apiClient.get(`/payments/me`);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderReceiptCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.typeBadge}>
          {item.type === 'rent' ? 'Rent Payment' : item.type === 'deposit' ? 'Deposit' : 'Other'}
        </Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount Paid:</Text>
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Transaction ID:</Text>
        <Text style={styles.value}>{item.razorpayPaymentId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Hostel:</Text>
        <Text style={styles.value}>{item.hostel?.name || 'Unknown'}</Text>
      </View>

      {/* In a real app, this button could open a PDF generator or a detailed view */}
      <TouchableOpacity style={styles.downloadBtn}>
        <Ionicons name="download-outline" size={14} color="#4b5563" style={{ marginRight: 6 }} />
        <Text style={styles.downloadBtnText}>Download Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {payments.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={60} color="#8b85a3" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>No Receipts Yet</Text>
          <Text style={styles.subtitle}>You haven't made any successful payments.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={renderReceiptCard}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8b85a3' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2dff0', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { backgroundColor: '#EEF2FF', color: '#6d28d9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  date: { fontSize: 12, color: '#8b85a3' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: '#5f5a75' },
  value: { fontSize: 13, color: '#1e1b29', fontWeight: '500' },
  amount: { fontSize: 16, color: '#10b981', fontWeight: 'bold' },
  downloadBtn: { flexDirection: 'row', marginTop: 12, paddingVertical: 10, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  downloadBtnText: { color: '#4b5563', fontSize: 13, fontWeight: 'bold' }
});
