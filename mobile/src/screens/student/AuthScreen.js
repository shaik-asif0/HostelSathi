import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';
import { authAPI } from '../../api/apiClient';

const TABS = { LOGIN: 'login', REGISTER: 'register', OTP: 'otp' };

export default function AuthScreen() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(TABS.LOGIN);
  const [role, setRole] = useState('student'); // 'student' | 'owner'
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Load saved login ID on mount
  React.useEffect(() => {
    AsyncStorage.getItem('savedLoginId').then(id => {
      if (id) setLoginId(id);
    });
  }, []);

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');

  // OTP state
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState('');

  const resetForm = () => {
    setLoginId(''); setLoginPassword('');
    setRegName(''); setRegPhone(''); setRegEmail('');
    setRegPassword(''); setRegCollege('');
    setOtpPhone(''); setOtpCode('');
    setOtpSent(false); setOtpFeedback('');
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ username: loginId.trim(), password: loginPassword });
      if (res.data.success) {
        // Save the login ID for next time (remember me)
        await AsyncStorage.setItem('savedLoginId', loginId.trim());
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        // Navigation happens automatically via AppNavigator based on auth state
      }
    } catch (err) {
      let msg = 'Login failed. Check your credentials.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.errors?.length > 0) {
        msg = err.response.data.errors.map(e => e.msg).join('\n');
      } else if (err.friendlyMessage) {
        msg = err.friendlyMessage;
      }
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role,
        college: role === 'student' ? regCollege.trim() : ''
      });
      if (res.data.success) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        Alert.alert('Welcome to HostelSathi! 🎉', `Account created as ${role === 'owner' ? 'Hostel Owner' : 'Student'}.`);
      }
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.errors?.length > 0) {
        msg = err.response.data.errors.map(e => e.msg).join('\n');
      } else if (err.friendlyMessage) {
        msg = err.friendlyMessage;
      }
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpPhone || otpPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(otpPhone);
      if (res.data.success) {
        setOtpSent(true);
        setOtpFeedback(`OTP sent! (Dev mode — code: ${res.data.code})`);
      }
    } catch (err) {
      Alert.alert('OTP Error', 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(otpPhone, otpCode);
      if (res.data.success) {
        if (res.data.registered) {
          dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        } else {
          // Verified but new user — move to register tab with phone pre-filled
          setRegPhone(otpPhone);
          setTab(TABS.REGISTER);
          Alert.alert('Phone Verified!', 'Please complete your registration details.');
        }
      }
    } catch (err) {
      Alert.alert('Wrong Code', 'Incorrect OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Logo & Hero */}
          <View style={styles.hero}>
            <Text style={styles.logoEmoji}>🏠</Text>
            <Text style={styles.logoText}>HostelSathi</Text>
            <Text style={styles.heroSub}>Hyderabad's #1 Student Hostel App</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            {/* Tab Switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, tab === TABS.LOGIN && styles.tabActive]}
                onPress={() => { setTab(TABS.LOGIN); resetForm(); }}
              >
                <Text style={[styles.tabText, tab === TABS.LOGIN && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === TABS.REGISTER && styles.tabActive]}
                onPress={() => { setTab(TABS.REGISTER); resetForm(); }}
              >
                <Text style={[styles.tabText, tab === TABS.REGISTER && styles.tabTextActive]}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === TABS.OTP && styles.tabActive]}
                onPress={() => { setTab(TABS.OTP); resetForm(); }}
              >
                <Text style={[styles.tabText, tab === TABS.OTP && styles.tabTextActive]}>OTP Login</Text>
              </TouchableOpacity>
            </View>

            {/* === LOGIN FORM === */}
            {tab === TABS.LOGIN && (
              <View>
                <Text style={styles.formLabel}>Email or Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or phone number"
                  placeholderTextColor="#a09abc"
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Text style={styles.formLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#a09abc"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>Sign In →</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.switchLink} onPress={() => { setTab(TABS.REGISTER); resetForm(); }}>
                  <Text style={styles.switchLinkText}>New user? <Text style={styles.switchLinkAccent}>Create account</Text></Text>
                </TouchableOpacity>
              </View>
            )}

            {/* === REGISTER FORM === */}
            {tab === TABS.REGISTER && (
              <View>
                {/* Role Picker */}
                <Text style={styles.formLabel}>I am a...</Text>
                <View style={styles.rolePicker}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
                    onPress={() => setRole('student')}
                  >
                    <Text style={styles.roleEmoji}>🎓</Text>
                    <Text style={[styles.roleBtnText, role === 'student' && styles.roleBtnTextActive]}>Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
                    onPress={() => setRole('owner')}
                  >
                    <Text style={styles.roleEmoji}>🏠</Text>
                    <Text style={[styles.roleBtnText, role === 'owner' && styles.roleBtnTextActive]}>Hostel Owner</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#a09abc"
                  value={regName}
                  onChangeText={setRegName}
                />
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#a09abc"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#a09abc"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.formLabel}>Password * (min. 6 chars)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#a09abc"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                />
                {role === 'student' && (
                  <>
                    <Text style={styles.formLabel}>College Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. JNTU Hyderabad"
                      placeholderTextColor="#a09abc"
                      value={regCollege}
                      onChangeText={setRegCollege}
                    />
                  </>
                )}

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>
                        {role === 'owner' ? '🏠 Register as Owner' : '🎓 Register as Student'}
                      </Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.switchLink} onPress={() => { setTab(TABS.LOGIN); resetForm(); }}>
                  <Text style={styles.switchLinkText}>Already have an account? <Text style={styles.switchLinkAccent}>Sign in</Text></Text>
                </TouchableOpacity>
              </View>
            )}

            {/* === OTP LOGIN FORM === */}
            {tab === TABS.OTP && (
              <View>
                {!otpSent ? (
                  <View>
                    <Text style={styles.formLabel}>Registered Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#a09abc"
                      value={otpPhone}
                      onChangeText={setOtpPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={handleSendOtp}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnPrimaryText}>Send OTP →</Text>
                      }
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    {otpFeedback ? (
                      <View style={styles.otpFeedbackBox}>
                        <Text style={styles.otpFeedbackText}>{otpFeedback}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.formLabel}>Enter 4-Digit OTP</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="• • • •"
                      placeholderTextColor="#a09abc"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnPrimaryText}>Verify & Sign In →</Text>
                      }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.switchLink} onPress={() => { setOtpSent(false); setOtpCode(''); setOtpFeedback(''); }}>
                      <Text style={styles.switchLinkText}>← Change phone number</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>Built with ❤️ in Hyderabad</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebfc' },
  container: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  logoEmoji: { fontSize: 52, marginBottom: 6 },
  logoText: { fontSize: 30, fontWeight: 'bold', color: '#5b21b6', letterSpacing: 0.5 },
  heroSub: { fontSize: 13, color: '#7c6ba8', marginTop: 4 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f0ebfc',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#7c6ba8' },
  tabTextActive: { color: '#ffffff' },
  formLabel: { fontSize: 11, fontWeight: '700', color: '#8b85a3', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: '#1e1b29',
    backgroundColor: '#faf8ff',
    marginBottom: 14
  },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 12, fontWeight: 'bold' },
  rolePicker: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.2)',
    backgroundColor: '#faf8ff'
  },
  roleBtnActive: { borderColor: '#7c3aed', backgroundColor: '#ede9fe' },
  roleEmoji: { fontSize: 24, marginBottom: 4 },
  roleBtnText: { fontSize: 12, fontWeight: '700', color: '#8b85a3' },
  roleBtnTextActive: { color: '#5b21b6' },
  btnPrimary: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchLinkText: { color: '#8b85a3', fontSize: 13 },
  switchLinkAccent: { color: '#7c3aed', fontWeight: 'bold' },
  otpFeedbackBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14
  },
  otpFeedbackText: { color: '#065f46', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  footerText: { textAlign: 'center', color: '#b8afd4', fontSize: 12, marginTop: 24 }
});
