import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Zap, Star, Crown, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';

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
    id: 'starter',
    name: 'Starter',
    price: '$19',
    credits: '50 questions/month',
    features: [
      '50 questions per month',
      'Advanced health insights',
      'Personalized wellness tips',
      'GPT-4o AI model',
      'Email support'
    ],
    icon: Zap,
    color: '#10B981'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    credits: '200 questions/month',
    features: [
      '200 questions per month',
      'Premium health analysis',
      'Custom wellness plans',
      'GPT-4o AI model',
      'Priority support',
      'Health tracking'
    ],
    popular: true,
    icon: Star,
    color: '#3B82F6'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    credits: 'Unlimited',
    features: [
      'Unlimited questions',
      'Premium health analysis',
      'Custom wellness plans',
      'GPT-4o AI model',
      '24/7 priority support',
      'Advanced health tracking',
      'Exclusive content'
    ],
    icon: Crown,
    color: '#8B5CF6'
  }
];

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

export default function SubscriptionModal({ visible, onClose, selectedPlan }: SubscriptionModalProps) {
  const { user, updateSubscription } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(selectedPlan || 'pro');

  const handleCheckout = async (plan: "starter" | "pro" | "premium") => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to subscribe');
      return;
    }

    setLoading(plan);

    try {
      let apiUrl = '';
      
      // Use same logic as tRPC client - check both __DEV__ and APP_ENV
      const isDevelopment = __DEV__ || process.env.APP_ENV === 'development';
      const isProduction = process.env.APP_ENV === 'production' || (!__DEV__ && !process.env.APP_ENV);
      
      if (isDevelopment && !isProduction) {
        if (typeof window !== 'undefined') {
          apiUrl = `${window.location.origin}/api`;
        } else {
          apiUrl = "http://localhost:8081/api";
        }
      } else {
        // In production, always use EXPO_PUBLIC_API_URL
        apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://zvfley8yoowhncate9z5.rork.app/api";
      }
      
      console.log('Making checkout request to:', `${apiUrl}/checkout`);
      console.log('Environment mode:', __DEV__ ? 'development' : 'production');
      
      const res = await fetch(`${apiUrl}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          userId: user?.id,
          email: user?.email,
        }),
      });
      
      console.log('Checkout response status:', res.status);
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        Alert.alert('Error', 'Server returned invalid response. Please try again.');
        return;
      }
      
      const data = await res.json();
      console.log('Checkout response data:', data);
      
      if (data.success && data.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          Alert.alert(
            'Stripe Checkout',
            'This would redirect to Stripe checkout. For demo purposes, we\'ll activate the plan directly.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Activate Plan', 
                onPress: () => {
                  updateSubscription(plan);
                  onClose();
                  Alert.alert('Success!', 'Subscription activated successfully!', [
                    { text: 'OK', onPress: () => router.push('/dashboard') }
                  ]);
                }
              }
            ]
          );
        }
      } else {
        const errorMessage = data.error || 'Failed to create checkout session';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', `Failed to process subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlanId) || plans[1];
  const IconComponent = selectedPlanData.icon;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Hero Section */}
          <LinearGradient
            colors={['#4F46E5', '#06B6D4', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>Unlock Premium Features</Text>
            <Text style={styles.heroSubtitle}>
              Get unlimited access to Ez, your AI health buddy
            </Text>
          </LinearGradient>

          {/* Plan Selection */}
          <View style={styles.planSelection}>
            <Text style={styles.sectionTitle}>Select a Plan</Text>
            <View style={styles.planTabs}>
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const PlanIcon = plan.icon;
                
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planTab,
                      isSelected && styles.selectedPlanTab,
                      plan.popular && styles.popularPlanTab
                    ]}
                    onPress={() => setSelectedPlanId(plan.id)}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                    
                    <View style={[styles.planIconContainer, { backgroundColor: plan.color + '20' }]}>
                      <PlanIcon size={20} color={plan.color} />
                    </View>
                    
                    <Text style={[styles.planTabName, isSelected && styles.selectedPlanTabName]}>
                      {plan.name}
                    </Text>
                    
                    <Text style={[styles.planTabPrice, isSelected && styles.selectedPlanTabPrice]}>
                      {plan.price}/mo
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Plan Details */}
          <View style={styles.planDetails}>
            <View style={styles.planHeader}>
              <View style={[styles.planIconLarge, { backgroundColor: selectedPlanData.color + '20' }]}>
                <IconComponent size={32} color={selectedPlanData.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{selectedPlanData.name} Plan</Text>
                <Text style={styles.planCredits}>{selectedPlanData.credits}</Text>
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>{selectedPlanData.price}</Text>
                <Text style={styles.planPeriod}>/month</Text>
              </View>
            </View>

            <View style={styles.features}>
              <Text style={styles.featuresTitle}>What's included:</Text>
              {selectedPlanData.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.paymentSection}>
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                selectedPlanData.popular && styles.popularSubscribeButton,
                loading === selectedPlanId && styles.loadingButton
              ]}
              onPress={() => handleCheckout(selectedPlanId as "starter" | "pro" | "premium")}
              disabled={loading !== null}
            >
              {loading === selectedPlanId ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <CreditCard size={20} color="#fff" />
                  <Text style={styles.subscribeButtonText}>
                    Subscribe to {selectedPlanData.name}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              • Cancel anytime{"\n"}
              • Secure payment with Stripe{"\n"}
              • 30-day money-back guarantee
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  planSelection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  planTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  planTab: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedPlanTab: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  popularPlanTab: {
    borderColor: '#3B82F6',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  planTabName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  selectedPlanTabName: {
    color: '#1F2937',
  },
  planTabPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  selectedPlanTabPrice: {
    color: '#3B82F6',
  },
  planDetails: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  planCredits: {
    fontSize: 14,
    color: '#6B7280',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  planPeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  features: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  paymentSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  subscribeButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  popularSubscribeButton: {
    backgroundColor: '#3B82F6',
  },
  loadingButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});