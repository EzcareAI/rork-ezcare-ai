import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Check, Zap, Star, Crown } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: string;
  features: string[];
  popular?: boolean;
  icon: any;
  color: string;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    credits: "20 credits/week",
    features: [
      "20 credits per week (auto-renew)",
      "Basic health guidance",
      "Symptom explanations",
      "GPT-4o-mini AI model",
    ],
    icon: Zap,
    color: "#6B7280",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    credits: "50 questions/month",
    features: [
      "50 questions per month",
      "Advanced health insights",
      "Personalized wellness tips",
      "GPT-4o AI model",
      "Email support",
    ],
    icon: Zap,
    color: "#10B981",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    credits: "200 questions/month",
    features: [
      "200 questions per month",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-4o AI model",
      "Priority support",
      "Health tracking",
    ],
    popular: true,
    icon: Star,
    color: "#3B82F6",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$99",
    credits: "Unlimited",
    features: [
      "Unlimited questions",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-4o AI model",
      "24/7 priority support",
      "Advanced health tracking",
      "Exclusive content",
    ],
    icon: Crown,
    color: "#8B5CF6",
  },
];

export default function PricingPage() {
  const { user, updateSubscription } = useAuth();

  const [isCreatingCheckout, setIsCreatingCheckout] = React.useState(false);

  const handleCheckout = async (plan: "starter" | "pro" | "premium") => {
    if (!user) {
      console.log("No user found, please sign in");
      Alert.alert("Error", "Please sign in to continue");
      return;
    }

    setIsCreatingCheckout(true);
    try {
      console.log("Creating checkout session for plan:", plan);
      console.log("User details:", { id: user.id, email: user.email });

      console.log("Invoking create-checkout-session function...");
      
      const { data: result, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            plan,
            userId: user.id,
            email: user.email,
          },
        }
      );

      console.log("Function response:", { result, error });

      if (error) {
        console.error("Function error details:", {
          message: error.message,
          name: error.name,
          status: error.status,
          stack: error.stack,
        });
        throw error;
      }

      if (!result) {
        throw new Error("No result returned from checkout function");
      }

      console.log("Checkout session result:", result);

      if (result?.url) {
        if (Platform.OS === "web") {
          // On web, redirect to Stripe checkout
          window.location.href = result.url;
        } else {
          // On mobile, open in browser
          await WebBrowser.openBrowserAsync(result.url);
        }
      } else {
        console.error("Checkout error: No URL returned");
        Alert.alert("Checkout Error", "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);

      let errorMessage = "Failed to process subscription. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Network error")) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Request timeout. The server may be busy. Please try again.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Unable to connect to server. Please try again later.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      Alert.alert("Subscription Error", errorMessage);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      Alert.alert("Please sign in to subscribe");
      return;
    }

    if (planId === "free") {
      // Free plan - just update locally
      updateSubscription("trial");
      Alert.alert("Success!", "You are now on the free plan!", [
        { text: "OK", onPress: () => router.push("/dashboard") },
      ]);
      return;
    }

    // Call the checkout function for paid plans
    await handleCheckout(planId as "starter" | "pro" | "premium");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pricing Plans</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero */}
        <LinearGradient
          colors={["#4F46E5", "#06B6D4", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Choose Your Plan</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to Ez, your AI health buddy
          </Text>
        </LinearGradient>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan =
              user?.subscription_plan === plan.id ||
              (plan.id === "free" && user?.subscription_plan === "trial");

            return (
              <View
                key={plan.id}
                style={[
                  styles.pricingCard,
                  plan.popular && styles.popularCard,
                  isCurrentPlan && styles.currentPlanCard,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current Plan</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: plan.color + "20" },
                    ]}
                  >
                    <IconComponent size={24} color={plan.color} />
                  </View>
                  <Text style={styles.planName}>{plan.name}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>/month</Text>
                </View>

                <Text style={styles.credits}>{plan.credits}</Text>

                <View style={styles.features}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    plan.popular && styles.popularButton,
                    isCurrentPlan && styles.currentPlanButton,
                  ]}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan}
                >
                  <Text
                    style={[
                      styles.subscribeText,
                      plan.popular && styles.popularButtonText,
                      isCurrentPlan && styles.currentPlanButtonText,
                    ]}
                  >
                    {isCurrentPlan ? "Current Plan" : "Subscribe"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do credits work?</Text>
            <Text style={styles.faqAnswer}>
              Each message you send to Ez uses 1 credit. You get credits based
              on your subscription plan.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time from the billing
              portal.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is my data secure?</Text>
            <Text style={styles.faqAnswer}>
              Absolutely. We use enterprise-grade security to protect your
              health information.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help choosing? Contact us at ezcareai.contact@gmail.com
          </Text>
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
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonTextDisabled: {
    opacity: 0.6,
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
  headerSpacer: {
    width: 24,
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
  pricingContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  pricingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  popularCard: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  currentPlanCard: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  currentBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1F2937",
  },
  period: {
    fontSize: 18,
    color: "#6B7280",
    marginLeft: 4,
  },
  credits: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: "#4B5563",
  },
  subscribeButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  popularButton: {
    backgroundColor: "#3B82F6",
  },
  currentPlanButton: {
    backgroundColor: "#D1D5DB",
  },
  subscribeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  popularButtonText: {
    color: "#fff",
  },
  currentPlanButtonText: {
    color: "#6B7280",
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
