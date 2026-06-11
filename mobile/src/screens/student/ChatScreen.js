import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { loadMessages, appendMessage, receiveMessage, setActiveConversation, setChatLoading } from '../../redux/chatSlice';
import { initSocket, joinChatRoom, sendSocketMessage, emitTyping, getSocket } from '../../utils/socket';

const API_BASE = 'http://10.0.2.2:5000/api';

export default function ChatScreen({ route, navigation }) {
  const { hostelId, hostelName, ownerId, ownerName } = route.params;
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { conversations } = useSelector(state => state.chat);

  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messages = conversations[hostelId] || [];
  const receiverId = user.role === 'student' ? ownerId : route.params.studentId;
  const receiverName = user.role === 'student' ? ownerName : route.params.studentName;

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({
      title: `Chat — ${hostelName}`,
      headerStyle: { backgroundColor: '#ffffff' },
      headerTintColor: '#7c3aed'
    });
  }, [hostelName]);

  // Set active conversation in store
  useEffect(() => {
    dispatch(setActiveConversation(hostelId));
    return () => dispatch(setActiveConversation(null));
  }, [hostelId]);

  // Fetch existing chat history
  useEffect(() => {
    fetchMessages();
    setupSocket();
  }, [hostelId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/messages/${hostelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        dispatch(loadMessages({ hostelId, messages: res.data.messages }));
      }
    } catch (err) {
      console.error('Fetch messages error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = useCallback(() => {
    const socket = initSocket(user.id || user._id);
    joinChatRoom(hostelId, user.id || user._id);

    socket.on('receive_message', (data) => {
      if (data.hostelId === hostelId || data.hostel === hostelId) {
        dispatch(receiveMessage({ hostelId, message: data }));
        scrollToBottom();
      }
    });

    socket.on('message_sent', (message) => {
      dispatch(appendMessage({ hostelId, message }));
      scrollToBottom();
    });

    socket.on('user_typing', ({ userId, isTyping: typing }) => {
      if (userId !== (user.id || user._id)) {
        setOtherTyping(typing);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('user_typing');
    };
  }, [hostelId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content || !receiverId) return;

    setMessageText('');

    const userId = user.id || user._id;
    const messageData = {
      hostelId,
      senderId: userId,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      content
    };

    // Try socket first, fallback to REST
    const sent = sendSocketMessage(messageData);
    if (!sent) {
      // REST fallback
      try {
        const res = await axios.post(`${API_BASE}/messages`, {
          hostelId,
          receiverId,
          content
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          dispatch(appendMessage({ hostelId, message: res.data.message }));
          scrollToBottom();
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setMessageText(content); // restore
      }
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);
    if (receiverId) {
      const userId = user.id || user._id;
      emitTyping(hostelId, userId, receiverId, text.length > 0);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(hostelId, userId, receiverId, false);
      }, 2000);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === (user.id || user._id) || item.senderName === user.name;
    const time = new Date(item.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowOther]}>
        {!isMine && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{(item.senderName || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {!isMine && (
            <Text style={styles.senderLabel}>{item.senderName}</Text>
          )}
          <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
            {item.content}
          </Text>
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, isMine ? { color: 'rgba(255,255,255,0.65)' } : { color: '#a09abc' }]}>
              {time}
            </Text>
            {isMine && (
              <Text style={styles.readReceipt}>{item.read ? '✓✓' : '✓'}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <View style={styles.chatAvatar}>
          <Text style={styles.chatAvatarText}>{(receiverName || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.chatHeaderName}>{receiverName || 'Hostel Owner'}</Text>
          <Text style={styles.chatHeaderSub}>{hostelName}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading chat history...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || index.toString()}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatIcon}>💬</Text>
                <Text style={styles.emptyChatText}>Start the conversation!</Text>
                <Text style={styles.emptyChatSub}>
                  Ask about availability, pricing, or schedule a visit.
                </Text>
              </View>
            }
            onContentSizeChange={scrollToBottom}
          />

          {/* Typing indicator */}
          {otherTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{receiverName || 'Owner'} is typing...</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#a09abc"
              value={messageText}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !messageText.trim() ? styles.sendBtnDisabled : null]}
              onPress={handleSend}
              disabled={!messageText.trim()}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f3fb'
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.1)',
    gap: 12
  },
  chatAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29'
  },
  chatHeaderSub: {
    fontSize: 12,
    color: '#8b85a3',
    marginTop: 1
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    color: '#8b85a3',
    fontSize: 14
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8
  },
  emptyChat: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32
  },
  emptyChatIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 8
  },
  emptyChatSub: {
    fontSize: 14,
    color: '#8b85a3',
    textAlign: 'center',
    lineHeight: 20
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end'
  },
  msgRowMine: {
    justifyContent: 'flex-end'
  },
  msgRowOther: {
    justifyContent: 'flex-start'
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9e5f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8
  },
  bubbleMine: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)'
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  bubbleTextMine: {
    color: '#ffffff'
  },
  bubbleTextOther: {
    color: '#1e1b29'
  },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4
  },
  msgTime: {
    fontSize: 10
  },
  readReceipt: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)'
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8
  },
  typingText: {
    fontSize: 12,
    color: '#8b85a3',
    fontStyle: 'italic'
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b85a3'
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f6fc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e1b29',
    maxHeight: 100
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnDisabled: {
    backgroundColor: '#d1c7f0'
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
