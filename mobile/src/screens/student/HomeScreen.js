import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  SafeAreaView,
  Modal,
  Linking,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostelsStart,
  fetchHostelsSuccess,
  fetchHostelsFailure,
} from "../../redux/hostelSlice";
import apiClient from "../../api/apiClient";
import Ionicons from "react-native-vector-icons/Ionicons";

const FEATURES = [
  { label: "Pay & Scan", icon: "qr-code-outline", bgColor: "#e0f2fe", iconColor: "#3b82f6", id: "pay_scan" },
  { label: "Nearby", icon: "location-outline", bgColor: "#fce7f3", iconColor: "#ec4899", id: "nearby" },
  { label: "Receipt", icon: "receipt-outline", bgColor: "#f3e8ff", iconColor: "#a855f7", id: "receipt" },
  { label: "Support", icon: "headset-outline", bgColor: "#fef3c7", iconColor: "#f59e0b", id: "support" },
  { label: "Due", icon: "wallet-outline", bgColor: "#dcfce7", iconColor: "#22c55e", id: "my_room" },
];

// Hardcoded MOCK_HOSTELS removed. We now use Redux store mock data.

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { hostels, savedHostels, loading } = useSelector((state) => state.hostels);
  const { token, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    { _id: '1', sender: 'ai', text: 'Hello! 👋\nHow can I help you find your perfect hostel?' }
  ]);
  const [aiInputText, setAiInputText] = useState('');

