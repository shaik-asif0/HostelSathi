import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CompareScreen({ route, navigation }) {
  const { hostels = [] } = route.params;

  const getMinRent = (h) => {
    const prices = [h.rent.single, h.rent.sharing2, h.rent.sharing3].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getDistanceKm = (h) => {
    if (!h.location || !h.location.coordinates) return 0.5;
    const dLng = h.location.coordinates[0] - 78.3888;
    const dLat = h.location.coordinates[1] - 17.4950;
    return Math.round(Math.sqrt(dLng * dLng + dLat * dLat) * 111 * 10) / 10;
  };

  const minRents = hostels.map(getMinRent).filter(r => r > 0);
  const cheapestRent = minRents.length > 0 ? Math.min(...minRents) : 0;

  const ratings = hostels.map(h => h.rating || 0);
  const highestRating = Math.max(...ratings, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#4F46E5" />
          <Text style={styles.btnBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comparison Matrix</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Comparison grid wrapper */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>

            {/* Table Row: Name */}
            <View style={styles.row}>
              <View style={[styles.cellHeader, styles.cellLabel]}>
                <Text style={styles.labelText}>Hostel Name</Text>
              </View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cellHeader}>
                  <Text style={styles.hostelNameText}>{h.name}</Text>
                  <Text style={styles.genderText}>{h.gender.toUpperCase()} PG</Text>
                </View>
              ))}
            </View>

            {/* Table Row: Price starting */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>Starts from</Text>
              </View>
              {hostels.map(h => {
                const rent = getMinRent(h);
                const isCheapest = rent === cheapestRent;
                return (
                  <View key={h._id} style={[styles.cell, isCheapest ? styles.cellHighlight : null]}>
                    <Text style={[styles.valText, { color: '#4F46E5', fontWeight: 'bold' }]}>₹{rent}/mo</Text>
                    {isCheapest ? <Text style={styles.badgeText}>Cheapest</Text> : null}
                  </View>
                );
              })}
            </View>

            {/* Table Row: Price details */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>Single Rent</Text>
              </View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cell}>
                  <Text style={styles.valText}>{h.rent.single > 0 ? `₹${h.rent.single}` : 'N/A'}</Text>
                </View>
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>2-Sharing Rent</Text>
              </View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cell}>
                  <Text style={styles.valText}>{h.rent.sharing2 > 0 ? `₹${h.rent.sharing2}` : 'N/A'}</Text>
                </View>
              ))}
            </View>

            {/* Table Row: Food */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>Food Catering</Text>
              </View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cell}>
                  <Text style={styles.valText}>
                    {h.foodIncluded ? `Yes (${h.foodType})` : 'No Food'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Table Row: Rating */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>Rating Score</Text>
              </View>
              {hostels.map(h => {
                const rate = h.rating || 0;
                const isBest = rate === highestRating && rate > 0;
                return (
                  <View key={h._id} style={[styles.cell, isBest ? styles.cellHighlight : null]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
                      <Text style={[styles.valText, { color: '#f59e0b', fontWeight: 'bold' }]}>{rate || 'New'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Table Row: Distance */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}>
                <Text style={styles.labelText}>JNTU Distance</Text>
              </View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cell}>
                  <Text style={styles.valText}>{getDistanceKm(h)} km</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.cellLabel]}></View>
              {hostels.map(h => (
                <View key={h._id} style={styles.cell}>
                  <TouchableOpacity
                    style={styles.btnDetail}
                    onPress={() => navigation.navigate('HostelDetail', { hostelId: h._id })}
                  >
                    <Text style={styles.btnDetailText}>Open</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </View>
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.1)',
  },
  btnBack: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnBackText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
  },
  scrollContent: {
    padding: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.08)',
  },
  cellHeader: {
    width: 130,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.02)',
  },
  cell: {
    width: 130,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    width: 120,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
  },
  cellHighlight: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  labelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5f5a75',
  },
  hostelNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e1b29',
    textAlign: 'center',
  },
  genderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8b85a3',
    marginTop: 2,
  },
  valText: {
    fontSize: 12,
    color: '#2d2a3a',
    textAlign: 'center',
  },
  badgeText: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  btnDetail: {
    backgroundColor: '#4F46E5',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  btnDetailText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  }
});
