import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Linking, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LeadDetailsScreen({ route, navigation }) {
  // If no lead is passed via route, fallback to empty/default data
  const lead = route.params?.lead || {
    studentName: 'Rahul Kumar',
    studentCollege: 'JNTU Hyderabad',
    price: '₹8,000',
    sharing: '2 Sharing',
    moveInDate: '20 May 2024',
    phone: '+91 98765 43210',
    message: 'Looking for a good hostel near JNTU with WiFi and food.'
  };

  const handleCall = () => {
    if (!lead.phone) return Alert.alert('Error', 'No phone number available');
    Linking.openURL(`tel:${lead.phone.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsApp = () => {
    if (!lead.phone) return Alert.alert('Error', 'No phone number available');
    const text = encodeURIComponent(`Hi ${lead.studentName}, I'm reaching out regarding your hostel enquiry.`);
    Linking.openURL(`https://wa.me/${lead.phone.replace(/[^0-9+]/g, '')}?text=${text}`).catch(() => 
      Alert.alert('Error', 'WhatsApp could not be opened.')
    );
  };

  const handleMessage = () => {
    if (!lead.phone) return Alert.alert('Error', 'No phone number available');
    const text = encodeURIComponent(`Hi ${lead.studentName}, regarding your hostel enquiry...`);
    Linking.openURL(`sms:${lead.phone.replace(/[^0-9+]/g, '')}?body=${text}`);
  };

  const handleMarkContacted = () => {
    Alert.alert('Success', `${lead.studentName} marked as contacted!`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <Ionicons name="person-circle" size={56} color="#c7d2fe" />
          </View>
          <View>
            <Text style={styles.studentName}>{lead.studentName}</Text>
            <Text style={styles.studentCollege}>{lead.studentCollege}</Text>
          </View>
        </View>

        {/* Lead Details */}
        <Text style={styles.sectionTitle}>Lead Details</Text>
        <View style={styles.detailsList}>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValueBold}>
              {lead.price} <Text style={styles.detailValue}>/month</Text>
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room Type</Text>
            <Text style={styles.detailValueBold}>{lead.sharing}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preferred Move-in</Text>
            <Text style={styles.detailValueBold}>{lead.moveInDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Number</Text>
            <Text style={styles.detailValueBold}>{lead.phone}</Text>
          </View>

        </View>

        {/* Message */}
        <Text style={styles.sectionTitle}>Message</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{lead.message}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactedBtn} onPress={handleMarkContacted}>
          <Text style={styles.contactedBtnText}>Mark as Contacted</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16,
  },
  backBtn: { padding: 8, marginLeft: -8 },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarBox: {
    marginRight: 16,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 4,
  },
  studentCollege: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 16,
  },

  detailsList: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b29',
  },
  detailValue: {
    fontWeight: 'normal',
    color: '#1e1b29',
  },

  messageBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981', // green
    paddingVertical: 12,
    borderRadius: 8,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981', // green
    paddingVertical: 12,
    borderRadius: 8,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5', // vibrant purple
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  contactedBtn: {
    backgroundColor: '#EEF2FF', // light purple background
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactedBtnText: {
    color: '#4F46E5', // vibrant purple text
    fontWeight: 'bold',
    fontSize: 16,
  },
});
