import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Calendar, Zap, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';

export default function BillingPage() {
  const { user } = useAuth();

  const handleManageBilling = () => {
    // Mock Stripe customer portal - in real app, this would redirect to Stripe
    Alert.alert(
      'Billing Portal',
      'This would redirect to Stripe customer portal in a real app where you can manage your subscription, update payment methods, and view billing history.',
      [{ text: 'OK' }]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Billing & Usage</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Current Plan */}
        <LinearGradient
          colors={['#4F46E5', '#06B6D4', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planCard}
        >
          <Text style={styles.planTitle}>Current Plan</Text>
          <Text style={styles.planName}>{user.subscription_plan.toUpperCase()}</Text>
          <View style={styles.creditsContainer}>
            <Zap size={20} color="#FEF3C7" />
            <Text style={styles.creditsText}>{user.credits} credits remaining</Text>
          </View>
        </LinearGradient>

        {/* Usage Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage This Month</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Zap size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {user.subscription_plan === 'trial' ? '20' : 
                 user.subscription_plan === 'starter' ? '200' :
                 user.subscription_plan === 'pro' ? '1000' : '∞'}
              </Text>
              <Text style={styles.statLabel}>Total Credits</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>
                {user.subscription_plan === 'trial' ? (20 - user.credits) :
                 user.subscription_plan === 'starter' ? (200 - user.credits) :
                 user.subscription_plan === 'pro' ? (1000 - user.credits) : '0'}
              </Text>
              <Text style={styles.statLabel}>Credits Used</Text>
            </View>
          </View>
        </View>

        {/* Billing Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Management</Text>
          
          <TouchableOpacity 
            style={styles.billingButton}
            onPress={handleManageBilling}
          >
            <View style={styles.billingButtonContent}>
              <CreditCard size={24} color="#1F2937" />
              <View style={styles.billingButtonText}>
                <Text style={styles.billingButtonTitle}>Manage Subscription</Text>
                <Text style={styles.billingButtonSubtitle}>
                  Update payment method, view invoices, cancel subscription
                </Text>
              </View>
              <ExternalLink size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upgrade Options */}
        {user.subscription_plan === 'trial' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade Your Plan</Text>
            <Text style={styles.upgradeText}>
              You&apos;re currently on a trial plan. Upgrade to get more credits and features.
            </Text>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/pricing')}
            >
              <Text style={styles.upgradeButtonText}>View Pricing Plans</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Zap size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Account Created</Text>
                <Text style={styles.activityDate}>20 trial credits added</Text>
              </View>
            </View>

            {user.subscription_plan !== 'trial' && (
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <CreditCard size={16} color="#3B82F6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Subscription Started</Text>
                  <Text style={styles.activityDate}>{user.subscription_plan.toUpperCase()} plan activated</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any questions about billing or need assistance, please contact us:
          </Text>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 ezcareai.contact@gmail.com</Text>
            <Text style={styles.contactItem}>📱 WhatsApp: +33 7 87 19 49 76</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  planCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  planTitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  planName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsText: {
    fontSize: 16,
    color: '#FEF3C7',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  billingButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billingButtonText: {
    flex: 1,
  },
  billingButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  billingButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  upgradeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  supportText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 16,
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
});