import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  TouchableOpacity, FlatList, Image, StatusBar, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_ROOMMATES = [
  {
    id: 'r1',
    name: 'Karthik Reddy',
    college: 'NRI Institute of Technology',
    course: 'B.Tech - CSE',
    budget: '₹5,000 - ₹7,000',
    description: 'Looking for roommate for 2 sharing room.',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: 'r2',
    name: 'Rahul Sharma',
    college: 'JNTU Hyderabad',
    course: 'B.Tech - ECE',
    budget: '₹4,000 - ₹6,000',
    description: 'Need a roommate for 3 sharing room. Veg only.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 'r3',
    name: 'Sneha Rao',
    college: 'Osmania University',
    course: 'MBA',
    budget: '₹6,000 - ₹8,000',
    description: 'Looking for a clean and quiet flatmate. Fully furnished PG preferred.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'r4',
    name: 'Arjun Das',
    college: 'CBIT',
    course: 'B.Tech - IT',
    budget: '₹3,000 - ₹5,000',
    description: 'Budget-friendly 4 sharing room required near college.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: 'r5',
    name: 'Priya Singh',
    college: 'JNTU Hyderabad',
    course: 'B.Arch',
    budget: '₹5,000 - ₹7,500',
    description: 'I study late at night. Looking for an accommodating roommate.',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  {
    id: 'r6',
    name: 'Vikram',
    college: 'NRI Institute of Technology',
    course: 'B.Tech - Mech',
    budget: '₹4,500 - ₹6,000',
    description: 'Looking for 2 more people to join a 3 BHK flat near campus.',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
  }
];

const FILTER_OPTIONS = ['All', 'JNTU', 'NRI', 'Budget < ₹6k'];

export default function RoommateFinderScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredRoommates = MOCK_ROOMMATES.filter(r => {
    // Search
    const searchMatch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.course.toLowerCase().includes(searchQuery.toLowerCase());
    if (!searchMatch) return false;

    // Filters
    if (activeFilter === 'All') return true;
    if (activeFilter === 'JNTU' && r.college.includes('JNTU')) return true;
    if (activeFilter === 'NRI' && r.college.includes('NRI')) return true;
    if (activeFilter === 'Budget < ₹6k') {
      if (r.budget.includes('3,000') || r.budget.includes('4,000') || r.budget.includes('4,500')) return true;
      return false;
    }
    return false;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.college}>{item.college}</Text>
        <Text style={styles.course}>{item.course}</Text>
        <Text style={styles.budget}>Budget: {item.budget}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <TouchableOpacity 
        style={styles.chatIconBtn}
        onPress={() => navigation.navigate('Chat', {
          hostelId: `roommate_${item.id}`, 
          ownerName: item.name,
        })}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Roommate</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Ionicons name="search-outline" size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by college, course..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={item => item}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={[styles.filterChipSolo, activeFilter === item && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterChipText, activeFilter === item && { color: '#fff' }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredRoommates}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search-outline" size={40} color="#d1d5db" />
            <Text style={{ marginTop: 10, color: '#6b7280' }}>No roommates found.</Text>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => Alert.alert("Post Ad", "Your roommate request has been posted successfully!")}
      >
        <Ionicons name="add" size={28} color="#fff" />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchIconBtn: {
    padding: 4,
  },
  searchBoxContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  filterChipSolo: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  college: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  course: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 4,
  },
  budget: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  chatIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
