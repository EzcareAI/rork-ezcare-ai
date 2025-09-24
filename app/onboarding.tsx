import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';

interface Question {
  id: string;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
}

const questions: Question[] = [
  {
    id: 'age',
    question: 'What is your age range?',
    options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    type: 'single'
  },
  {
    id: 'health_goals',
    question: 'What are your main health goals?',
    options: ['Weight management', 'Better sleep', 'Stress reduction', 'Exercise more', 'Eat healthier', 'Manage chronic condition'],
    type: 'multiple'
  },
  {
    id: 'current_concerns',
    question: 'Do you have any current health concerns?',
    options: ['Headaches', 'Fatigue', 'Digestive issues', 'Joint pain', 'Sleep problems', 'Anxiety/stress', 'None'],
    type: 'multiple'
  },
  {
    id: 'lifestyle',
    question: 'How would you describe your lifestyle?',
    options: ['Very active', 'Moderately active', 'Somewhat active', 'Sedentary'],
    type: 'single'
  },
  {
    id: 'diet',
    question: 'How would you describe your diet?',
    options: ['Very healthy', 'Mostly healthy', 'Average', 'Could be better', 'Poor'],
    type: 'single'
  },
  {
    id: 'support',
    question: 'What kind of health support are you looking for?',
    options: ['Symptom explanations', 'Wellness tips', 'Lifestyle advice', 'Mental health support', 'Nutrition guidance', 'Exercise recommendations'],
    type: 'multiple'
  }
];

export default function OnboardingPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();

  const handleAnswer = (questionId: string, option: string, type: 'single' | 'multiple') => {
    if (type === 'single') {
      setAnswers(prev => ({ ...prev, [questionId]: [option] }));
    } else {
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        const isSelected = currentAnswers.includes(option);
        
        if (isSelected) {
          return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, option] };
        }
      });
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestion];
    const currentAnswers = answers[currentQ.id] || [];
    
    if (currentAnswers.length === 0) {
      Alert.alert('Please select at least one option');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Mock saving quiz responses - in real app, this would save to Supabase
    console.log('Quiz responses:', answers);
    
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentAnswers = answers[currentQ.id] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Quiz</Text>
        <Text style={styles.progress}>{currentQuestion + 1}/{questions.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#4F46E5', '#06B6D4', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentQ.question}</Text>
          <Text style={styles.questionType}>
            {currentQ.type === 'multiple' ? 'Select all that apply' : 'Select one option'}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {currentQ.options.map((option, index) => {
            const isSelected = currentAnswers.includes(option);
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleAnswer(currentQ.id, option, currentQ.type)}
              >
                <View style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]}>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Completing...' : currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next'}
          </Text>
          {!isLoading && <ArrowRight size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
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
  progress: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  questionType: {
    fontSize: 14,
    color: '#6B7280',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIndicatorSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#1F2937',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});