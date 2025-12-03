
import TopBar from "@/components/Header/TopBar";
import { icons } from "@/constants";
import { useLogin } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginFormScreen() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  // Login Hook
  const { mutate: login, isPending: isLoading, error } = useLogin();

  // Refs for Accessibility/UX
  const passwordInputRef = useRef<TextInput>(null);

  // Form state
  const [email, setEmail] = useState(__DEV__ ? 'superadmin@communitychange.com' : '');
  const [password, setPassword] = useState('SuperAdmin@2025!Secure');
  const [showPassword, setShowPassword] = useState(false);

  // Error Handling Effect
  useEffect(() => {
    if (!error) return;

    const status = error?.statusCode;
    const message = error?.message?.toLowerCase() || "";

    console.log("🔥 ERROR CHECK:", status, message);

    if (
      status === 400 &&
      (message.includes("email not verified") ||
        message.includes("verify email") ||
        message.includes("unverified"))
    ) {
      Alert.alert(
        "Email Not Verified",
        "Please verify your email to continue.",
      );
    }
  }, [error, email, router]);

  // Handle login
  const handleLogin = useCallback(() => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!trimmedPassword) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    console.log('📤 Logging in with:', trimmedEmail);
    login({ email: trimmedEmail, password: trimmedPassword });
  }, [email, password, login]);



  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#176192', '#1D548D', '#264387']}
        style={styles.container}
      >
        <TopBar showNotifications={false} showDrawer={false} />

        <KeyboardAwareScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CCC Logo */}
          <View style={styles.cccLogoContainer}>
            <Image
              source={icons.communityImage}
              style={styles.cccLogo}
              resizeMode="contain"
            />
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Email or User Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#FF4D4D"
                  style={styles.errorIcon}
                />

                <Text style={styles.errorText}>
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong"}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#1A5490" />
              ) : (
                <Text style={styles.loginButtonText}>Log in</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* University Logo */}
          <View style={styles.universityLogoContainer}>
            <Image
              source={icons.universityIcon}
              style={styles.universityLogo}
              resizeMode="contain"
            />
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Ensures the layout remains balanced even with items removed
    justifyContent: 'flex-start',
  },
  cccLogoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: "#fff",
    marginHorizontal: 35,
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  cccLogo: {
    width: "100%",
    height: 90,
  },
  formContainer: {
    paddingHorizontal: 35,
    marginBottom: 60,
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 20,
  },
  passwordInput: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: "#fff",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 71, 87, 0.15)",
    borderColor: "rgba(255, 71, 87, 0.35)",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 15,
    flexShrink: 1,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#1A5490",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  universityLogoContainer: {
    alignItems: "center",
    marginBottom: 30,
    // Pushes to bottom if content is short
    marginTop: 'auto',
  },
  universityLogo: {
    width: 220,
    height: 50,
  },
});