import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ConversationsScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/messages/conversations/list');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const renderItem = ({ item }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => navigation.navigate('Chat', {
          hostelId: item._id,
          hostelName: item.hostelInfo?.name,
          ownerId: item.otherUserId, // For student, this is owner. For owner, this is student.
          ownerName: item.otherUserName
        })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.otherUserName || 'U').charAt(0)}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.nameText, isUnread && styles.boldText]} numberOfLines={1}>
              {item.otherUserName}
            </Text>
            <Text style={styles.timeText}>
              {item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleDateString() : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="home" size={10} color="#312E81" style={{ marginRight: 4 }} />
            <Text style={[styles.hostelText, { marginBottom: 0 }]} numberOfLines={1}>
              {item.hostelInfo?.name || 'HostelSathi Property'}
            </Text>
          </View>
          <View style={styles.msgRow}>
            <Text style={[styles.msgText, isUnread && styles.msgTextUnread]} numberOfLines={1}>
              {item.lastMessage?.sender === user._id ? 'You: ' : ''}
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
            {isUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Ionicons name="chatbubbles" size={20} color="#1e1b29" style={{ marginLeft: 6 }} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item._id}_${item.otherUserId}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="mail-open-outline" size={48} color="#8b85a3" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>
                {user?.role === 'owner'
                  ? 'Messages from students will appear here.'
                  : 'Contact owners to start a conversation.'}
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
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29' },
  listContainer: { padding: 16, paddingBottom: 30 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 14,
    borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f1f1'
  },
  cardUnread: { backgroundColor: '#EEF2FF', borderColor: '#4F46E530' },
  avatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 14
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  nameText: { fontSize: 16, fontWeight: '600', color: '#1e1b29', flex: 1 },
  boldText: { fontWeight: 'bold' },
  timeText: { fontSize: 11, color: '#8b85a3' },
  hostelText: { fontSize: 12, color: '#312E81', marginBottom: 4 },
  msgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgText: { fontSize: 13, color: '#8b85a3', flex: 1, paddingRight: 10 },
  msgTextUnread: { color: '#1e1b29', fontWeight: '500' },
  badge: {
    backgroundColor: '#4F46E5', borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 5 },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', paddingHorizontal: 40 }
});
