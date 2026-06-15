import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ConversationsScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { conversations: chatConversations, unreadCounts } = useSelector(state => state.chat);
  const { hostels } = useSelector(state => state.hostels);
  const [conversations, setConversations] = useState([]);
  const loading = false;
  const refreshing = false;

  useEffect(() => {
    // Transform raw messages into conversation summaries
    const convosList = Object.keys(chatConversations).map(hostelId => {
      const messages = chatConversations[hostelId];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const hostelInfo = hostels.find(h => h._id === hostelId) || { name: 'Unknown Hostel' };
      
      return {
        _id: hostelId, // Using hostelId as the conversation ID for simulation
        hostelInfo,
        otherUserId: 'owner1', 
        otherUserName: 'Hostel Owner',
        lastMessage,
        unreadCount: unreadCounts[hostelId] || 0
      };
    });
    // Sort by most recent
    convosList.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });
    setConversations(convosList);
  }, [chatConversations, hostels, unreadCounts]);

  const handleRefresh = useCallback(() => {}, []);

  const renderItem = ({ item }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => navigation.navigate('Chat', {
          hostelId: item._id,
          hostelName: item.hostelInfo?.name,
          ownerId: item.otherUserId,
          ownerName: item.otherUserName
        })}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} // Fallback high-quality avatar
          style={styles.avatar} 
        />
        
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.otherUserName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.sender === user._id ? 'You: ' : ''}
            {item.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.timeText, isUnread && { color: '#4F46E5', fontWeight: 'bold' }]}>
            {item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
          </Text>
          {isUnread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Titles */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Messages</Text>
        <Text style={styles.subTitle}>All conversations</Text>
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
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 4,
    marginLeft: -4,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Make room for FAB
    gap: 12,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 5 },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', paddingHorizontal: 40 }
});
