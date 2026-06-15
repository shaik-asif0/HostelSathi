import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // We should also dispatch action to clear unread badge in Redux if needed, 
  // but for now, we just update local state and ping backend.

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'new_message': return '💬';
      case 'enquiry_update': return '📋';
      case 'payment_success': return '💰';
      case 'new_review': return '⭐';
      default: return '🔔';
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.read;
    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => {
          // If message, navigate to chat
          if (item.type === 'new_message' && item.data?.hostelId) {
            // For a complete flow, we'd navigate to Conversations or Chat
            navigation.navigate('Chats');
          }
        }}
      >
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{getIconForType(item.type)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.title, isUnread && styles.titleUnread]}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>You have no new notifications.</Text>
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
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f1f1'
  },
  backBtn: { paddingRight: 16 },
  backIcon: { fontSize: 24, color: '#1e1b29' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e1b29' },
  listContainer: { padding: 16, paddingBottom: 30 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 14,
    borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f1f1'
  },
  cardUnread: { backgroundColor: '#EEF2FF', borderColor: '#4F46E530' },
  iconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  icon: { fontSize: 20 },
  cardBody: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: '#1e1b29', marginBottom: 4 },
  titleUnread: { fontWeight: 'bold', color: '#4F46E5' },
  body: { fontSize: 13, color: '#5f5a75', marginBottom: 6 },
  timeText: { fontSize: 11, color: '#a09abc' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 5 },
  emptySub: { fontSize: 14, color: '#8b85a3' }
});