const EXPENSE_CATEGORIES = [
  { name: 'Food', color: '#10b981', icon: 'fast-food' },
  { name: 'Travel', color: '#f59e0b', icon: 'car' },
  { name: 'Rent', color: '#3b82f6', icon: 'home' },
  { name: 'Shopping', color: '#ec4899', icon: 'cart' },
  { name: 'Medical', color: '#ef4444', icon: 'medkit' },
  { name: 'Other', color: '#8b5cf6', icon: 'cash' },
];

  // Expense State
  const [expenses, setExpenses] = useState([]);
  const [newExpenseAmt, setNewExpenseAmt] = useState('');
  const [expenseMonth, setExpenseMonth] = useState('May 2024');
  const [newExpenseCat, setNewExpenseCat] = useState(EXPENSE_CATEGORIES[0]);

  // Emergency SOS Handlers
  const handleSOSCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert("Action Unavailable", "Your device does not support making phone calls directly from the app. Please dial " + number + " manually.");
    });
  };

  const handleSOSLocation = () => {
    const message = "EMERGENCY! I need immediate help. My current live location is: https://maps.google.com/?q=17.385044,78.486671 (Demo Coord)";
    const url = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Action Unavailable", "Could not open the messaging app. Please text your emergency contacts manually.");
    });
  };

  useEffect(() => {
    fetchFeatured();
    fetchRecommended();
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem('userExpenses');
      if (stored) setExpenses(JSON.parse(stored));
    } catch (e) { console.log(e); }
  };

  const fetchFeatured = () => {
    dispatch(fetchHostelsStart());
    apiClient
      .get("/hostels")
      .then((res) => dispatch(fetchHostelsSuccess(res.data.hostels || [])))
      .catch((err) => dispatch(fetchHostelsFailure(err.message)));
  };

  const fetchRecommended = async () => {
    try {
      setRecLoading(true);
      const res = await apiClient.get("/hostels/recommended");
      if (res.data.success) setRecommended(res.data.hostels);
    } catch (err) {
      console.error("Recommendations error:", err.message);
    } finally {
      setRecLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchFeatured(), fetchRecommended()]).finally(() =>
      setRefreshing(false),
    );
  }, []);

  const handleAiSend = () => {
    if (!aiInputText.trim()) return;
    const text = aiInputText.trim();
    setAiMessages(prev => [...prev, { _id: Date.now().toString(), sender: 'me', text }]);
    setAiInputText('');
    setTimeout(() => {
      setAiMessages(prev => [...prev, { _id: (Date.now() + 1).toString(), sender: 'ai', text: `I am a simulated AI. I see you said: "${text}". Here are some mock recommendations...` }]);
    }, 800);
  };

  const handleAddExpense = async () => {
    const amt = parseInt(newExpenseAmt);
    if (!amt) return Alert.alert('Error', 'Please enter a valid amount');
    const newExp = { 
      id: Date.now().toString(), 
      category: newExpenseCat.name, 
      amount: amt, 
      color: newExpenseCat.color, 
      icon: newExpenseCat.icon 
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    setNewExpenseAmt('');
    try { await AsyncStorage.setItem('userExpenses', JSON.stringify(updated)); } catch (e) {}
  };

  const handleDeleteExpense = async (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    try { await AsyncStorage.setItem('userExpenses', JSON.stringify(updated)); } catch (e) {}
  };

  const handleFeaturePress = (id) => {
    switch(id) {
      case 'pay_scan':
        navigation.navigate("ScanAndPay");
        break;
      case 'nearby':
        navigation.navigate("Search");
        break;
      case 'receipt':
        navigation.navigate("MyReceipts");
        break;
      case 'support':
        Linking.openURL("tel:1800123456").catch(() => Alert.alert("Error", "Could not open dialer."));
        break;
      case 'my_room':
        navigation.navigate("DueManagement");
        break;
    }
  };

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  // Group expenses by category for chart
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  const chartData = Object.values(categoryTotals);
  const chartLabels = Object.keys(categoryTotals);
  const chartColors = chartLabels.map(label => expenses.find(e => e.category === label)?.color || '#9ca3af');
  const chartUrl = `https://quickchart.io/chart?c={type:'doughnut',data:{datasets:[{data:[${chartData.join(',')}],backgroundColor:[${chartColors.map(c => `'%23${c.replace('#', '')}'`).join(',')}],borderWidth:0}]},options:{plugins:{legend:{display:false}},cutoutPercentage:65}}&w=250&h=250`;

  const getMinRent = (h) => {
    if (!h.rent) return 0;
    const prices = [h.rent.single, h.rent.sharing2, h.rent.sharing3].filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const displayHostels = hostels;
  const displayRecommended = recommended.length > 0 ? recommended : hostels.slice(1, 3);

  const renderFeaturedCard = ({ item }) => {
    const minRent = getMinRent(item);
    const originalRent = minRent + 1000; // Mocking original rent for UI
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => navigation.navigate("HostelDetail", { hostelId: item._id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardImagePlaceholder}>
          <Image
            source={{
              uri: item.photos && item.photos.length > 0
                ? item.photos[0]
                : "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80",
            }}
            style={styles.cardCoverImage}
          />
          <TouchableOpacity 
            style={styles.heartBtn} 
            onPress={() => dispatch({ type: 'hostels/toggleSaveHostel', payload: item._id })}
          >
            <Ionicons 
              name={savedHostels.includes(item._id) ? "heart" : "heart-outline"} 
              size={20} 
              color={savedHostels.includes(item._id) ? "#ef4444" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.originalPrice}>
            ₹{originalRent.toLocaleString("en-IN")}/mo
          </Text>
          <Text style={styles.discountedPrice}>
            ₹{minRent.toLocaleString("en-IN")}/mo
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
      >
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#4F46E5" />
            <Text style={styles.locationText}>Hyderabad, Telangana</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setSosModalVisible(true)} style={styles.sosHeaderBtn}>
              <Text style={styles.sosHeaderText}>SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate("Notifications")}>
              <View style={styles.notifIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#6366f1" />
                <View style={styles.starBadge}>
                   <Ionicons name="star" size={8} color="#f59e0b" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Hello, {user ? user.name.split(" ")[0] : "Asif"} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>Find your perfect hostel</Text>
        </View>

        <TouchableOpacity 
          style={styles.searchContainer} 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate("Search")}
        >
          <View pointerEvents="none" style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#8b85a3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hostels, area, college..."
              placeholderTextColor="#a09abc"
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesRow}>
            {FEATURES.slice(0, 3).map((feature, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryItem}
                onPress={() => handleFeaturePress(feature.id)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: feature.bgColor }]}>
                  <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>{feature.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.categoriesRowCentered}>
            {FEATURES.slice(3, 5).map((feature, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryItem}
                onPress={() => handleFeaturePress(feature.id)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: feature.bgColor }]}>
                  <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>{feature.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.roommateBanner} 
          onPress={() => navigation.navigate("RoommateFinder")}
          activeOpacity={0.8}
        >
          <View style={styles.roommateBannerContent}>
            <Text style={styles.roommateBannerTitle}>Looking for a Roommate?</Text>
            <Text style={styles.roommateBannerSubtitle}>Connect with verified students.</Text>
          </View>
          <View style={styles.roommateBannerIcon}>
            <Ionicons name="people-circle-outline" size={44} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.expenseBanner} 
          onPress={() => setExpenseModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.roommateBannerContent}>
            <Text style={styles.roommateBannerTitle}>Track Your Expenses</Text>
            <Text style={styles.roommateBannerSubtitle}>Manage your monthly budget easily.</Text>
          </View>
          <View style={styles.roommateBannerIcon}>
            <Ionicons name="pie-chart-outline" size={44} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Hostels</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <FlatList
              data={displayHostels.slice(0, 5)}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <FlatList
              data={displayRecommended.slice(0, 5)}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => "rec_" + item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating Action Button for AI Assistant */}
      <TouchableOpacity 
        style={styles.fabContainer} 
        onPress={() => setAiModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* AI Assistant Modal */}
      <Modal visible={aiModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.aiHeader}>
              <View style={styles.aiHeaderLeft}>
                <TouchableOpacity onPress={() => setAiModalVisible(false)} style={styles.aiBackBtn}>
                  <Ionicons name="arrow-back" size={24} color="#4b5563" />
                </TouchableOpacity>
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                  style={styles.aiAvatar} 
                />
                <View style={styles.aiHeaderTitleBox}>
                  <Text style={styles.aiHeaderTitle}>HostelSathi AI</Text>
                  <Text style={styles.aiHeaderSubtitle}>Online</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.aiIconBtn}>
                <Ionicons name="ellipsis-vertical" size={22} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* Chat List */}
            <ScrollView contentContainerStyle={styles.aiChatScroll}>
              {aiMessages.map(msg => (
                <View key={msg._id} style={[styles.aiMsgWrapper, msg.sender === 'ai' ? styles.aiMsgLeft : styles.aiMsgRight]}>
                  <View style={[styles.aiMsgBubble, msg.sender === 'ai' ? styles.aiBubbleLeft : styles.aiBubbleRight]}>
                    <Text style={msg.sender === 'ai' ? styles.aiMsgText : styles.aiMsgTextRight}>{msg.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input Box */}
            <View style={styles.aiInputContainer}>
              <View style={styles.aiInputWrapper}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#9ca3af"
                  value={aiInputText}
                  onChangeText={setAiInputText}
                />
                <TouchableOpacity style={styles.aiSendBtn} onPress={handleAiSend}>
                  <Ionicons name="send" size={16} color="#ffffff" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expense Tracker Modal */}
      <Modal visible={expenseModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseModalTitle}>Expense Tracker</Text>
              <TouchableOpacity onPress={() => setExpenseModalVisible(false)} style={styles.expenseCloseBtn}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.expenseScroll}>
              {/* Dropdown Mock */}
              <View style={styles.monthDropdown}>
                <Text style={styles.monthDropdownText}>This Month</Text>
                <Ionicons name="chevron-down" size={16} color="#1f2937" />
              </View>

              {/* Chart & Stats Section */}
              <View style={styles.chartSection}>
                <View style={styles.chartStatsLeft}>
                  <Text style={styles.totalExpensesLabel}>Total Expenses</Text>
                  <Text style={styles.totalExpensesValue}>₹{totalExpense.toLocaleString('en-IN')}</Text>
                  
                  <View style={styles.legendsContainer}>
                    {chartLabels.map((label, idx) => (
                      <View key={label} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: chartColors[idx] }]} />
                        <Text style={styles.legendLabel}>{label}</Text>
                        <Text style={styles.legendAmount}>₹{categoryTotals[label]}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.chartRight}>
                  {/* Dynamic Donut Chart Image generated by QuickChart */}
                  <Image 
                    source={{ uri: chartUrl }} 
                    style={styles.donutChartImage} 
                  />
                </View>
              </View>

              {/* Recent Transactions */}
              <Text style={styles.recentTxLabel}>Recent Transactions</Text>
              <View style={styles.txList}>
                {expenses.slice(0, 5).map(exp => (
                  <View key={exp.id} style={styles.txItem}>
                    <View style={[styles.txIconBox, { backgroundColor: exp.color + '20' }]}>
                      <Ionicons name={exp.icon || 'cash'} size={20} color={exp.color} />
                    </View>
                    <Text style={styles.txName}>{exp.category}</Text>
                    <Text style={styles.txAmount}>-₹{exp.amount}</Text>
                    <TouchableOpacity onPress={() => handleDeleteExpense(exp.id)} style={{ padding: 8 }}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add Expense Inputs */}
              <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Select Category</Text>
                <FlatList 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={EXPENSE_CATEGORIES}
                  keyExtractor={item => item.name}
                  contentContainerStyle={{ gap: 8 }}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={[
                        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 4 },
                        newExpenseCat.name === item.name && { backgroundColor: item.color + '15', borderColor: item.color }
                      ]}
                      onPress={() => setNewExpenseCat(item)}
                    >
                      <Ionicons name={item.icon} size={14} color={item.color} />
                      <Text style={{ fontSize: 13, color: newExpenseCat.name === item.name ? item.color : '#4b5563', fontWeight: '500' }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                
                <TextInput 
                  style={[styles.searchInput, { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, marginTop: 12 }]}
                  placeholder="Amount (₹)"
                  keyboardType="numeric"
                  value={newExpenseAmt}
                  onChangeText={setNewExpenseAmt}
                />
              </View>

              {/* Add Expense Button */}
              <TouchableOpacity style={[styles.addExpenseBtn, { marginTop: 16, marginHorizontal: 20 }]} onPress={handleAddExpense}>
                <Text style={styles.addExpenseText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SOS Emergency Modal */}
      <Modal visible={sosModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            
            <TouchableOpacity onPress={() => setSosModalVisible(false)} style={styles.sosCloseTop}>
              <Ionicons name="chevron-down" size={24} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.sosHeader}>
              <Text style={styles.sosTitle}>Emergency Help</Text>
              <Text style={styles.sosSubtitle}>
                <Text style={{ color: '#ef4444' }}>Tap any button</Text> in emergency
              </Text>
            </View>

            <View style={styles.sosGrid}>
              
              {/* Police Card */}
              <TouchableOpacity style={[styles.sosCard, { borderColor: '#fca5a5' }]} activeOpacity={0.7} onPress={() => handleSOSCall('100')}>
                <View style={[styles.sosIconCircle, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="shield-checkmark" size={28} color="#ef4444" />
                </View>
                <Text style={styles.sosCardTitle}>Police</Text>
                <Text style={[styles.sosCardSub, { color: '#ef4444' }]}>100</Text>
              </TouchableOpacity>

              {/* Ambulance Card */}
              <TouchableOpacity style={[styles.sosCard, { borderColor: '#bbf7d0' }]} activeOpacity={0.7} onPress={() => handleSOSCall('108')}>
                <View style={[styles.sosIconCircle, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="medkit" size={28} color="#22c55e" />
                </View>
                <Text style={styles.sosCardTitle}>Ambulance</Text>
                <Text style={[styles.sosCardSub, { color: '#22c55e' }]}>108</Text>
              </TouchableOpacity>

              {/* Parents Card */}
              <TouchableOpacity style={[styles.sosCard, { borderColor: '#fed7aa' }]} activeOpacity={0.7} onPress={() => handleSOSCall('1234567890')}>
                <View style={[styles.sosIconCircle, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="call" size={28} color="#f97316" />
                </View>
                <Text style={styles.sosCardTitle}>Call Parents</Text>
                <Text style={styles.sosCardSubGray}>Mom</Text>
              </TouchableOpacity>

              {/* Owner Card */}
              <TouchableOpacity style={[styles.sosCard, { borderColor: '#bfdbfe' }]} activeOpacity={0.7} onPress={() => handleSOSCall('9876543210')}>
                <View style={[styles.sosIconCircle, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="business" size={28} color="#3b82f6" />
                </View>
                <Text style={styles.sosCardTitle}>Hostel Owner</Text>
                <Text style={styles.sosCardSubGray}>Call</Text>
              </TouchableOpacity>

            </View>

            {/* Send Location Button */}
            <View style={styles.sosFooter}>
              <TouchableOpacity style={styles.sosLocationBtn} activeOpacity={0.8} onPress={handleSOSLocation}>
                <Ionicons name="location" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.sosLocationText}>Send My Location</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginLeft: 6,
  },
  notifBtn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  notifIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  starBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoriesRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  categoryItem: {
    alignItems: "center",
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: 260,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardImagePlaceholder: {
    height: 150,
    backgroundColor: "#f3f4f6",
  },
  cardCoverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: "#9ca3af",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  // AI Assistant Modal Styles
  fabContainer: {
    position: 'absolute',
    bottom: 30, // Increased to avoid bottom tab
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999, // Ensure it's on top of everything
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingTop: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBackBtn: {
    marginRight: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  aiHeaderTitleBox: {
    justifyContent: 'center',
  },
  aiHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiHeaderSubtitle: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  aiIconBtn: {
    padding: 4,
  },
  aiChatScroll: {
    padding: 16,
    gap: 16,
  },
  aiMsgWrapper: {
    maxWidth: '85%',
  },
  aiMsgLeft: {
    alignSelf: 'flex-start',
  },
  aiMsgRight: {
    alignSelf: 'flex-end',
  },
  aiMsgBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aiBubbleLeft: {
    backgroundColor: '#f5f3ff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  aiBubbleRight: {
    backgroundColor: '#5b21b6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMsgText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '400',
  },
  aiMsgTextRight: {
    fontSize: 15,
    lineHeight: 24,
    color: '#ffffff',
    fontWeight: '400',
  },
  aiHostelList: {
    marginTop: 12,
    gap: 6,
  },
  aiHostelItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '600',
  },
  aiHostelPrice: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  aiViewAllBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  aiViewAllText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  aiInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  aiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  aiInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
    minHeight: 40,
  },
  aiSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5b21b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  roommateBanner: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  roommateBannerContent: {
    flex: 1,
  },
  roommateBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  roommateBannerSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
  },
  roommateBannerIcon: {
    marginLeft: 16,
  },
  expenseBanner: {
    flexDirection: 'row',
    backgroundColor: '#0d9488',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // Expense Tracker Modal Styles
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  expenseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  expenseCloseBtn: {
    padding: 4,
  },
  expenseScroll: {
    paddingHorizontal: 20,
  },
  monthDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  monthDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  chartStatsLeft: {
    flex: 1,
  },
  totalExpensesLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalExpensesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  legendsContainer: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  chartRight: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutChartImage: {
    width: 130,
    height: 130,
  },
  recentTxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  txList: {
    gap: 16,
    marginBottom: 32,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  addExpenseBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  addExpenseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // SOS Emergency Styles
  sosHeaderBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  sosHeaderText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sosCloseTop: {
    padding: 20,
    alignSelf: 'flex-start',
  },
  sosHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sosTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sosSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  sosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 16,
  },
  sosCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  sosIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sosCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  sosCardSub: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sosCardSubGray: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  sosFooter: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 32,
  },
  sosLocationBtn: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosLocationText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
