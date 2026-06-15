import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, 
  TouchableOpacity, Image, StatusBar 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const INBOX_DATA = [
  {
    id: '1',
    name: 'Rahul Kumar',
    lastMessage: 'Hi, I want to visit tomorrow',
    time: '2 min ago',
    unreadCount: 1,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Anjali Sharma',
    lastMessage: 'Thanks for the information',
    time: '1 hr ago',
    unreadCount: 0,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    name: 'Vikram Reddy',
    lastMessage: 'Is food included in rent?',
    time: '3 hr ago',
    unreadCount: 0,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: '4',
    name: 'Sneha Patil',
    lastMessage: 'Can I get room photos?',
    time: '5 hr ago',
    unreadCount: 0,
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  {
    id: '5',
    name: 'Arjun Mehta',
    lastMessage: 'Please share location',
    time: '1 day ago',
    unreadCount: 0,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  }
];

export default function ChatInboxScreen({ navigation }) {

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => navigation.navigate('Chat', { ownerName: item.name, hostelId: `mock_${item.id}` })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.timeText, item.unreadCount > 0 && { color: '#4F46E5', fontWeight: 'bold' }]}>
          {item.time}
        </Text>
        {item.unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        ) : (
          <View style={{ height: 20 }} /> // Placeholder to maintain spacing
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
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

      {/* List */}
      <FlatList 
        data={INBOX_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

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
  }
});
