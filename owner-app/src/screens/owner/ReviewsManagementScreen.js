import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_REVIEWS = [
  {
    id: '1',
    studentName: 'Rahul Kumar',
    timeAgo: '2 days ago',
    rating: 5.0,
    text: 'Best hostel I have ever stayed in. Food is amazing and management is very friendly.'
  },
  {
    id: '2',
    studentName: 'Anjali Sharma',
    timeAgo: '5 days ago',
    rating: 4.0,
    text: 'Good hostel. Clean rooms and good food.'
  },
  {
    id: '3',
    studentName: 'Vikram Reddy',
    timeAgo: '1 week ago',
    rating: 3.0,
    text: 'Average experience. Need to improve WiFi.'
  }
];

export default function ReviewsManagementScreen({ navigation }) {

  const handleReply = (studentName) => {
    Alert.prompt(
      `Reply to ${studentName}`,
      'Type your reply here:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Reply', onPress: (text) => {
            if(text) Alert.alert('Success', 'Your reply has been posted.');
          } 
        }
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#f59e0b" style={{ marginRight: 2 }} />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#f59e0b" style={{ marginRight: 2 }} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#d1d5db" style={{ marginRight: 2 }} />);
      }
    }
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Ionicons name="person-circle" size={48} color="#c7d2fe" />
        </View>
        <View style={styles.headerTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
          {renderStars(item.rating)}
        </View>
      </View>
      
      <Text style={styles.reviewText}>{item.text}</Text>
      
      <View style={styles.replyRow}>
        <TouchableOpacity style={styles.replyBtn} onPress={() => handleReply(item.studentName)}>
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>
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
          <Text style={styles.title}>Reviews</Text>
          <Text style={styles.subtitle}>Manage reviews & ratings</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={MOCK_REVIEWS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllBtnText}>View All Reviews</Text>
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
    paddingBottom: 16,
  },
  backBtn: { marginBottom: 16, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBox: {
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  replyRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  replyBtn: {
    backgroundColor: '#EEF2FF', // light purple
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replyBtnText: {
    color: '#4F46E5', // vibrant purple
    fontWeight: 'bold',
    fontSize: 13,
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  viewAllBtn: {
    backgroundColor: '#4F46E5', // vibrant purple
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
