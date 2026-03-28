import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface QuizData {
  name: string;
  email: string;
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

export default function QuizResultPage() {
  const { resultId, localData } = useLocalSearchParams();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [resultId, localData]);

  const loadResult = async () => {
    try {
      // First try to use local data if provided (for offline results)
      if (localData && typeof localData === 'string') {
        try {
          const parsedData = JSON.parse(localData);
          const localResult: QuizResult = {
            id: resultId as string,
            userId: 'local',
            data: {
              name: parsedData.name || 'User',
              email: '',
              height: '',
              weight: '',
              sleep: '',
              activity: '',
              smoking: '',
              alcohol: '',
              stress: '',
              diet: ''
            },
            bmi: parsedData.bmi,
            bmiCategory: parsedData.bmiCategory,
            healthScore: parsedData.healthScore,
            recommendations: parsedData.recommendations,
            createdAt: new Date()
          };
          setResult(localResult);
          setLoading(false);
          return;
        } catch (parseError) {
          if (__DEV__) {
            console.warn('Failed to parse local data:', parseError);
          }
        }
      }

      // Fallback to AsyncStorage for saved results
      const existingResults = await AsyncStorage.getItem('quizResults');
      if (existingResults) {
        const results: QuizResult[] = JSON.parse(existingResults);
        const foundResult = results.find(r => r.id === resultId);
        if (foundResult) {
          setResult(foundResult);
        }
      }
    } catch (error) {
      console.error('Error loading quiz result:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getBMIColor = (category: string): string => {
    switch (category) {
      case 'Normal': return '#10B981';
      case 'Overweight': return '#F59E0B';
      case 'Obese': return '#EF4444';
      case 'Underweight': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const GaugeChart = ({ score }: { score: number }) => {
    const size = 200;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size} style={styles.gauge}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
            {score}
          </Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Results not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Health Score</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Congratulations */}
        <LinearGradient
          colors={['#4F46E5', '#06B6D4', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.congratsSection}
        >
          <Text style={styles.congratsTitle}>Great job, {result.data?.name || 'User'}! 🎉</Text>
          <Text style={styles.congratsSubtitle}>
            Here's your personalized health assessment
          </Text>
        </LinearGradient>

        {/* Health Score Gauge */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Your Health Score</Text>
          <GaugeChart score={result.healthScore} />
          <Text style={styles.scoreDescription}>
            Based on your lifestyle factors, BMI, and health habits
          </Text>
        </View>

        {/* BMI Section */}
        <View style={styles.bmiSection}>
          <Text style={styles.sectionTitle}>BMI Analysis</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiValue}>{result.bmi}</Text>
              <View style={[styles.bmiCategoryBadge, { backgroundColor: getBMIColor(result.bmiCategory) + '20' }]}>
                <Text style={[styles.bmiCategory, { color: getBMIColor(result.bmiCategory) }]}>
                  {result.bmiCategory}
                </Text>
              </View>
            </View>
            <Text style={styles.bmiDescription}>
              Your Body Mass Index is {result.bmi}, which falls in the {result.bmiCategory.toLowerCase()} category.
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>3 Personalized Next Steps</Text>
          <View style={styles.recommendations}>
            {result.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationNumber}>
                  <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.retakeButton}
            onPress={() => router.push('/quiz')}
          >
            <RotateCcw size={20} color="#10B981" />
            <Text style={styles.retakeButtonText}>Retake Health Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => router.push('/dashboard')}
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Chat with Ez</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This assessment is for educational purposes only and should not replace professional medical advice. 
            Always consult with healthcare professionals for medical concerns.
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  congratsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  scoreSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gauge: {
    transform: [{ rotate: '180deg' }],
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bmiSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  bmiCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  recommendations: {
    gap: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'flex-start',
  },
  recommendationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  recommendationNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retakeButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 18,
  },
});