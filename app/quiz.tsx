import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

interface QuizData {
  name: string;
  phone: string;
  countryCode: string;
  height: string;
  weight: string;
  sleep: string;
  activity: string;
  smoking: string;
  alcohol: string;
  stress: string;
  diet: string;
}

interface QuizResult {
  id: string;
  userId: string;
  data: QuizData;
  bmi: number;
  bmiCategory: string;
  healthScore: number;
  recommendations: string[];
  createdAt: Date;
}

const questions = [
  {
    id: "name",
    title: "What's your name?",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    id: "countryCode",
    title: "Select your country code",
    type: "select",
    options: [
      "+1 (US/Canada)",
      "+44 (UK)",
      "+33 (France)",
      "+49 (Germany)",
      "+81 (Japan)",
      "+86 (China)",
      "+91 (India)",
      "+61 (Australia)",
      "+55 (Brazil)",
      "+7 (Russia)",
      "+34 (Spain)",
      "+39 (Italy)",
      "+31 (Netherlands)",
      "+46 (Sweden)",
      "+47 (Norway)",
      "+45 (Denmark)",
      "+41 (Switzerland)",
      "+43 (Austria)",
      "+32 (Belgium)",
      "+351 (Portugal)",
      "+30 (Greece)",
      "+48 (Poland)",
      "+420 (Czech Republic)",
      "+36 (Hungary)",
      "+40 (Romania)",
      "+359 (Bulgaria)",
      "+385 (Croatia)",
      "+386 (Slovenia)",
      "+421 (Slovakia)",
      "+370 (Lithuania)",
      "+371 (Latvia)",
      "+372 (Estonia)",
      "+358 (Finland)",
      "+354 (Iceland)",
      "+353 (Ireland)",
      "+356 (Malta)",
      "+357 (Cyprus)",
      "+352 (Luxembourg)",
      "+377 (Monaco)",
      "+378 (San Marino)",
      "+379 (Vatican)",
      "+380 (Ukraine)",
      "+375 (Belarus)",
      "+373 (Moldova)",
      "+382 (Montenegro)",
      "+383 (Kosovo)",
      "+387 (Bosnia)",
      "+389 (Macedonia)",
      "+381 (Serbia)",
      "+90 (Turkey)",
      "+98 (Iran)",
      "+964 (Iraq)",
      "+966 (Saudi Arabia)",
      "+971 (UAE)",
      "+974 (Qatar)",
      "+973 (Bahrain)",
      "+968 (Oman)",
      "+965 (Kuwait)",
      "+962 (Jordan)",
      "+963 (Syria)",
      "+961 (Lebanon)",
      "+972 (Israel)",
      "+970 (Palestine)",
      "+20 (Egypt)",
      "+212 (Morocco)",
      "+213 (Algeria)",
      "+216 (Tunisia)",
      "+218 (Libya)",
      "+221 (Senegal)",
      "+223 (Mali)",
      "+224 (Guinea)",
      "+225 (Ivory Coast)",
      "+226 (Burkina Faso)",
      "+227 (Niger)",
      "+228 (Togo)",
      "+229 (Benin)",
      "+230 (Mauritius)",
      "+231 (Liberia)",
      "+232 (Sierra Leone)",
      "+233 (Ghana)",
      "+234 (Nigeria)",
      "+235 (Chad)",
      "+236 (Central African Republic)",
      "+237 (Cameroon)",
      "+238 (Cape Verde)",
      "+239 (Sao Tome)",
      "+240 (Equatorial Guinea)",
      "+241 (Gabon)",
      "+242 (Republic of Congo)",
      "+243 (Democratic Republic of Congo)",
      "+244 (Angola)",
      "+245 (Guinea-Bissau)",
      "+246 (British Indian Ocean Territory)",
      "+247 (Ascension Island)",
      "+248 (Seychelles)",
      "+249 (Sudan)",
      "+250 (Rwanda)",
      "+251 (Ethiopia)",
      "+252 (Somalia)",
      "+253 (Djibouti)",
      "+254 (Kenya)",
      "+255 (Tanzania)",
      "+256 (Uganda)",
      "+257 (Burundi)",
      "+258 (Mozambique)",
      "+260 (Zambia)",
      "+261 (Madagascar)",
      "+262 (Reunion)",
      "+263 (Zimbabwe)",
      "+264 (Namibia)",
      "+265 (Malawi)",
      "+266 (Lesotho)",
      "+267 (Botswana)",
      "+268 (Swaziland)",
      "+269 (Comoros)",
      "+290 (Saint Helena)",
      "+291 (Eritrea)",
      "+297 (Aruba)",
      "+298 (Faroe Islands)",
      "+299 (Greenland)",
      "+350 (Gibraltar)",
      "+500 (Falkland Islands)",
      "+501 (Belize)",
      "+502 (Guatemala)",
      "+503 (El Salvador)",
      "+504 (Honduras)",
      "+505 (Nicaragua)",
      "+506 (Costa Rica)",
      "+507 (Panama)",
      "+508 (Saint Pierre and Miquelon)",
      "+509 (Haiti)",
      "+590 (Guadeloupe)",
      "+591 (Bolivia)",
      "+592 (Guyana)",
      "+593 (Ecuador)",
      "+594 (French Guiana)",
      "+595 (Paraguay)",
      "+596 (Martinique)",
      "+597 (Suriname)",
      "+598 (Uruguay)",
      "+599 (Netherlands Antilles)",
      "+670 (East Timor)",
      "+672 (Australian External Territories)",
      "+673 (Brunei)",
      "+674 (Nauru)",
      "+675 (Papua New Guinea)",
      "+676 (Tonga)",
      "+677 (Solomon Islands)",
      "+678 (Vanuatu)",
      "+679 (Fiji)",
      "+680 (Palau)",
      "+681 (Wallis and Futuna)",
      "+682 (Cook Islands)",
      "+683 (Niue)",
      "+684 (American Samoa)",
      "+685 (Samoa)",
      "+686 (Kiribati)",
      "+687 (New Caledonia)",
      "+688 (Tuvalu)",
      "+689 (French Polynesia)",
      "+690 (Tokelau)",
      "+691 (Micronesia)",
      "+692 (Marshall Islands)",
    ],
  },
  {
    id: "phone",
    title: "What's your phone number?",
    type: "text",
    placeholder: "Enter your phone number (without country code)",
  },
  {
    id: "height",
    title: "What's your height?",
    type: "text",
    placeholder: "e.g., 5'8\" or 173 cm",
  },
  {
    id: "weight",
    title: "What's your weight?",
    type: "text",
    placeholder: "e.g., 150 lbs or 68 kg",
  },
  {
    id: "sleep",
    title: "How many hours do you sleep per night?",
    type: "select",
    options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "9+ hours"],
  },
  {
    id: "activity",
    title: "How often do you exercise?",
    type: "select",
    options: [
      "Never",
      "1-2 times per week",
      "3-4 times per week",
      "5+ times per week",
    ],
  },
  {
    id: "smoking",
    title: "Do you smoke?",
    type: "select",
    options: ["Never", "Occasionally", "Daily", "Trying to quit"],
  },
  {
    id: "alcohol",
    title: "How often do you drink alcohol?",
    type: "select",
    options: [
      "Never",
      "Occasionally",
      "1-2 drinks per week",
      "3+ drinks per week",
    ],
  },
  {
    id: "stress",
    title: "How would you rate your stress level?",
    type: "select",
    options: ["Very low", "Low", "Moderate", "High", "Very high"],
  },
  {
    id: "diet",
    title: "How would you describe your diet?",
    type: "select",
    options: [
      "Very healthy",
      "Mostly healthy",
      "Average",
      "Needs improvement",
      "Poor",
    ],
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    const currentAnswer = answers[question.id as keyof QuizData];
    if (!currentAnswer || currentAnswer.trim() === "") {
      Alert.alert(
        "Please answer the question",
        "This field is required to continue."
      );
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateBMI = (
    height: string,
    weight: string
  ): { bmi: number; category: string } => {
    // Simple BMI calculation - in a real app, you'd want more robust parsing
    const heightNum = parseFloat(height.replace(/[^0-9.]/g, ""));
    const weightNum = parseFloat(weight.replace(/[^0-9.]/g, ""));

    if (!heightNum || !weightNum) {
      return { bmi: 0, category: "Unknown" };
    }

    // Assume metric if height > 10 (cm), otherwise assume feet
    let heightInM = heightNum;
    if (heightNum > 10) {
      heightInM = heightNum / 100; // cm to m
    } else {
      heightInM = heightNum * 0.3048; // feet to m
    }

    // Assume kg if weight < 300, otherwise assume lbs
    let weightInKg = weightNum;
    if (weightNum > 300) {
      weightInKg = weightNum * 0.453592; // lbs to kg
    }

    const bmi = weightInKg / (heightInM * heightInM);

    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obese";

    return { bmi: Math.round(bmi * 10) / 10, category };
  };

  const calculateHealthScore = (data: QuizData, bmi: number): number => {
    let score = 100;

    // BMI impact (30 points)
    if (bmi < 18.5 || bmi >= 30) score -= 30;
    else if (bmi >= 25) score -= 15;

    // Sleep impact (15 points)
    if (data.sleep === "Less than 5 hours") score -= 15;
    else if (data.sleep === "5-6 hours") score -= 8;
    else if (data.sleep === "9+ hours") score -= 5;

    // Activity impact (20 points)
    if (data.activity === "Never") score -= 20;
    else if (data.activity === "1-2 times per week") score -= 10;
    else if (data.activity === "3-4 times per week") score -= 5;

    // Smoking impact (15 points)
    if (data.smoking === "Daily") score -= 15;
    else if (data.smoking === "Occasionally") score -= 8;
    else if (data.smoking === "Trying to quit") score -= 5;

    // Alcohol impact (10 points)
    if (data.alcohol === "3+ drinks per week") score -= 10;
    else if (data.alcohol === "1-2 drinks per week") score -= 3;

    // Stress impact (5 points)
    if (data.stress === "Very high") score -= 5;
    else if (data.stress === "High") score -= 3;

    // Diet impact (5 points)
    if (data.diet === "Poor") score -= 5;
    else if (data.diet === "Needs improvement") score -= 3;

    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = (
    data: QuizData,
    bmi: number,
    healthScore: number
  ): string[] => {
    const recommendations: string[] = [];

    if (bmi >= 25) {
      recommendations.push(
        "Consider a balanced diet and regular exercise to achieve a healthy weight"
      );
    } else if (bmi < 18.5) {
      recommendations.push(
        "Consider consulting a nutritionist to develop a healthy weight gain plan"
      );
    }

    if (data.sleep === "Less than 5 hours" || data.sleep === "5-6 hours") {
      recommendations.push(
        "Aim for 7-9 hours of quality sleep each night for optimal health"
      );
    }

    if (data.activity === "Never" || data.activity === "1-2 times per week") {
      recommendations.push(
        "Try to incorporate at least 150 minutes of moderate exercise per week"
      );
    }

    if (data.smoking === "Daily" || data.smoking === "Occasionally") {
      recommendations.push(
        "Consider quitting smoking - your body will thank you!"
      );
    }

    if (data.stress === "High" || data.stress === "Very high") {
      recommendations.push(
        "Practice stress management techniques like meditation or deep breathing"
      );
    }

    if (data.diet === "Poor" || data.diet === "Needs improvement") {
      recommendations.push(
        "Focus on eating more fruits, vegetables, and whole grains"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Keep up the great work! Maintain your healthy lifestyle habits"
      );
      recommendations.push(
        "Consider regular health check-ups with your healthcare provider"
      );
      recommendations.push(
        "Stay hydrated and maintain good mental health practices"
      );
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Please sign in",
        "You need to be signed in to save your quiz results."
      );
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting quiz data...");

    try {
      console.log("Current user:", user.id); // Debug log
      const quizData = answers as QuizData;
      const { bmi, category } = calculateBMI(quizData.height, quizData.weight);
      const healthScore = calculateHealthScore(quizData, bmi);
      const recommendations = generateRecommendations(
        quizData,
        bmi,
        healthScore
      );

      // Extract country code from the selected option
      const countryCodeMatch = quizData.countryCode.match(/^([+]\d+)/);
      const countryCode = countryCodeMatch ? countryCodeMatch[1] : "+1";

      // Save to Supabase
      let resultId = "local-" + Date.now(); // Fallback ID
      try {
        console.log("Saving quiz result to Supabase...");

        // Debug: Check Supabase connection
        const { data: testConn, error: testError } = await supabase
          .from("quiz_responses")
          .select("count")
          .limit(1);

        if (testError) {
          console.error("Supabase connection test failed:", testError);
        } else {
          console.log("Supabase connection successful");
        }

        const { data: savedQuiz, error } = await supabase
          .from("quiz_responses")
          .insert({
            user_id: user.id,
            name: quizData.name,
            phone: quizData.phone,
            country_code: countryCode,
            height: parseFloat(quizData.height.replace(/[^0-9.]/g, "")) || 0,
            weight: parseFloat(quizData.weight.replace(/[^0-9.]/g, "")) || 0,
            sleep_hours:
              quizData.sleep === "Less than 5 hours"
                ? 4
                : quizData.sleep === "5-6 hours"
                ? 5.5
                : quizData.sleep === "7-8 hours"
                ? 7.5
                : 9,
            activity_level:
              quizData.activity === "Never"
                ? "sedentary"
                : quizData.activity === "1-2 times per week"
                ? "light"
                : quizData.activity === "3-4 times per week"
                ? "moderate"
                : quizData.activity === "5+ times per week"
                ? "active"
                : "sedentary",
            smoking: quizData.smoking === "Yes",
            alcohol_frequency:
              quizData.alcohol === "Never"
                ? "never"
                : quizData.alcohol === "Occasionally"
                ? "occasionally"
                : quizData.alcohol === "1-2 drinks per week"
                ? "rarely"
                : quizData.alcohol === "3+ drinks per week"
                ? "regularly"
                : "never",
            stress_level:
              quizData.stress === "Very low"
                ? 1
                : quizData.stress === "Low"
                ? 3
                : quizData.stress === "Moderate"
                ? 5
                : quizData.stress === "High"
                ? 7
                : quizData.stress === "Very high"
                ? 9
                : 5,
            diet_quality:
              quizData.diet === "Very healthy"
                ? "excellent"
                : quizData.diet === "Mostly healthy"
                ? "good"
                : quizData.diet === "Average"
                ? "fair"
                : quizData.diet === "Needs improvement"
                ? "poor"
                : quizData.diet === "Poor"
                ? "poor"
                : "fair",
            bmi,
            bmi_category: category.toLowerCase(),
            health_score: healthScore,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("Supabase error:", error);
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }

        if (savedQuiz && savedQuiz[0]) {
          resultId = savedQuiz[0].id;
          console.log(
            "✅ Quiz result saved successfully to Supabase with ID:",
            resultId
          );
        } else {
          console.warn("⚠️ No data returned from Supabase, using local result");
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "⚠️ Failed to save quiz result to database:",
            error instanceof Error ? error.message : "Unknown error"
          );
          console.log(
            "📱 Continuing with local result - quiz functionality will work offline"
          );
        }
        // Continue with local result - the quiz functionality should work even without backend
      }

      // Navigate to results page (works with both saved and local results)
      router.push({
        pathname: "/quiz-result",
        params: {
          resultId,
          // Pass the data as URL params for local results
          localData: JSON.stringify({
            name: quizData.name,
            bmi,
            bmiCategory: category,
            healthScore,
            recommendations,
          }),
        },
      });
    } catch (error) {
      console.error("Error processing quiz result:", error);
      Alert.alert("Error", "Failed to process quiz results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswer = answers[question.id as keyof QuizData] || "";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Quiz</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{question.title}</Text>

          {question.type === "text" ? (
            <TextInput
              style={styles.textInput}
              placeholder={question.placeholder}
              value={currentAnswer}
              onChangeText={handleAnswer}
              keyboardType={question.id === "phone" ? "phone-pad" : "default"}
              autoCapitalize={question.id === "phone" ? "none" : "words"}
            />
          ) : (
            <View style={styles.optionsContainer}>
              {question.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    currentAnswer === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentAnswer === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!currentAnswer || isSubmitting) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!currentAnswer || isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting
              ? "Calculating..."
              : currentQuestion === questions.length - 1
              ? "Get Results"
              : "Next"}
          </Text>
          {!isSubmitting && <ArrowRight size={20} color="#fff" />}
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Educational only — not medical advice. For emergencies call 911
        </Text>
      </View>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    paddingVertical: 32,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 32,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#10B981",
  },
  optionText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#1F2937",
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  nextButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#991B1B",
    textAlign: "center",
  },
  headerSpacer: {
    width: 24,
  },
});
