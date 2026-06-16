import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { payDue } from '../../redux/bookingsSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function DueManagementScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { dues } = useSelector(state => state.bookings);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // For simplicity, grab the first due if it exists
  const activeDue = dues.length > 0 ? dues[0] : null;

  const handlePayNow = () => {
    if (!activeDue) return;
    
    setLoading(true);
    // Simulate payment delay
    setTimeout(() => {
      dispatch(payDue(activeDue._id));
      setLoading(false);
      Alert.alert('Payment Successful! 🎉', `You have successfully paid ₹${activeDue.amount} for ${activeDue.month}.`);
      navigation.navigate('MyReceipts');
    }, 1500);
  };

  if (!activeDue) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={60} color="#10b981" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>All Caught Up!</Text>
          <Text style={styles.subtitle}>You have no pending dues.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MyReceipts')}>
            <Text style={styles.btnText}>View Receipts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Dues for {activeDue.month}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Hostel:</Text>
            <Text style={styles.value}>{activeDue.hostelName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent:</Text>
            <Text style={styles.value}>₹{activeDue.amount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Pending Amount:</Text>
            <Text style={[styles.value, { color: '#ef4444', fontWeight: 'bold' }]}>
              ₹{activeDue.amount}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(activeDue.dueDate).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.payBtn} onPress={handlePayNow} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay ₹{activeDue.amount}</Text>}
          </TouchableOpacity>
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
