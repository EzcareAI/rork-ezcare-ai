import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Check, Zap, Star, Crown } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import Purchases from "react-native-purchases";
import PRODUCTS from "@/config/products";

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
    credits: "10 credits/week",
    features: [
      "10 credits per week (auto-renew)",
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
      "GPT-5 AI model",
      "Email support",
    ],
    icon: Zap,
    color: "#10B981",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    credits: "300 questions/month",
    features: [
      "300 questions per month",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-5 AI model",
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
    price: "$79",
    credits: "Unlimited questions/month",
    features: [
      "Unlimited questions/month",
      "Premium health analysis",
      "Custom wellness plans",
      "GPT-5 AI model",
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
  const [offerings, setOfferings] = useState<any | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [switchingToFree, setSwitchingToFree] = useState(false);

  const fetchOfferings = async () => {
    try {
      setLoadingOfferings(true);
      const offs = await Purchases.getOfferings();
      setOfferings(offs ?? null);
    } catch (err) {
      console.error("Failed to fetch offerings", err);
      setOfferings(null);
    } finally {
      setLoadingOfferings(false);
    }
  };

  const getPlanKeyFromValue = (val?: string | null) => {
    if (!val) return undefined;
    const v = String(val).toLowerCase();
    if (v === "trial") return "free";

    const base = v.split(":")[0];

    if (Object.keys(PRODUCTS).includes(base)) return base;
    for (const key of Object.keys(PRODUCTS)) {
      const m = PRODUCTS[key].monthly?.toLowerCase();
      const y = PRODUCTS[key].yearly?.toLowerCase();
      if (m && (m === v || m === base)) return key;
      if (y && (y === v || y === base)) return key;
    }

    return undefined;
  };

  const currentPlanKey = getPlanKeyFromValue(user?.subscription_plan);

  const isPlanDisabled = (planKey: string) => {
    if (!user?.subscription_plan || user.subscription_plan === "trial")
      return false;

    const planRank = {
      free: 0,
      starter: 1,
      pro: 2,
      premium: 3,
    };

    const currentRank =
      planRank[user.subscription_plan as keyof typeof planRank] || 0;
    const targetRank = planRank[planKey as keyof typeof planRank] || 0;

    return targetRank < currentRank;
  };

  const handleSwitchToFree = async () => {
    if (!user) {
      Alert.alert("Please sign in to change plans");
      return;
    }

    try {
      setSwitchingToFree(true);
      await updateSubscription("free");
      Alert.alert("Plan Updated", "You are now on the Free plan.", [
        { text: "OK", onPress: () => router.push("/dashboard") },
      ]);
    } catch (err) {
      console.error("Failed to switch to Free:", err);
      Alert.alert("Update Failed", "Could not switch to Free plan.");
    } finally {
      setSwitchingToFree(false);
    }
  };

  const handlePurchasePackage = async (pkg: any) => {
    if (!user) {
      Alert.alert("Please sign in to subscribe");
      return;
    }

    const productId = pkg.product.identifier;
    const baseProductId = productId.split(":")[0];

    const planKey = Object.keys(PRODUCTS).find(
      (key) =>
        PRODUCTS[key].monthly === baseProductId ||
        PRODUCTS[key].yearly === baseProductId
    ) as keyof typeof PRODUCTS;

    if (!planKey) {
      Alert.alert("Error", "Invalid subscription plan");
      return;
    }

    if (user.subscription_plan === "trial") {
      await Purchases.invalidateCustomerInfoCache();
    }

    try {
      setPurchasingId(pkg.identifier);
      try {
        await Purchases.invalidateCustomerInfoCache();
      } catch {}
      try {
        const info: any = await Purchases.getCustomerInfo();
        const activeSubs: string[] = info?.activeSubscriptions || [];
        const normalize = (id?: string) => String(id || "").split(":")[0];
        const activeBaseIds = new Set(activeSubs.map((id) => normalize(id)));
        if (activeBaseIds.has(baseProductId)) {
          try {
            await updateSubscription(planKey as any);
          } catch (err) {
            console.error(
              "Failed to update subscription from active check:",
              err
            );
            Alert.alert("Error", "Failed to update your subscription plan");
            return;
          }

          const mod = await import("@/lib/syncSubscription");
          await mod.syncSubscription({ id: user.id });

          Alert.alert(
            "Already Active",
            `Your ${planKey} plan is still active with the store. No new purchase was made.`,
            [{ text: "OK", onPress: () => router.push("/dashboard") }]
          );
          return;
        }
      } catch (e) {
        console.error("Failed to check active subscriptions:", e);
      }
      try {
        await Purchases.purchasePackage(pkg);
      } catch (purchaseError: any) {
        const errText = String(
          purchaseError.message ||
            purchaseError.error ||
            purchaseError.toString()
        ).toLowerCase();

        const alreadyOwned =
          /already active|already owned|item_already_owned|product already purchased|productalreadypurchasederror/.test(
            errText
          ) ||
          purchaseError.code === "ProductAlreadyPurchasedError" ||
          purchaseError.code === "ITEM_ALREADY_OWNED" ||
          purchaseError.code === "ProductAlreadyPurchased";

        if (alreadyOwned) {
          console.log("Product already active, updating DB and syncing...");

          try {
            await updateSubscription(planKey as any);
          } catch (err) {
            console.error(
              "Failed to update subscription after already-owned:",
              err
            );
            Alert.alert("Error", "Failed to update your subscription plan");
            return;
          }

          const mod = await import("@/lib/syncSubscription");
          await mod.syncSubscription({ id: user.id });

          Alert.alert(
            "Already Active",
            `Your ${planKey} plan is still active with the store. No new purchase was made.`,
            [{ text: "OK", onPress: () => router.push("/dashboard") }]
          );
          return;
        }

        throw purchaseError;
      }

      try {
        await updateSubscription(planKey as any);
      } catch (err) {
        console.error("Failed to update subscription after purchase:", err);
        Alert.alert(
          "Error",
          "Subscription updated but failed to save to database"
        );
        return;
      }

      const mod = await import("@/lib/syncSubscription");
      await mod.syncSubscription({ id: user.id });

      Alert.alert("Success", `You are now subscribed to the ${planKey} plan!`, [
        { text: "OK", onPress: () => router.push("/dashboard") },
      ]);
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase failed:", error);
        Alert.alert("Purchase Failed", error.message || "Something went wrong");
      }
    } finally {
      setPurchasingId(null);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pricing Plans</Text>
          <View style={styles.headerSpacer} />
        </View>

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
        <View style={styles.pricingContainer}>
          {(() => {
            const freeMeta = PRODUCTS.free;
            const freeStatic = plans.find((p) => p.id === "free");
            const FreeIcon = freeStatic?.icon || Zap;
            const freeBg = freeStatic?.color
              ? freeStatic.color + "20"
              : "#E5E7EB";

            const isCurrentFree = currentPlanKey === "free";

            return (
              <View
                style={[
                  styles.pricingCard,
                  freeStatic?.popular && styles.popularCard,
                  isCurrentFree && styles.currentPlanCard,
                ]}
                key="free"
              >
                {isCurrentFree && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current Plan</Text>
                  </View>
                )}
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.iconContainer, { backgroundColor: freeBg }]}
                  >
                    <FreeIcon
                      size={24}
                      color={freeStatic?.color || "#6B7280"}
                    />
                  </View>
                  <Text style={styles.planName}>
                    {freeMeta?.displayName || "Free"}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>0</Text>
                  <Text style={styles.period}>/month</Text>
                </View>
                <Text style={styles.credits}>{freeMeta.credits}</Text>
                <View style={styles.features}>
                  {(freeMeta?.features || []).map((f: string, i: number) => (
                    <View key={i} style={styles.feature}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                {isCurrentFree ? (
                  <TouchableOpacity
                    style={[styles.subscribeButton, styles.currentPlanButton]}
                    disabled
                  >
                    <Text
                      style={[
                        styles.subscribeText,
                        styles.currentPlanButtonText,
                      ]}
                    >
                      Current Plan
                    </Text>
                  </TouchableOpacity>
                ) : user?.subscription_plan &&
                  user.subscription_plan !== "trial" ? (
                  <TouchableOpacity
                    style={[styles.subscribeButton, styles.currentPlanButton]}
                    disabled
                  >
                    <Text
                      style={[
                        styles.subscribeText,
                        styles.currentPlanButtonText,
                      ]}
                    >
                      Subscribe
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      switchingToFree && styles.currentPlanButton,
                      switchingToFree && styles.subscribeButtonDisabled,
                    ]}
                    onPress={handleSwitchToFree}
                    disabled={switchingToFree}
                  >
                    {switchingToFree ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={[styles.subscribeText]}>Choose Free</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
          {loadingOfferings ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Loading plans…
            </Text>
          ) : offerings?.current?.availablePackages?.length > 0 ? (
            (() => {
              const desiredOrder = ["starter", "pro", "premium"];
              const pkgs: any[] = offerings.current.availablePackages.slice();

              const planKeyFor = (pkg: any) => {
                const prod = pkg.product || {};
                const rawId = prod?.identifier;
                const baseProductId = String(rawId || "").split(":")[0];
                return (
                  Object.keys(PRODUCTS).find(
                    (k) =>
                      PRODUCTS[k].monthly === baseProductId ||
                      PRODUCTS[k].yearly === baseProductId
                  ) || baseProductId
                );
              };

              pkgs.sort((a, b) => {
                const aKey = planKeyFor(a);
                const bKey = planKeyFor(b);
                const aIndex = desiredOrder.indexOf(aKey);
                const bIndex = desiredOrder.indexOf(bKey);
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
              });

              return pkgs.map((pkg: any) => {
                const anyP: any = pkg;
                const prod = anyP.product || {};
                const rawTitle = prod.title;
                const price = prod.priceString;
                const description = prod.description || "";

                const rawId = prod?.identifier;
                const baseProductId = String(rawId).split(":")[0];

                const planKey = Object.keys(PRODUCTS).find(
                  (k) =>
                    PRODUCTS[k].monthly === baseProductId ||
                    PRODUCTS[k].yearly === baseProductId
                );
                const planMeta = planKey ? PRODUCTS[planKey] : null;
                const title = (planMeta && planMeta.displayName) || rawTitle;

                const normalizedPlanKey = getPlanKeyFromValue(
                  user?.subscription_plan
                );
                const isCurrentPlan = Boolean(
                  (planKey && planKey === normalizedPlanKey) ||
                    normalizedPlanKey === baseProductId
                );

                const planStatic = plans.find((p) => p.id === planKey);
                const IconComponent = planStatic?.icon || Zap;
                const iconColor = planStatic?.color || "#6B7280";
                const iconBg = planStatic?.color
                  ? planStatic.color + "20"
                  : "#E5E7EB";

                return (
                  <View
                    key={pkg.identifier}
                    style={[
                      styles.pricingCard,
                      isCurrentPlan && styles.currentPlanCard,
                    ]}
                  >
                    {isCurrentPlan && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentText}>Current Plan</Text>
                      </View>
                    )}
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: iconBg },
                        ]}
                      >
                        <IconComponent size={24} color={iconColor} />
                      </View>
                      <Text style={styles.planName}>{title}</Text>
                    </View>

                    <View style={styles.priceContainer}>
                      <Text adjustsFontSizeToFit style={styles.price}>
                        {price}
                      </Text>
                      <Text adjustsFontSizeToFit style={styles.period}>
                        /month
                      </Text>
                    </View>
                    {/* <Text style={styles.credits}>{description}</Text> */}
                    {planMeta ? (
                      <>
                        <Text style={styles.credits}>{planMeta.credits}</Text>
                        <View style={styles.features}>
                          {(planMeta.features || []).map((feature, idx) => (
                            <View key={idx} style={styles.feature}>
                              <Check size={16} color="#10B981" />
                              <Text style={styles.featureText}>{feature}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    ) : (
                      <Text style={styles.credits}>{description}</Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        (isCurrentPlan || isPlanDisabled(planKey || "")) &&
                          styles.currentPlanButton,
                        purchasingId === pkg.identifier &&
                          styles.subscribeButtonDisabled,
                      ]}
                      onPress={() => handlePurchasePackage(pkg)}
                      disabled={
                        isCurrentPlan ||
                        isPlanDisabled(planKey || "") ||
                        purchasingId === pkg.identifier
                      }
                    >
                      {purchasingId === pkg.identifier ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text
                          style={[
                            styles.subscribeText,
                            (isCurrentPlan || isPlanDisabled(planKey || "")) &&
                              styles.currentPlanButtonText,
                          ]}
                        >
                          {isCurrentPlan
                            ? "Current Plan"
                            : isPlanDisabled(planKey || "")
                            ? "Subscribe"
                            : "Subscribe"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              });
            })()
          ) : (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              No plans available right now.
            </Text>
          )}
        </View>

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help choosing? Contact us at ezcareai.contact@gmail.com
          </Text>
        </View>
      </ScrollView>
      {(switchingToFree || purchasingId !== null) && (
        <View style={styles.fullscreenOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
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
    fontSize: 35,
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
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
});
