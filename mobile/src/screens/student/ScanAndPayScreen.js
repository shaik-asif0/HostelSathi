import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, Linking, PermissionsAndroid, Platform } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import apiClient from '../../api/apiClient';

export default function ScanAndPayScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'ios');

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraPermission();
    }
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'HostelSathi needs camera access to scan UPI QR codes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.warn(err);
    }
  };

  const onReadCode = (event) => {
    if (scanned) return;
    const qrString = event.nativeEvent.codeStringValue;
    setQrData(qrString);
    setScanned(true);
  };

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    let isUpi = false;
    let upiUrl = '';

    if (qrData && qrData.toLowerCase().startsWith('upi://pay')) {
      isUpi = true;
      upiUrl = qrData.includes('?') ? `${qrData}&am=${amount}&cu=INR` : `${qrData}?am=${amount}&cu=INR`;
    }

    try {
      if (isUpi) {
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
          await Linking.openURL(upiUrl);

          Alert.alert(
            "Payment Status",
            "Did your payment complete successfully on your UPI app?",
            [
              { text: "No", style: "cancel" },
              { text: "Yes, Generate Receipt", onPress: confirmAndGenerateReceipt }
            ]
          );
        } else {
          Alert.alert('UPI App Not Found', 'No UPI app installed to handle this payment. Falling back to mock payment.', [
            { text: "Cancel", style: "cancel" },
            { text: "Mock Payment", onPress: confirmAndGenerateReceipt }
          ]);
        }
      } else {
        // Mock payment flow for non-UPI QRs
        confirmAndGenerateReceipt();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to open payment app.');
    }
  };

  const confirmAndGenerateReceipt = async () => {
    try {
      setLoading(true);
      let parsedHostelId = '666a00000000000000000000'; // dummy fallback
      if (qrData && qrData.includes('hostelId=')) {
        try {
          parsedHostelId = qrData.split('hostelId=')[1].split('&')[0];
        } catch (e) { }
      }

      const res = await apiClient.post('/payments/scan-pay', {
        amount: Number(amount),
        hostelId: parsedHostelId,
        type: 'rent'
      });

      if (res.data.success) {
        Alert.alert('Success', 'Receipt Generated Successfully!', [
          { text: 'View Receipts', onPress: () => navigation.replace('MyReceipts') }
        ]);
      } else {
        Alert.alert('Error', res.data.error || 'Failed to generate receipt');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Payment Error', 'Network error or invalid request.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.overlayTextContainer}>
          <Text style={styles.overlayText}>Requesting Camera Permission...</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!scanned) {
    return (
      <View style={styles.container}>
        <Camera
          style={{ flex: 1 }}
          scanBarcode={true}
          onReadCode={onReadCode}
          showFrame={true}
          laserColor='red'
          frameColor='white'
        />
        <View style={styles.overlayTextContainer}>
          <Text style={styles.overlayText}>Scan Hostel QR to Pay</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.payContainer}>
      <Text style={styles.title}>Payment Details</Text>

      <View style={styles.qrInfoCard}>
        <Text style={styles.qrLabel}>Scanned Data:</Text>
        <Text style={styles.qrValue} numberOfLines={2}>{qrData}</Text>
      </View>

      <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
      <TextInput
        style={styles.amountInput}
        keyboardType="numeric"
        placeholder="e.g. 5000"
        value={amount}
        onChangeText={setAmount}
        autoFocus={true}
      />

      <TouchableOpacity
        style={[styles.payBtn, loading && styles.payBtnDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay ₹{amount || '0'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.rescanBtn} onPress={() => { setScanned(false); setAmount(''); }}>
        <Text style={styles.rescanText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  overlayTextContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center'
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  cancelBtn: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  payContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 30,
    textAlign: 'center'
  },
  qrInfoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2dff0'
  },
  qrLabel: {
    fontSize: 12,
    color: '#8b85a3',
    marginBottom: 4
  },
  qrValue: {
    fontSize: 14,
    color: '#1e1b29',
    fontWeight: '600'
  },
  inputLabel: {
    fontSize: 16,
    color: '#1e1b29',
    fontWeight: 'bold',
    marginBottom: 10
  },
  amountInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2dff0',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 30
  },
  payBtn: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15
  },
  payBtnDisabled: {
    opacity: 0.7
  },
  payBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  rescanBtn: {
    padding: 15,
    alignItems: 'center'
  },
  rescanText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600'
  }
});
