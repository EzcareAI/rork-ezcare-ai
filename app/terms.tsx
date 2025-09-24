import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsPage() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Updated September 20th, 2025</Text>

        <Text style={styles.intro}>
          Welcome to EZCare AI. These Terms of Service govern your use of our AI health guidance platform. By using our service, you agree to these terms.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Service Description</Text>
          <Text style={styles.sectionText}>
            EZCare AI provides AI-powered health guidance through our chatbot "Ez". Our service offers:
            {'\n\n'}
            • Educational health information and explanations{'\n'}
            • Wellness tips and lifestyle recommendations{'\n'}
            • Symptom information and general guidance{'\n'}
            • Personalized health insights based on your quiz responses
            {'\n\n'}
            Our service is for educational purposes only and does not constitute medical advice, diagnosis, or treatment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Medical Disclaimer</Text>
          <Text style={styles.sectionText}>
            IMPORTANT: EZCare AI is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with questions about medical conditions. Never disregard professional medical advice or delay seeking it because of information from our service.
            {'\n\n'}
            In case of medical emergencies, call 911 or your local emergency services immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            To use our service, you must:
            {'\n\n'}
            • Be at least 18 years old{'\n'}
            • Provide accurate account information{'\n'}
            • Keep your login credentials secure{'\n'}
            • Notify us of any unauthorized account access{'\n'}
            • Use the service only for lawful purposes
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Subscription and Billing</Text>
          <Text style={styles.sectionText}>
            • Subscriptions are billed monthly in advance{'\n'}
            • Credits are allocated based on your subscription plan{'\n'}
            • Unused credits do not roll over to the next billing period{'\n'}
            • You can cancel your subscription at any time{'\n'}
            • Refunds are provided according to our refund policy{'\n'}
            • Price changes will be communicated 30 days in advance
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
          <Text style={styles.sectionText}>
            You agree not to:
            {'\n\n'}
            • Use the service for illegal activities{'\n'}
            • Share false or misleading health information{'\n'}
            • Attempt to reverse engineer our AI models{'\n'}
            • Share your account credentials with others{'\n'}
            • Use the service to harm others or yourself{'\n'}
            • Violate any applicable laws or regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Privacy and Data</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our service, you consent to our data practices as described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            EZCare AI and all related content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Service Availability</Text>
          <Text style={styles.sectionText}>
            We strive to provide reliable service but cannot guarantee 100% uptime. We may temporarily suspend service for maintenance, updates, or technical issues. We are not liable for any damages resulting from service interruptions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            To the maximum extent permitted by law, EZCare AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service. Our total liability is limited to the amount you paid for the service in the 12 months preceding the claim.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your account if you violate these terms. You may terminate your account at any time through your account settings. Upon termination, your access to the service will cease, and we may delete your data according to our data retention policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We may update these Terms of Service from time to time. We will notify you of material changes by email or through our service. Your continued use after changes become effective constitutes acceptance of the updated terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Governing Law</Text>
          <Text style={styles.sectionText}>
            These terms are governed by the laws of the jurisdiction where EZCare AI operates. Any disputes will be resolved through binding arbitration or in the courts of that jurisdiction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have questions about these Terms of Service, please contact us:
            {'\n\n'}
            📧 Email: ezcareai.contact@gmail.com{'\n'}
            📱 WhatsApp: +33 7 87 19 49 76
            {'\n\n'}
            EZCare AI{'\n'}
            Legal Department{'\n'}
            Terms of Service Inquiries
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