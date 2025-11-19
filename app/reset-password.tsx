import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react-native";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const params = useLocalSearchParams();

  useEffect(() => {
    try {
      const a = params.access_token || params.accessToken || null;
      const r = params.refresh_token || params.refreshToken || null;
      if (a) setAccessToken(String(a));
      if (r) setRefreshToken(String(r));
    } catch (e) {
      console.error("Error parsing tokens from params:", e);
    }
  }, [params]);

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    const tokenA = accessToken;
    const tokenR = refreshToken;

    if (!tokenA) return Alert.alert("Error", "Invalid or missing reset link.");

    try {
      setIsLoading(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: tokenA,
          refresh_token: tokenR || tokenA,
        });

      if (sessionError) throw sessionError;

      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      Alert.alert("Success", "Your password has been updated.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      console.error("Password update error:", err);
      Alert.alert("Error", err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <LinearGradient
          colors={["#4F46E5", "#06B6D4", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Set a New Password</Text>
          <Text style={styles.heroSubtitle}>
            Enter and confirm your new password below.
          </Text>
        </LinearGradient>

        <View style={styles.form}>
          {["New Password", "Confirm Password"].map((label, i) => (
            <View key={i} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View
                style={[
                  styles.inputContainer,
                  (i === 0 && passwordError) ||
                  (i === 1 && confirmPasswordError)
                    ? styles.inputError
                    : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  secureTextEntry
                  value={i === 0 ? password : confirmPassword}
                  onChangeText={(text) => {
                    if (i === 0) {
                      setPassword(text);
                      setPasswordError("");
                    } else {
                      setConfirmPassword(text);
                      setConfirmPasswordError("");
                    }
                  }}
                  autoCapitalize="none"
                  placeholderTextColor="#6B7280"
                />
              </View>
              {i === 0 && passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              {i === 1 && confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  hero: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  heroSubtitle: { fontSize: 15, color: "#E5E7EB", textAlign: "center" },
  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 6 },
  inputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: { fontSize: 16, color: "#1F2937", paddingVertical: 14 },
  resetButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  resetButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
