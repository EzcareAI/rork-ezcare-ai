import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPage() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Updated September 20th, 2025</Text>

        <Text style={styles.intro}>
          At EZCare AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our AI health guidance service.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.sectionText}>
            • Account Information: Email address, password, and subscription details{'\n'}
            • Health Quiz Responses: Your answers to our onboarding health questionnaire{'\n'}
            • Chat Messages: Your conversations with Ez, our AI health buddy{'\n'}
            • Usage Data: How you interact with our service, including features used and time spent{'\n'}
            • Payment Information: Billing details processed securely through Stripe
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            • Provide personalized AI health guidance and recommendations{'\n'}
            • Improve our AI models and service quality{'\n'}
            • Process payments and manage your subscription{'\n'}
            • Send important service updates and notifications{'\n'}
            • Ensure platform security and prevent abuse
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.sectionText}>
            We implement industry-standard security measures to protect your data:
            {'\n\n'}
            • All data is encrypted in transit and at rest{'\n'}
            • Regular security audits and monitoring{'\n'}
            • Limited access to personal data on a need-to-know basis{'\n'}
            • Secure cloud infrastructure with enterprise-grade protection
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell, rent, or share your personal information with third parties, except:
            {'\n\n'}
            • With your explicit consent{'\n'}
            • To comply with legal obligations{'\n'}
            • To protect our rights and prevent fraud{'\n'}
            • With service providers who help us operate our platform (under strict confidentiality agreements)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.sectionText}>
            You have the right to:
            {'\n\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate information{'\n'}
            • Delete your account and data{'\n'}
            • Export your data{'\n'}
            • Opt out of non-essential communications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <Text style={styles.sectionText}>
            Your health information is particularly sensitive. We:
            {'\n\n'}
            • Never share health data with advertisers or marketers{'\n'}
            • Use health information only to provide AI guidance{'\n'}
            • Allow you to delete health conversations at any time{'\n'}
            • Comply with applicable health privacy regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            We use essential cookies to:
            {'\n\n'}
            • Keep you logged in{'\n'}
            • Remember your preferences{'\n'}
            • Analyze usage patterns to improve our service{'\n'}
            • Ensure security and prevent fraud
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our service is not intended for children under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our service. Your continued use of EZCare AI after changes become effective constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
            {'\n\n'}
            📧 Email: ezcareai.contact@gmail.com{'\n'}
            📱 WhatsApp: +33 7 87 19 49 76
            {'\n\n'}
            EZCare AI{'\n'}
            Data Protection Officer{'\n'}
            Privacy Inquiries
          </Text>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            ⚠️ Educational only — not medical advice. For emergencies call 911
          </Text>
          <Text style={styles.updateNote}>
            Updated September 20th, 2025
          </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  footerNote: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
    fontWeight: '600',
  },
  updateNote: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});