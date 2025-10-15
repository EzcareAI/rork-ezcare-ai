import React, { useState } from "react";
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
import { router } from "expo-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert("Password Requirements", passwordError);
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(
        "Error",
        "Please agree to the Privacy Policy and Terms of Service"
      );
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password, name);
    console.log("Signup result:", result.success, result.error);
    setIsLoading(false);

    if (result.success) {
      // Redirect to quiz immediately after successful signup
      setTimeout(() => {
        router.replace("/quiz");
      }, 500); // Small delay to ensure auth state is updated
    } else {
      Alert.alert("Error", result.error || "Signup failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero */}
        <LinearGradient
          colors={["#4F46E5", "#06B6D4", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Join EZCare AI</Text>
          <Text style={styles.heroSubtitle}>
            Start your health journey with Ez, your AI health buddy
          </Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            >
              {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{" "}
              <Text style={styles.link} onPress={() => router.push("/privacy")}>
                Privacy Policy
              </Text>{" "}
              and{" "}
              <Text style={styles.link} onPress={() => router.push("/terms")}>
                Terms of Service
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  hero: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#E5E7EB",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  link: {
    color: "#10B981",
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  headerSpacer: {
    width: 24,
  },
});
