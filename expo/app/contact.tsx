import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react-native';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Mock sending message - in real app, this would send to your backend
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 2000);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:ezcareai.contact@gmail.com');
  };

  const handleWhatsAppPress = () => {
    Linking.openURL('https://wa.me/33787194976');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <LinearGradient
          colors={['#4F46E5', '#06B6D4', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Get in Touch</Text>
          <Text style={styles.heroSubtitle}>
            We're here to help with any questions about EZCare AI
          </Text>
        </LinearGradient>

        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          
          <TouchableOpacity style={styles.contactOption} onPress={handleEmailPress}>
            <View style={styles.contactIcon}>
              <Mail size={24} color="#10B981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDetail}>ezcareai.contact@gmail.com</Text>
              <Text style={styles.contactDescription}>Get help via email - we respond within 24 hours</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactOption} onPress={handleWhatsAppPress}>
            <View style={styles.contactIcon}>
              <MessageCircle size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactDetail}>+33 7 87 19 49 76</Text>
              <Text style={styles.contactDescription}>Chat with us directly on WhatsApp</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How can we help you?"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.buttonDisabled]}
              onPress={handleSendMessage}
              disabled={isLoading}
            >
              <Send size={20} color="#fff" />
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Questions</Text>
          
          <View style={styles.faqList}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How quickly do you respond?</Text>
              <Text style={styles.faqAnswer}>
                We typically respond to emails within 24 hours. WhatsApp messages are usually answered faster during business hours.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can you help with billing issues?</Text>
              <Text style={styles.faqAnswer}>
                Yes! We can help with subscription management, billing questions, and payment issues. You can also use our billing portal for self-service options.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Do you provide medical advice?</Text>
              <Text style={styles.faqAnswer}>
                No, our support team cannot provide medical advice. For health concerns, please consult with qualified healthcare professionals or use our AI chatbot Ez for educational guidance only.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How can I delete my account?</Text>
              <Text style={styles.faqAnswer}>
                You can request account deletion by contacting us. We'll permanently delete your account and data within 30 days as per our privacy policy.
              </Text>
            </View>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursText}>
              📧 Email: 24/7 (responses within 24 hours){'\n'}
              📱 WhatsApp: Monday - Friday, 9 AM - 6 PM CET
            </Text>
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
  hero: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
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
  contactOption: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  hoursContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  hoursText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});