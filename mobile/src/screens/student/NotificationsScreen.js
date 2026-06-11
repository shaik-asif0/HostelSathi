import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { notificationsAPI } from '../../api/apiClient';
import { setNotifications, markRead, markAllRead, removeNotification } from '../../redux/notificationSlice';

const NOTIF_ICONS = {
  new_message: '💬',
  new_enquiry: '📩',
  enquiry_update: '📋',
  new_hostel_nearby: '🏠',
  review: '⭐',
  general: '🔔'
};

export default function NotificationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  const { token } = useSelector(state => state.auth);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLocalLoading(true);
      const res = await notificationsAPI.getAll();
      if (res.data.success) {
        dispatch(setNotifications({
          notifications: res.data.notifications,
          unreadCount: res.data.unreadCount
        }));
      }
    } catch (err) {
      // Silently fail if not authenticated yet
      console.log('Notifications: not loaded (may not be logged in)');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      dispatch(markRead(id));
      await notificationsAPI.markRead(id);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      dispatch(markAllRead());
      await notificationsAPI.markAllRead();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    try {
      dispatch(removeNotification(id));
      await notificationsAPI.delete(id);
    } catch (err) {}
  };

  const handleNotifPress = (notif) => {
    if (!notif.read) handleMarkRead(notif._id);

    // Navigate based on type
    if (notif.type === 'new_message' && notif.data?.hostelId) {
      // Would navigate to ChatScreen — needs hostel info
    } else if (notif.data?.hostelId) {
      navigation.navigate('HostelDetail', { hostelId: notif.data.hostelId });
    }
  };

  const renderNotification = ({ item }) => {
    const icon = NOTIF_ICONS[item.type] || '🔔';
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => handleNotifPress(item)}
        onLongPress={() => {
          Alert.alert('Delete Notification', 'Remove this notification?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item._id) }
          ]);
        }}
      >
        <View style={styles.notifIcon}>
          <Text style={styles.notifIconText}>{icon}</Text>
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {localLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={localLoading} onRefresh={fetchNotifications} tintColor="#7c3aed" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>No notifications yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6fc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.1)'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b29'
  },
  headerSub: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginTop: 2
  },
  markAllBtn: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  markAllText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: 'bold'
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 16
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)',
    gap: 12
  },
  notifCardUnread: {
    borderColor: 'rgba(124,58,237,0.25)',
    backgroundColor: 'rgba(124,58,237,0.02)'
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0ecfd',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  notifIconText: {
    fontSize: 20
  },
  notifContent: {
    flex: 1
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  notifTitle: {
    fontSize: 14,
    color: '#5f5a75',
    fontWeight: '600',
    flex: 1
  },
  notifTitleUnread: {
    color: '#1e1b29',
    fontWeight: 'bold'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
    marginLeft: 8,
    marginTop: 3,
    flexShrink: 0
  },
  notifBody: {
    fontSize: 13,
    color: '#8b85a3',
    lineHeight: 18,
    marginBottom: 6
  },
  notifTime: {
    fontSize: 11,
    color: '#b0aac3',
    fontWeight: '500'
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 80
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 8
  },
  emptySub: {
    fontSize: 14,
    color: '#8b85a3'
  }
});
