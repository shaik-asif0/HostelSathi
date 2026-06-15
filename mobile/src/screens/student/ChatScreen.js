import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import { initSocket } from '../../utils/socket';

export default function ChatScreen({ route, navigation }) {
  // Params passed from navigation
  const { hostelId, hostelName, ownerId, ownerName } = route.params;
  const { user } = useSelector(state => state.auth);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef();

  useEffect(() => {
    // Set dynamic header title
    navigation.setOptions({ title: ownerName || 'Chat' });

    fetchMessages();

    const userId = user._id || user.id;
    const socket = initSocket(userId);
    socket.emit('join_chat', { hostelId, userId });

    // Listeners
    socket.on('receive_message', handleIncomingMessage);
    socket.on('message_sent', handleIncomingMessage); // Local echo from server

    return () => {
      socket.off('receive_message', handleIncomingMessage);
      socket.off('message_sent', handleIncomingMessage);
    };
  }, []);

  const handleIncomingMessage = (msg) => {
    // Only accept messages for this chat
    if (msg.hostel === hostelId) {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const fetchMessages = async () => {
    try {
      const isOwner = user.role === 'owner';
      const studentId = isOwner ? ownerId : undefined;
      // If owner, the ownerId passed is actually the student's ID!

      const endpoint = studentId
        ? `/messages/${hostelId}/${studentId}`
        : `/messages/${hostelId}`;

      const res = await apiClient.get(endpoint);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const content = inputText.trim();
    setInputText('');

    // Send via REST API (which triggers the socket emission internally, or we can emit directly)
    try {
      const res = await apiClient.post('/messages', {
        hostelId,
        receiverId: ownerId,
        content
      });
      if (res.data.success) {
        // We could manually append, but the server will emit 'message_sent' / 'receive_message'
        handleIncomingMessage(res.data.message);
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === (user._id || user.id);
    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgWrapperRight : styles.msgWrapperLeft]}>
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
          <Text style={[styles.msgText, isMe ? styles.msgTextRight : styles.msgTextLeft]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.hostelBanner}>
            <Text style={styles.hostelBannerText}>🏠 {hostelName}</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  hostelBanner: { backgroundColor: '#EEF2FF', paddingVertical: 6, alignItems: 'center' },
  hostelBannerText: { fontSize: 12, color: '#312E81', fontWeight: 'bold' },
  listContainer: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  msgWrapper: { marginBottom: 16, maxWidth: '80%' },
  msgWrapperLeft: { alignSelf: 'flex-start' },
  msgWrapperRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  msgBubbleLeft: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f1f1' },
  msgBubbleRight: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 20 },
  msgTextLeft: { color: '#1e1b29' },
  msgTextRight: { color: '#fff' },
  timeText: { fontSize: 10, color: '#a09abc', marginTop: 4, marginHorizontal: 4 },
  inputBox: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f1f1f1', alignItems: 'center'
  },
  input: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    maxHeight: 100, color: '#1e1b29'
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10
  },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 2 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
