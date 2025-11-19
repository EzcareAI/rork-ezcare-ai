import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import CountryPicker, { CountryCode } from "react-native-country-picker-modal";
import PhoneInput from "react-native-phone-number-input";
import { AntDesign } from "@expo/vector-icons";
import RulerPicker from "react-native-ruler-picker";
const RulerPickerAny: any = RulerPicker;

const PhoneInputAny: any = PhoneInput;

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

const questions = [
  {
    id: "name",
    title: "What's your name?",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    id: "phone",
    title: "What's your phone number?",
    type: "text",
    placeholder: "Enter your phone number",
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
    options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "8+ hours"],
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
  const [callingCode, setCallingCode] = useState("1");
  const [showPicker, setShowPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [countryCCA2, setCountryCCA2] = useState("US");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [heightIsMetric, setHeightIsMetric] = useState(true);
  const [rulerHeight, setRulerHeight] = useState<number>(
    () => parseFloat(String(answers.height ?? "").replace(/[^0-9.]/g, "")) || 0
  );
  const [weightIsMetric, setWeightIsMetric] = useState(true);
  const [rulerWeight, setRulerWeight] = useState<number>(
    () => parseFloat(String(answers.weight ?? "").replace(/[^0-9.]/g, "")) || 0
  );
  const phoneInput = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  const feetInchesToCm = (feet: number, inches: number) =>
    (feet * 12 + inches) * 2.54;

  const onRulerValueChange = (value: number) => {
    setRulerHeight(value);
    setAnswers((prev) => ({ ...prev, height: String(Math.round(value)) }));
  };
  const kgToLbs = (kg: number) => Math.round(kg * 2.2046226218);
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id as string]: value }));
  };

  const handleNext = () => {
    const currentAnswer = answers[question.id as keyof QuizData];

    if (question.id === "phone") {
      const phoneDigits = (
        (currentAnswer as string) ||
        phoneNumber ||
        ""
      ).replace(/\D/g, "");
      if (phoneDigits.length < 8) {
        return;
      }
    }

    if (
      !currentAnswer ||
      (typeof currentAnswer === "string" && currentAnswer.trim() === "")
    ) {
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
    const heightNum = parseFloat(height.replace(/[^0-9.]/g, ""));
    const weightNum = parseFloat(weight.replace(/[^0-9.]/g, ""));

    if (!heightNum || !weightNum) {
      return { bmi: 0, category: "Unknown" };
    }

    let heightInM = heightNum;
    if (heightNum > 10) {
      heightInM = heightNum / 100;
    } else {
      heightInM = heightNum * 0.3048;
    }

    let weightInKg = weightNum;
    if (weightNum > 300) {
      weightInKg = weightNum * 0.453592;
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

    if (bmi < 18.5 || bmi >= 30) score -= 30;
    else if (bmi >= 25) score -= 15;

    if (data.sleep === "Less than 5 hours") score -= 15;
    else if (data.sleep === "5-6 hours") score -= 8;
    else if (data.sleep === "9+ hours") score -= 5;

    if (data.activity === "Never") score -= 20;
    else if (data.activity === "1-2 times per week") score -= 10;
    else if (data.activity === "3-4 times per week") score -= 5;

    if (data.smoking === "Daily") score -= 15;
    else if (data.smoking === "Occasionally") score -= 8;
    else if (data.smoking === "Trying to quit") score -= 5;

    if (data.alcohol === "3+ drinks per week") score -= 10;
    else if (data.alcohol === "1-2 drinks per week") score -= 3;

    if (data.stress === "Very high") score -= 5;
    else if (data.stress === "High") score -= 3;

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

    return recommendations.slice(0, 3);
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
    try {
      const quizData = answers as QuizData;
      const { bmi, category } = calculateBMI(quizData.height, quizData.weight);
      const healthScore = calculateHealthScore(quizData, bmi);
      const recommendations = generateRecommendations(
        quizData,
        bmi,
        healthScore
      );
      const rawCountry = (quizData.countryCode as string) || `+${callingCode}`;
      const countryCodeMatch = rawCountry.match(/^([+]\d+)/);
      const countryCode = countryCodeMatch ? countryCodeMatch[1] : "+1";

      const rawPhone = (quizData.phone as string) || phoneNumber || "";
      const phoneDigits = rawPhone.replace(/\D/g, "");
      const storedPhone = rawPhone.startsWith("+")
        ? rawPhone
        : `${countryCode}${phoneDigits}`;

      let resultId = "local-" + Date.now();
      try {
        const displayedHeight = heightIsMetric
          ? `${Math.round(rulerHeight)} cm`
          : (() => {
              const { feet, inches } = cmToFeetInches(rulerHeight);
              return `${feet}′${inches}″`;
            })();

        const displayedWeight = weightIsMetric
          ? `${Math.round(rulerWeight)} kg`
          : `${kgToLbs(rulerWeight)} lb`;

        const { data: testConn, error: testError } = await supabase
          .from("quiz_responses")
          .select("count")
          .limit(1);

        if (testError) {
          console.error("Supabase connection test failed:", testError);
        }

        const { data: savedQuiz, error } = await supabase
          .from("quiz_responses")
          .insert({
            user_id: user.id,
            name: quizData.name,
            phone: storedPhone,
            country_code: countryCode,
            height: displayedHeight,
            weight: displayedWeight,
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
            "Quiz result saved successfully to Supabase with ID:",
            resultId
          );
        } else {
          console.warn("⚠️ No data returned from Supabase, using local result");
        }
      } catch (error) {
        console.warn(
          "⚠️ Failed to save quiz result to database:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }

      router.push({
        pathname: "/quiz-result",
        params: {
          resultId,
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
  const phoneDigits = ((currentAnswer as string) || phoneNumber || "").replace(
    /\D/g,
    ""
  );
  const isAnswerValid =
    question.id === "phone"
      ? phoneDigits.length >= 8
      : !!currentAnswer &&
        typeof currentAnswer === "string" &&
        currentAnswer.trim() !== "";

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

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{question.title}</Text>

          {question.type === "text" ? (
            question.id === "phone" ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  flex: 1,
                  flexDirection: "row",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <TouchableOpacity
                  style={styles.countryBox}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.countryFlag}>
                    {String.fromCodePoint(
                      ...countryCCA2
                        .toUpperCase()
                        .split("")
                        .map((c) => 127397 + c.charCodeAt(0))
                    )}
                  </Text>
                  <Text style={styles.countryText}>{countryCode}</Text>
                  <AntDesign name="caretdown" size={10} color="black" />
                </TouchableOpacity>
                <CountryPicker
                  visible={showPicker}
                  countryCode={countryCCA2 as CountryCode}
                  withFlag
                  withCallingCode
                  withFilter
                  withCountryNameButton={false}
                  withFlagButton={false}
                  onClose={() => setShowPicker(false)}
                  onSelect={(country) => {
                    setCountryCCA2(country.cca2);
                    setCountryCode("+" + country.callingCode[0]);
                    setCallingCode(String(country.callingCode[0] ?? ""));
                    setAnswers((prev) => ({
                      ...prev,
                      countryCode: "+" + country.callingCode[0],
                    }));
                    setShowPicker(false);
                    try {
                      phoneInput.current?.setCountryCode?.(country.cca2);
                    } catch (e) {}
                  }}
                />
                <TextInput
                  style={[styles.textInput, styles.phoneInput]}
                  value={phoneNumber}
                  onChangeText={(text: string) => {
                    setPhoneNumber(text);
                    handleAnswer(text);
                  }}
                  placeholder={question.placeholder}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  maxLength={15}
                  placeholderTextColor="#6B7280"
                />
              </View>
            ) : question.id === "height" ? (
              <View>
                <View style={styles.toggleRow}>
                  <Text style={{ color: heightIsMetric ? "#333" : "#aaa" }}>
                    cm
                  </Text>
                  <Switch
                    value={!heightIsMetric}
                    onValueChange={() => setHeightIsMetric((s) => !s)}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                  <Text style={{ color: !heightIsMetric ? "#333" : "#aaa" }}>
                    ft/in
                  </Text>
                </View>

                {RulerPickerAny &&
                (typeof RulerPickerAny === "function" ||
                  typeof RulerPickerAny === "object") ? (
                  <RulerPickerAny
                    min={heightIsMetric ? 100 : feetInchesToCm(3, 0)}
                    max={heightIsMetric ? 220 : feetInchesToCm(7, 6)}
                    step={heightIsMetric ? 1 : 2.54}
                    unit={heightIsMetric ? "cm" : "ft"}
                    indicatorColor="#10B981"
                    value={rulerHeight}
                    onValueChangeEnd={onRulerValueChange}
                  />
                ) : (
                  <TextInput
                    style={styles.textInput}
                    placeholder={question.placeholder}
                    value={String(answers.height ?? rulerHeight)}
                    onChangeText={(text: string) => {
                      const cleaned = text.replace(/[^0-9.]/g, "");
                      if (cleaned === "") {
                        setRulerHeight(0);
                        setAnswers((prev) => ({ ...prev, height: "" }));
                        return;
                      }
                      const parsed = parseFloat(cleaned);
                      if (Number.isNaN(parsed)) return;
                      setRulerHeight(parsed);
                      setAnswers((prev) => ({
                        ...prev,
                        height: String(Math.round(parsed)),
                      }));
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    placeholderTextColor="#6B7280"
                  />
                )}

                <Text style={styles.value}>
                  {heightIsMetric
                    ? `${Math.round(rulerHeight)} cm`
                    : (() => {
                        const { feet, inches } = cmToFeetInches(rulerHeight);
                        return `${feet}′${inches}″`;
                      })()}
                </Text>
              </View>
            ) : question.id === "weight" ? (
              <View>
                <View style={styles.toggleRow}>
                  <Text style={{ color: weightIsMetric ? "#333" : "#aaa" }}>
                    kg
                  </Text>
                  <Switch
                    value={!weightIsMetric}
                    onValueChange={() => setWeightIsMetric((s) => !s)}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                  <Text style={{ color: !weightIsMetric ? "#333" : "#aaa" }}>
                    lb
                  </Text>
                </View>

                {RulerPickerAny &&
                (typeof RulerPickerAny === "function" ||
                  typeof RulerPickerAny === "object") ? (
                  <TextInput
                    style={styles.textInput}
                    placeholder={question.placeholder}
                    value={String(answers.weight ?? rulerWeight)}
                    onChangeText={(text: string) => {
                      const cleaned = text.replace(/[^0-9.]/g, "");
                      const num = parseFloat(cleaned) || rulerWeight;
                      setRulerWeight(num);
                      setAnswers((prev) => ({
                        ...prev,
                        weight: String(Math.round(num)),
                      }));
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    placeholderTextColor="#6B7280"
                  />
                ) : (
                  <TextInput
                    style={styles.textInput}
                    placeholder={question.placeholder}
                    value={String(answers.weight ?? rulerWeight)}
                    onChangeText={(text: string) => {
                      const cleaned = text.replace(/[^0-9.]/g, "");
                      if (cleaned === "") {
                        setRulerWeight(0);
                        setAnswers((prev) => ({ ...prev, weight: "" }));
                        return;
                      }
                      const parsed = parseFloat(cleaned);
                      if (Number.isNaN(parsed)) return;
                      setRulerWeight(parsed);
                      setAnswers((prev) => ({
                        ...prev,
                        weight: String(Math.round(parsed)),
                      }));
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    placeholderTextColor="#6B7280"
                  />
                )}

                <Text style={styles.value}>
                  {weightIsMetric
                    ? `${Math.round(rulerWeight)} kg`
                    : `${kgToLbs(rulerWeight)} lb`}
                </Text>
              </View>
            ) : (
              <TextInput
                style={styles.textInput}
                placeholder={question.placeholder}
                value={currentAnswer}
                onChangeText={handleAnswer}
                keyboardType={question.id === "phone" ? "phone-pad" : "default"}
                autoCapitalize={question.id === "phone" ? "none" : "words"}
                placeholderTextColor="#6B7280"
              />
            )
          ) : (
            <View>
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

      <View style={styles.navigation}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!isAnswerValid || isSubmitting) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isAnswerValid || isSubmitting}
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
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 6,
  },
  countryText: {
    fontSize: 16,
    marginRight: 6,
    color: "black",
  },
  phoneInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
    justifyContent: "center",
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
});
