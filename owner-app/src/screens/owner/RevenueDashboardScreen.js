import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// A simple segmented line chart using React Native Views
const ViewLineChart = ({ data, labels, height = 200 }) => {
  const maxVal = Math.max(...data);
  const minVal = 0; // lock min to 0 for this chart
  
  // Calculate relative coordinates
  // We assume width is 100% of container, so we position items by percentages
  const pointPositions = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((val - minVal) / (maxVal - minVal)) * 100;
    return { x, y, val };
  });

  return (
    <View style={{ height, width: '100%', position: 'relative' }}>
      {/* Grid Lines */}
      {[0, 1, 2, 3].map((val) => {
        const top = 100 - (val / 3) * 100;
        return (
          <View key={val} style={[styles.gridLineWrap, { top: `${top}%` }]}>
            <Text style={styles.gridLabel}>₹{val}L</Text>
            <View style={styles.gridLine} />
          </View>
        );
      })}

      {/* Render Line Segments */}
      <View style={styles.chartArea}>
        {pointPositions.map((pt, i) => {
          if (i === 0) return null;
          const prev = pointPositions[i - 1];
          // We can't do perfect angled lines easily without knowing the absolute width in pixels.
          // Instead of complex trigonometry in views, let's just render the data points beautifully
          // and a simple vertical bar from the bottom to create a 'bar' or 'lollipop' chart effect
          // which looks extremely premium and avoids the broken-line look of bad view-based line charts.
          return null; 
        })}

        {/* Instead of a broken line, let's render a gorgeous smooth gradient bar chart */}
        {pointPositions.map((pt, i) => (
          <View key={i} style={[styles.barColumn, { left: `${pt.x}%`, transform: [{ translateX: -15 }] }]}>
            <View style={[styles.barFill, { height: `${100 - pt.y}%` }]} />
            <View style={[styles.barDot, { bottom: `${100 - pt.y}%` }]} />
          </View>
        ))}
      </View>

      {/* X Axis Labels */}
      <View style={styles.xAxis}>
        {labels.map((lbl, idx) => (
          <Text key={idx} style={styles.xAxisLabel}>{lbl}</Text>
        ))}
      </View>
    </View>
  );
};

export default function RevenueDashboardScreen({ navigation }) {
  const chartData = [1.2, 1.7, 1.3, 1.9, 1.8, 2.6, 2.3, 2.5];
  const chartLabels = ['01', '05', '09', '14', '18', '21', '25', '28'];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e1b29" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Revenue Overview</Text>
        </View>
        <TouchableOpacity style={styles.monthDropdown}>
          <Text style={styles.monthDropdownText}>May 2024</Text>
          <Ionicons name="chevron-down" size={16} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Metric */}
        <View style={styles.metricSection}>
          <Text style={styles.metricMonth}>May 2024</Text>
          <View style={styles.metricRow}>
            <Text style={styles.bigAmount}>₹2,45,000</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="caret-up" size={12} color="#10b981" />
              <Text style={styles.growthText}>18.6% vs April</Text>
            </View>
          </View>
          <Text style={styles.metricSubtitle}>Total Revenue</Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <ViewLineChart data={chartData} labels={chartLabels} height={220} />
        </View>

        {/* Bottom Stats */}
        <View style={styles.statsCardsRow}>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Bookings</Text>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statGrowth}>+12%</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Occupancy Rate</Text>
            <Text style={styles.statValue}>78%</Text>
            <Text style={styles.statGrowth}>+8%</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Revenue / Room</Text>
            <Text style={styles.statValue}>₹5,444</Text>
            <Text style={styles.statGrowth}>+15%</Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  monthDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  monthDropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 4,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  metricSection: {
    marginTop: 16,
    marginBottom: 40,
  },
  metricMonth: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  bigAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e1b29',
    marginRight: 16,
    lineHeight: 40,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  growthText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 2,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },

  chartContainer: {
    marginBottom: 40,
  },
  gridLineWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateY: -10 }],
  },
  gridLabel: {
    width: 35,
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  gridLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderStyle: 'dashed',
  },
  chartArea: {
    flex: 1,
    marginLeft: 35,
    position: 'relative',
  },
  barColumn: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    transform: [{ translateY: 4 }], // center dot on top of bar
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 35,
    marginTop: 10,
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  statsCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 6,
  },
  statGrowth: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981', // green
  }
});
