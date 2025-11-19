import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking, Platform } from "react-native";
import { StyleSheet, View, Text } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";
SplashScreen.preventAutoHideAsync();

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="quiz-result" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="MedicalSourcesPage" />
    </Stack>
  );
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const parseTokensFromUrl = (url?: string | null) => {
      if (!url) return null;
      try {
        const hashIndex = url.indexOf("#");
        const fragment = hashIndex >= 0 ? url.substring(hashIndex + 1) : "";
        const queryIndex = url.indexOf("?");
        const query =
          queryIndex >= 0 ? url.substring(queryIndex + 1).split("#")[0] : "";
        const params = new URLSearchParams(fragment || query);
        const access = params.get("access_token") || params.get("accessToken");
        const refresh =
          params.get("refresh_token") || params.get("refreshToken");
        const type = params.get("type");
        if (access) return { access, refresh, type };
      } catch (e) {
        console.error("Error parsing tokens from URL:", e);
      }
      return null;
    };

    const handleUrl = async (incoming?: string | null) => {
      try {
        const url = incoming || (await Linking.getInitialURL());
        const tokens = parseTokensFromUrl(url || null);
        if (tokens) {
          const query = [];
          query.push(`access_token=${encodeURIComponent(tokens.access)}`);
          if (tokens.refresh)
            query.push(`refresh_token=${encodeURIComponent(tokens.refresh)}`);
          if (tokens.type)
            query.push(`type=${encodeURIComponent(tokens.type)}`);
          router.replace(`/reset-password?${query.join("&")}`);
        }
      } catch (e) {
        console.error("Error handling deep link URL:", e);
      }
    };

    handleUrl();

    const listener = (event: { url: string }) => handleUrl(event.url);
    const sub = Linking.addEventListener
      ? Linking.addEventListener("url", listener)
      : Linking.addListener("url", listener);
    return () => {
      try {
        if (sub && typeof sub.remove === "function") sub.remove();
      } catch {}
    };
  }, [router]);
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    try {
      const extra =
        (Constants.expoConfig || Constants.manifest || {}).extra || {};
      const iosKey =
        extra.EXPO_PUBLIC_REVENUECAT_IOS_KEY ||
        extra.revenuecatIosKey ||
        process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
      const androidKey =
        extra.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ||
        extra.revenuecatAndroidKey ||
        process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
      const key = Platform.OS === "ios" ? iosKey : androidKey;
      if (!key || typeof key !== "string") {
        console.warn(
          "RevenueCat API key is missing or invalid. Skipping Purchases.configure."
        );
        return;
      }

      Purchases.configure({ apiKey: key });

      getOfferings();
    } catch (e) {
      console.warn("Failed to configure RevenueCat Purchases:", e);
    }
  }, []);

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length !== 0
    ) {
    } else {
      console.log("No current offerings available.");
    }
  }
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});
