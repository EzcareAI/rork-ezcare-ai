import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Shield, Zap, Star, ArrowRight, CheckCircle, Users, Clock, MessageCircle, Award, Lock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const testimonials = [
    {
      name: "Sarah M.",
      text: "Ez helped me understand my symptoms clearly. No more Dr. Google anxiety!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Mike R.", 
      text: "Simple explanations that actually make sense. Love the wellness tips.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Lisa K.",
      text: "Finally, health advice without judgment. Ez is like having a caring friend.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "David Chen",
      text: "The health quiz gave me insights I never had before. Ez's recommendations are spot-on!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emma Wilson",
      text: "Love how Ez explains complex health topics in simple terms. Game changer!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const pricingPreview = [
    { name: "Free", price: "$0", credits: "20 credits/week", description: "Auto-renew weekly" },
    { name: "Starter", price: "$19", credits: "50 questions/month", description: "Perfect for occasional use" },
    { name: "Pro", price: "$49", credits: "200 questions/month", description: "For regular health guidance" },
    { name: "Premium", price: "$99", credits: "Unlimited", description: "Complete health companion" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>EZCare AI</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#4F46E5', '#06B6D4', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your AI health buddy — meet Ez.</Text>
            <Text style={styles.heroSubtitle}>
              Clarity in seconds. Simple explanations, wellness tips, no judgement.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.primaryButtonText}>Start Free → Take Health Quiz</Text>
                <ArrowRight size={20} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/pricing')}
              >
                <Text style={styles.secondaryButtonText}>See Pricing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#EFF6FF' }]}>
                <Clock size={32} color="#3B82F6" />
              </View>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepTitle}>Take the 60-second quiz</Text>
              <Text style={styles.stepText}>Quick questions about your health, lifestyle, and wellness goals</Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F0FDF4' }]}>
                <Award size={32} color="#10B981" />
              </View>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepTitle}>Get your health score + insights</Text>
              <Text style={styles.stepText}>Receive personalized BMI analysis and wellness recommendations</Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#FEF3C7' }]}>
                <MessageCircle size={32} color="#F59E0B" />
              </View>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepTitle}>Chat with Ez (AI health buddy)</Text>
              <Text style={styles.stepText}>Get instant answers and ongoing health guidance</Text>
            </View>
          </View>
        </View>

        {/* Dashboard Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Health Conversations</Text>
          <View style={styles.dashboardMockup}>
            <View style={styles.mockupHeader}>
              <View style={styles.mockupAvatar} />
              <Text style={styles.mockupName}>Hi, I&apos;m Ez 👋</Text>
            </View>
            <View style={styles.mockupMessage}>
              <Text style={styles.mockupText}>
                I can help explain symptoms, suggest wellness tips, and provide health guidance in simple terms.
              </Text>
            </View>
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>Sign up to chat with Ez</Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.ctaButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Ez?</Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <Heart size={32} color="#10B981" />
              <Text style={styles.featureTitle}>Caring & Non-judgmental</Text>
              <Text style={styles.featureText}>Get health guidance without fear of judgment</Text>
            </View>
            <View style={styles.feature}>
              <Shield size={32} color="#10B981" />
              <Text style={styles.featureTitle}>Safe & Private</Text>
              <Text style={styles.featureText}>Your conversations are secure and confidential</Text>
            </View>
            <View style={styles.feature}>
              <Zap size={32} color="#10B981" />
              <Text style={styles.featureTitle}>Instant Clarity</Text>
              <Text style={styles.featureText}>Get clear explanations in seconds, not hours</Text>
            </View>
          </View>
        </View>

        {/* Pricing Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simple Pricing</Text>
          <View style={styles.pricingGrid}>
            {pricingPreview.map((plan, index) => (
              <View key={index} style={styles.pricingCard}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planCredits}>{plan.credits}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.viewPricingButton}
            onPress={() => router.push('/pricing')}
          >
            <Text style={styles.viewPricingText}>View Full Pricing</Text>
          </TouchableOpacity>
        </View>

        {/* Health Quiz CTA */}
        <LinearGradient
          colors={['#F0F9FF', '#E0F2FE']}
          style={styles.quizCTA}
        >
          <Text style={styles.quizTitle}>Start Your Health Journey</Text>
          <Text style={styles.quizText}>
            Take our quick health quiz to get personalized recommendations from Ez.
          </Text>
          <TouchableOpacity 
            style={styles.quizButton}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.quizButtonText}>Take Quiz Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.securityContainer}>
            <View style={styles.securityBadges}>
              <View style={styles.badge}>
                <Lock size={24} color="#10B981" />
                <Text style={styles.badgeText}>GDPR Compliant</Text>
              </View>
              <View style={styles.badge}>
                <Shield size={24} color="#3B82F6" />
                <Text style={styles.badgeText}>HIPAA Secure</Text>
              </View>
            </View>
            <Text style={styles.securityDescription}>
              Your health data is encrypted end-to-end and stored securely. You have full control over your information and can delete your account and all data at any time.
            </Text>
            <View style={styles.securityFeatures}>
              <View style={styles.securityFeature}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.securityFeatureText}>256-bit encryption</Text>
              </View>
              <View style={styles.securityFeature}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.securityFeatureText}>No data sharing with third parties</Text>
              </View>
              <View style={styles.securityFeature}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.securityFeatureText}>Complete data deletion on request</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What People Say</Text>
          <View style={styles.testimonials}>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonial}>
                <View style={styles.stars}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#FCD34D" fill="#FCD34D" />
                  ))}
                </View>
                <Text style={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</Text>
                <Text style={styles.testimonialName}>— {testimonial.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>EZCare AI</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/disclaimer')}>
              <Text style={styles.footerLink}>Medical Disclaimer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/contact')}>
              <Text style={styles.footerLink}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/database-test')}>
              <Text style={styles.footerLink}>Debug API</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/simple-test')}>
              <Text style={styles.footerLink}>Simple Test</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>
            © 2024 EZCare AI. Educational content only — not medical advice.
          </Text>
          <Text style={styles.footerDisclaimer}>
            ⚠️ Educational only — not medical advice. For emergencies call 911
          </Text>
          <Text style={styles.footerUpdate}>
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
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loginText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signupText: {
    color: '#fff',
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  heroButtons: {
    flexDirection: width > 400 ? 'row' : 'column',
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  dashboardMockup: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mockupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  mockupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mockupMessage: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mockupText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  mockupInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  mockupInputText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  features: {
    gap: 24,
  },
  feature: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingGrid: {
    flexDirection: width > 600 ? 'row' : 'column',
    gap: 16,
    justifyContent: 'center',
  },
  pricingCard: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    flex: width > 600 ? 1 : undefined,
    maxWidth: width > 600 ? undefined : '100%',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  planCredits: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewPricingButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 24,
  },
  viewPricingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  quizCTA: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  quizText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  quizButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  quizButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  testimonials: {
    gap: 20,
  },
  testimonial: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 16,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  testimonialName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#F9FAFB',
    padding: 32,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: width > 400 ? 'row' : 'column',
    gap: width > 400 ? 24 : 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footerDisclaimer: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  footerUpdate: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  stepsContainer: {
    gap: 32,
  },
  step: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    position: 'relative',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1F2937',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaContainer: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  planDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  securityContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  securityDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  securityFeatures: {
    gap: 12,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityFeatureText: {
    fontSize: 14,
    color: '#4B5563',
  },
});