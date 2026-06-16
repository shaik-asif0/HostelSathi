import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Proper May 2024 calendar structure (Starts on Wednesday)
const CALENDAR_GRID = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, null, null]
];

// Mock statuses for dates
const STATUS_MAP = {
  10: 'available',
  12: 'available',
  13: 'available',
  14: 'booked',
  20: 'maintenance',
  25: 'available',
  26: 'available',
};

export default function AvailabilityCalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(12);

  const getStatusStyles = (day) => {
    const status = STATUS_MAP[day];
    if (status === 'available') return { bg: '#d1fae5', text: '#10b981', border: '#10b981' };
    if (status === 'booked') return { bg: '#ede9fe', text: '#8b5cf6', border: '#8b5cf6' };
    if (status === 'maintenance') return { bg: '#fee2e2', text: '#ef4444', border: '#ef4444' };
    return { bg: 'transparent', text: '#1e1b29', border: 'transparent' };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability Calendar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color="#1e1b29" />
          </TouchableOpacity>
          <Text style={styles.monthText}>May 2024</Text>
          <TouchableOpacity style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={20} color="#1e1b29" />
          </TouchableOpacity>
        </View>

        {/* Days Header */}
        <View style={styles.daysHeader}>
          {DAYS_OF_WEEK.map(day => (
            <Text key={day} style={styles.dayHeaderText}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {CALENDAR_GRID.map((week, rowIndex) => (
            <View key={rowIndex} style={styles.weekRow}>
              {week.map((day, colIndex) => {
                if (!day) return <View key={colIndex} style={styles.dayCell} />;
                
                const { bg, text, border } = getStatusStyles(day);
                const isSelected = selectedDate === day;

                return (
                  <TouchableOpacity 
                    key={colIndex} 
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(day)}
                  >
                    <View style={[
                      styles.dayCircle, 
                      { backgroundColor: bg, borderColor: isSelected ? border : 'transparent' },
                      border !== 'transparent' && !isSelected && { borderWidth: 1, borderColor: border }
                    ]}>
                      <Text style={[styles.dayText, { color: text }]}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Maintenance</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Selected Date</Text>
            <Text style={styles.infoCardValue}>{selectedDate} May 2024</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Available Rooms</Text>
            <Text style={styles.infoCardValue}>
              {STATUS_MAP[selectedDate] === 'available' ? '3' : '0'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e1b29' },
  
  scrollContent: { paddingBottom: 40 },

  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  arrowBtn: { padding: 8 },
  monthText: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },

  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },

  calendarGrid: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },

  infoCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5', // vibrant purple
  },
});
