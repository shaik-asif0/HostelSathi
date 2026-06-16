import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { markAllRead, addNotification } from '../../redux/notificationSlice';

export default function NotificationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { notifications } = useSelector(state => state.notifications);

  // Initialize with Student mock data if empty (for demo purposes)
  useEffect(() => {
    if (notifications.length === 0) {
      const studentInitialData = [
        {
          _id: '1',
          icon: 'home-outline',
          iconBg: '#eff6ff',
          iconColor: '#3b82f6',
          title: 'Rent Reminder',
          subtitle: 'Your rent for Room 204 is due in 3 days.',
          time: '2 min ago',
          read: false
        },
        {
          _id: '2',
          icon: 'people-outline',
          iconBg: '#ecfdf5',
          iconColor: '#10b981',
          title: 'New Roommate Match',
          subtitle: 'Karthik Reddy matches your JNTU preference.',
          time: '15 min ago',
          read: false
        },
        {
          _id: '3',
          icon: 'receipt-outline',
          iconBg: '#fdf2f8',
          iconColor: '#e11d48',
          title: 'Receipt Generated',
          subtitle: 'Your ₹1 payment receipt is now available.',
          time: '1 hr ago',
          read: true
        },
        {
          _id: '4',
          icon: 'bed-outline',
          iconBg: '#fff7ed',
          iconColor: '#ea580c',
          title: 'Visit Confirmed',
          subtitle: 'Your visit to Metro View PG is confirmed.',
          time: '2 hrs ago',
          read: true
        }
      ];
      
      // Dispatch in reverse order to simulate adding them chronologically
      studentInitialData.reverse().forEach(notif => {
        dispatch(addNotification(notif));
      });
    }
  }, [dispatch, notifications.length]);

  const renderItem = ({ item }) => (
    <View style={[styles.notificationItem, item.read ? { opacity: 0.6 } : {}]}>
      <View style={[styles.iconBox, { backgroundColor: item.iconBg || '#f3f4f6' }]}>
        <Ionicons name={item.icon || 'notifications'} size={22} color={item.iconColor || '#6b7280'} />
      </View>
      <View style={styles.textContent}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Action */}
      <View style={styles.bottomFooter}>
        <TouchableOpacity style={styles.markReadBtn} onPress={() => dispatch(markAllRead())}>
          <Text style={styles.markReadBtnText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb'
  },
  backBtn: {
    paddingRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  readAllBtn: {
    paddingLeft: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: '#6b7280',
  },
  timeText: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  bottomFooter: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  markReadBtn: {
    backgroundColor: '#f5f3ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  markReadBtnText: {
    color: '#6d28d9',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
