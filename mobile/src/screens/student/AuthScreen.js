import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import { authAPI } from "../../api/apiClient";
import Ionicons from "react-native-vector-icons/Ionicons";

const TABS = { LOGIN: "login", REGISTER: "register", OTP: "otp" };

export default function AuthScreen({ navigation }) {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(TABS.LOGIN);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCollege, setRegCollege] = useState("");
  const [regHostelName, setRegHostelName] = useState("");

  // OTP state
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const otpInputRef = useRef(null);

  React.useEffect(() => {
    AsyncStorage.getItem("savedLoginId").then((id) => {
      if (id) setLoginId(id);
    });
  }, []);

  const resetForm = () => {
    setLoginId("");
    setLoginPassword("");
    setRegName("");
    setRegPhone("");
    setRegEmail("");
    setRegPassword("");
    setRegCollege("");
    setRegHostelName("");
    setOtpPhone("");
    setOtpCode("");
    setOtpSent(false);
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      Alert.alert("Missing Fields", "Please enter your phone and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({
        username: loginId.trim(),
        password: loginPassword,
      });
      if (res.data.success) {
        await AsyncStorage.setItem("savedLoginId", loginId.trim());
        await AsyncStorage.multiSet([
          ["userToken", res.data.token],
          ["userData", JSON.stringify(res.data.user)],
        ]);
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      }
    } catch (err) {
      let msg = "Login failed. Check your credentials.";
      if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.friendlyMessage) msg = err.friendlyMessage;
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (regPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
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
        college: role === "student" ? regCollege.trim() : "",
        hostelName: role === "owner" ? regHostelName.trim() : "",
      });
      if (res.data.success) {
        await AsyncStorage.multiSet([
          ["userToken", res.data.token],
          ["userData", JSON.stringify(res.data.user)],
        ]);
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      }
    } catch (err) {
      let msg = "Registration failed. Please try again.";
      if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.friendlyMessage) msg = err.friendlyMessage;
      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 4) {
      Alert.alert("Invalid Code", "Please enter the 4-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(otpPhone, otpCode);
      if (res.data.success) {
        if (res.data.registered) {
          await AsyncStorage.multiSet([
            ["userToken", res.data.token],
            ["userData", JSON.stringify(res.data.user)],
          ]);
          dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        } else {
          setRegPhone(otpPhone);
          setTab(TABS.REGISTER);
        }
      }
    } catch (err) {
      Alert.alert("Wrong Code", "Incorrect OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (tab === TABS.OTP) {
      setTab(TABS.LOGIN);
    } else if (tab === TABS.REGISTER) {
      setTab(TABS.LOGIN);
    } else {
      navigation.goBack();
    }
  };

  // OTP Square rendering
  const renderOtpSquares = () => {
    const squares = [];
    for (let i = 0; i < 4; i++) {
      const char = otpCode[i] || '';
      const isFocused = otpCode.length === i;
      squares.push(
        <View key={i} style={[styles.otpBox, isFocused && styles.otpBoxActive]}>
          <Text style={styles.otpBoxText}>{char}</Text>
        </View>
      );
    }
    return squares;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Header Back Button */}
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* ===================== LOGIN TAB ===================== */}
          {tab === TABS.LOGIN && (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back 👋</Text>
              <Text style={styles.subtitle}>Login to continue</Text>

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                value={loginId}
                onChangeText={setLoginId}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotBtn} onPress={() => setTab(TABS.OTP)}>
                <Text style={styles.forgotText}>Forgot Password? (Use OTP)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Login</Text>}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={24} color="#ea4335" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.footerLink} onPress={() => { setTab(TABS.REGISTER); resetForm(); }}>
                <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerTextBold}>Register</Text></Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===================== REGISTER TAB ===================== */}
          {tab === TABS.REGISTER && (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              {/* Role Selection */}
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]} 
                  onPress={() => setRole('student')}
                >
                  <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Student</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]} 
                  onPress={() => setRole('owner')}
                >
                  <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>Hostel Owner</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={regName}
                onChangeText={setRegName}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                value={regPhone}
                onChangeText={setRegPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {role === 'student' ? (
                <>
                  <Text style={styles.label}>College Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your college name"
                    placeholderTextColor="#9ca3af"
                    value={regCollege}
                    onChangeText={setRegCollege}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Hostel Property Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your hostel property name"
                    placeholderTextColor="#9ca3af"
                    value={regHostelName}
                    onChangeText={setRegHostelName}
                  />
                </>
              )}

              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Register</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.footerLink, { marginTop: 30 }]} onPress={() => { setTab(TABS.LOGIN); resetForm(); }}>
                <Text style={styles.footerText}>Already have an account? <Text style={styles.footerTextBold}>Login</Text></Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===================== OTP TAB ===================== */}
          {tab === TABS.OTP && (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Verify OTP</Text>
              
              {!otpSent ? (
                <>
                  <Text style={[styles.subtitle, { marginBottom: 30 }]}>Enter your phone number to receive a 4-digit code.</Text>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9ca3af"
                    value={otpPhone}
                    onChangeText={setOtpPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  <TouchableOpacity 
                    style={[styles.primaryBtn, { marginTop: 20 }]} 
                    onPress={async () => {
                      setLoading(true);
                      try {
                        const res = await authAPI.sendOtp(otpPhone);
                        if (res.data.success) {
                          setOtpSent(true);
                          // Code is actually sent via SMS in real life, auto-fill for demo:
                          Alert.alert("Demo Mode", "Your OTP is " + res.data.code);
                        }
                      } catch (err) {
                        Alert.alert("Error", "Could not send OTP");
                      } finally {
                        setLoading(false);
                      }
                    }} 
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send OTP</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Enter the 4-digit code sent to{'\n'}
                    <Text style={{ fontWeight: 'bold', color: '#1f2937' }}>+91 {otpPhone}</Text>
                  </Text>

                  {/* Hidden Text Input handling the actual typing */}
                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenOtpInput}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={4}
                    autoFocus={true}
                  />

                  {/* Visual OTP Squares */}
                  <TouchableOpacity style={styles.otpSquaresContainer} activeOpacity={1} onPress={() => otpInputRef.current?.focus()}>
                    {renderOtpSquares()}
                  </TouchableOpacity>

                  <Text style={styles.resendText}>Resend OTP in 00:45</Text>

                  <TouchableOpacity style={[styles.primaryBtn, { marginTop: 40 }]} onPress={handleVerifyOtp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 32,
    padding: 4,
    marginLeft: -4,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 40,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  eyeIcon: {
    padding: 14,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    paddingHorizontal: 12,
    color: "#9ca3af",
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  footerLink: {
    alignItems: 'center',
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  footerTextBold: {
    color: "#4f46e5",
    fontWeight: "bold",
  },

  /* OTP Styles */
  otpSquaresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  otpBoxActive: {
    borderColor: "#4f46e5",
    borderWidth: 2,
    backgroundColor: '#f5f3ff',
  },
  otpBoxText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendText: {
    textAlign: 'center',
    color: "#9ca3af",
    fontSize: 13,
  },
  /* Role Selection */
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleBtnActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
    borderWidth: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  roleTextActive: {
    color: '#4f46e5',
  }
});
