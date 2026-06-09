import { CommonCard, GradientBackground, PrimaryButton, roadmapTheme } from '@/components/ui/design-system';
import { icons } from '@/constants';
import { useLogin } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginFormScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { mutate: login, isPending: isLoading, error } = useLogin();
  const passwordInputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!error) return;

    const status = error?.statusCode;
    const message = error?.message?.toLowerCase() || '';

    if (
      status === 400 &&
      (message.includes('email not verified') ||
        message.includes('verify email') ||
        message.includes('unverified'))
    ) {
      Alert.alert('Email Not Verified', 'Please verify your email to continue.');
    }
  }, [error]);

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

    login({ email: trimmedEmail, password: trimmedPassword });
  }, [email, password, login]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground style={styles.screen}>
        <View
          style={[
            styles.screenInner,
            { paddingTop: top + 16, paddingBottom: Math.max(bottom, 16) },
          ]}
        >
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color={roadmapTheme.textPrimary} />
            </View>
            <Text style={styles.pageHeaderEyebrow}>The Center for Community Change</Text>
            <Text style={styles.pageHeaderTitle}>Director Portal</Text>
            <Text style={styles.pageHeaderSubtitle}>
              Sign in to manage mentors, pastors, and program progress
            </Text>
          </View>

          <View style={styles.formArea}>
            <KeyboardAwareScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <CommonCard style={styles.formCard}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={roadmapTheme.textCaption}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email or username"
                      placeholderTextColor={roadmapTheme.textCaption}
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
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={roadmapTheme.textCaption}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Password"
                      placeholderTextColor={roadmapTheme.textCaption}
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
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeButton}
                      disabled={isLoading}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={roadmapTheme.textCaption}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#FDA4AF" style={styles.errorIcon} />
                    <Text style={styles.errorText}>
                      {error?.response?.data?.message || error?.message || 'Something went wrong'}
                    </Text>
                  </View>
                ) : null}

                {isLoading ? (
                  <View style={styles.loadingButton}>
                    <ActivityIndicator color={roadmapTheme.textActive} />
                  </View>
                ) : (
                  <PrimaryButton label="Sign in" onPress={handleLogin} disabled={isLoading} />
                )}
              </CommonCard>
            </KeyboardAwareScrollView>
          </View>

          <View style={styles.logoFooter}>
            <Image source={icons.universityIcon} style={styles.universityLogo} resizeMode="contain" />
          </View>
        </View>
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenInner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageHeader: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 6,
  },
  pageHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pageHeaderEyebrow: {
    color: roadmapTheme.textCaption,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  pageHeaderTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 32,
    textAlign: 'center',
  },
  pageHeaderSubtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 2,
  },
  formArea: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  formCard: {
    gap: 14,
    width: '100%',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: roadmapTheme.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: roadmapTheme.textPrimary,
    paddingVertical: 12,
  },
  passwordInput: {
    paddingRight: 36,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 164, 175, 0.12)',
    borderColor: 'rgba(253, 164, 175, 0.35)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorIcon: {
    flexShrink: 0,
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  loadingButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    opacity: 0.7,
  },
  logoFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    flexShrink: 0,
  },
  universityLogo: {
    width: 200,
    height: 44,
    opacity: 0.95,
  },
});
