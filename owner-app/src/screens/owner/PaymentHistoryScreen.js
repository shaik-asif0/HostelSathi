import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_HISTORY = [
  {
    id: '1',
    title: 'Premium Plan',
    date: '12 May 2024',
    amount: '₹999',
    status: 'Success'
  },
  {
    id: '2',
    title: 'Featured Listing',
    date: '05 May 2024',
    amount: '₹499',
    status: 'Success'
  },
  {
    id: '3',
    title: 'Top Placement',
    date: '26 Apr 2024',
    amount: '₹299',
    status: 'Success'
  },
  {
    id: '4',
    title: 'Premium Plan',
    date: '12 Apr 2024',
    amount: '₹999',
    status: 'Success'
  },
  {
    id: '5',
    title: 'Banner Promotion',
    date: '01 Apr 2024',
    amount: '₹799',
    status: 'Success'
  }
];

export default function PaymentHistoryScreen({ navigation }) {

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.textCol}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      
      <Text style={styles.itemAmount}>{item.amount}</Text>
      
      <View style={styles.statusBadge}>
        <Text style={styles.statusBadgeText}>{item.status}</Text>
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
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.subtitle}>All your transactions</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.invoiceBtn}>
          <Text style={styles.invoiceBtnText}>View Invoices</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 24,
  },
  backBtn: { marginBottom: 16, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginRight: 16,
    width: 60,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#dcfce7', // light green
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    width: 76,
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#10b981', // solid green
    fontSize: 12,
    fontWeight: 'bold',
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  invoiceBtn: {
    backgroundColor: '#4F46E5', // vibrant purple
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  invoiceBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
