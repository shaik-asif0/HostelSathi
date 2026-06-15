import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, Image, StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { appendMessage } from '../../redux/chatSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatScreen({ route, navigation }) {
  const { hostelId, hostelName, ownerName } = route.params || {};
  const [inputText, setInputText] = useState('');
  const { conversations } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const currentMessages = conversations[hostelId] || [];

  const handleSend = () => {
    if (!inputText.trim() || !hostelId) return;

    const newMsg = {
      _id: Date.now().toString(),
      sender: user._id || 'student', // 'me' maps to current user
      type: 'text',
      content: inputText.trim(),
      createdAt: new Date().toISOString()
    };

    dispatch(appendMessage({ hostelId, message: newMsg }));
    setInputText('');
  };

  const renderMessage = ({ item }) => {
    // If the sender matches the current logged in user, it's 'me'
    const isMe = item.sender === (user._id || 'student');
    
    if (item.type === 'image') {
      return (
        <View style={[styles.msgWrapper, isMe ? styles.msgWrapperRight : styles.msgWrapperLeft]}>
          <Image source={{ uri: item.content }} style={styles.msgImage} />
        </View>
      );
    }

    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgWrapperRight : styles.msgWrapperLeft]}>
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
          <Text style={[styles.msgText, isMe ? styles.msgTextRight : styles.msgTextLeft]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar} 
          />
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{hostelName || ownerName || 'Chat'}</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={22} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={currentMessages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={16} color="#ffffff" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  container: { 
    flex: 1 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitleBox: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },

  // List
  listContainer: { 
    padding: 16, 
    paddingTop: 24,
    gap: 16,
  },
  msgWrapper: { 
    maxWidth: '75%',
  },
  msgWrapperLeft: { 
    alignSelf: 'flex-start' 
  },
  msgWrapperRight: { 
    alignSelf: 'flex-end', 
  },
  msgBubble: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
  },
  msgBubbleLeft: { 
    backgroundColor: '#f5f3ff', 
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  msgBubbleRight: { 
    backgroundColor: '#5b21b6', 
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  msgText: { 
    fontSize: 15, 
    lineHeight: 22,
    fontWeight: '400',
  },
  msgTextLeft: { 
    color: '#374151' 
  },
  msgTextRight: { 
    color: '#ffffff' 
  },
  msgImage: {
    width: 260,
    height: 160,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },

  // Input
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5b21b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
