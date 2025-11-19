import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, AlertTriangle } from "lucide-react-native";

export default function DisclaimerPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Disclaimer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningBanner}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.warningText}>IMPORTANT MEDICAL DISCLAIMER</Text>
        </View>

        <Text style={styles.intro}>
          Please read this medical disclaimer carefully before using EZCare AI.
          This disclaimer explains the limitations of our AI health guidance
          service and your responsibilities as a user.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Not Medical Advice</Text>
          <Text style={styles.sectionText}>
            EZCare AI and our AI chatbot "Ez" provide educational health
            information only. Our service does NOT provide:
            {"\n\n"}• Medical advice, diagnosis, or treatment{"\n"}•
            Professional healthcare services{"\n"}• Personalized medical
            recommendations{"\n"}• Prescription or medication guidance{"\n"}•
            Emergency medical assistance
            {"\n\n"}
            The information provided is for general educational purposes and
            should not be used as a substitute for professional medical advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Always Consult Healthcare Professionals
          </Text>
          <Text style={styles.sectionText}>
            You should ALWAYS:
            {"\n\n"}• Consult with qualified healthcare providers for medical
            concerns{"\n"}• Seek professional medical advice before making
            health decisions{"\n"}• Follow your doctor's recommendations over
            any information from our service{"\n"}• Get proper medical
            evaluation for symptoms or health issues{"\n"}• Verify any health
            information with medical professionals
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Situations</Text>
          <Text style={styles.emergencyText}>
            🚨 FOR MEDICAL EMERGENCIES, CALL 911 IMMEDIATELY
            {"\n\n"}
            Do not use EZCare AI for emergency situations. If you are
            experiencing:
            {"\n\n"}• Chest pain or difficulty breathing{"\n"}• Severe injuries
            or bleeding{"\n"}• Loss of consciousness{"\n"}• Severe allergic
            reactions{"\n"}• Thoughts of self-harm{"\n"}• Any life-threatening
            symptoms
            {"\n\n"}
            Call emergency services immediately or go to the nearest emergency
            room.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitations of AI Technology</Text>
          <Text style={styles.sectionText}>
            Our AI technology has limitations:
            {"\n\n"}• Cannot examine you physically{"\n"}• Cannot access your
            medical records{"\n"}• Cannot perform diagnostic tests{"\n"}• May
            not understand complex medical conditions{"\n"}• Cannot replace
            human medical judgment{"\n"}• May provide incomplete or inaccurate
            information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            No Doctor-Patient Relationship
          </Text>
          <Text style={styles.sectionText}>
            Using EZCare AI does not create a doctor-patient relationship. We
            are not your healthcare provider, and our AI responses do not
            constitute medical care or professional medical services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accuracy and Reliability</Text>
          <Text style={styles.sectionText}>
            While we strive to provide accurate information:
            {"\n\n"}• We cannot guarantee the accuracy of all information{"\n"}•
            Medical knowledge is constantly evolving{"\n"}• Individual health
            situations vary greatly{"\n"}• Our AI may make errors or provide
            outdated information{"\n"}• Always verify information with
            healthcare professionals
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mental Health Considerations</Text>
          <Text style={styles.sectionText}>
            If you are experiencing mental health issues, including depression,
            anxiety, or thoughts of self-harm:
            {"\n\n"}• Contact a mental health professional immediately{"\n"}•
            Call a crisis helpline in your area{"\n"}• Reach out to trusted
            friends, family, or counselors{"\n"}• Do not rely solely on AI
            guidance for mental health support
            {"\n\n"}
            National Suicide Prevention Lifeline: 988
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication and Treatment</Text>
          <Text style={styles.sectionText}>
            Never:
            {"\n\n"}• Start, stop, or change medications based on our AI
            guidance{"\n"}• Ignore your doctor's instructions{"\n"}• Use our
            service to self-diagnose conditions{"\n"}• Delay seeking medical
            care based on our responses{"\n"}• Make treatment decisions without
            professional consultation
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Responsibility</Text>
          <Text style={styles.sectionText}>
            As a user, you are responsible for:
            {"\n\n"}• Using the service appropriately and safely{"\n"}• Seeking
            professional medical care when needed{"\n"}• Not relying solely on
            AI guidance for health decisions{"\n"}• Understanding the
            limitations of our service{"\n"}• Making informed decisions about
            your health
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liability Limitation</Text>
          <Text style={styles.sectionText}>
            EZCare AI, its owners, employees, and affiliates are not liable for
            any damages, injuries, or adverse outcomes resulting from your use
            of our service or reliance on the information provided. Use our
            service at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have questions about this medical disclaimer:
            {"\n\n"}
            📧 Email: ezcareai.contact@gmail.com{"\n"}
            📱 WhatsApp: +33 7 87 19 49 76
            {"\n\n"}
            Remember: For medical emergencies, always call 911 or your local
            emergency services.
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
  },
  intro: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  emergencyText: {
    fontSize: 16,
    color: "#DC2626",
    lineHeight: 24,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
