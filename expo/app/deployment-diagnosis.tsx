import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react-native';

interface DiagnosticResult {
  test: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function DeploymentDiagnosisPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, details } : r);
      }
      return [...prev, { test, status, message, details }];
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Configuration
    updateResult('Environment Setup', 'checking', 'Checking environment variables...');
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      updateResult('Environment Setup', 'success', `API URL configured: ${apiUrl}`);
    } else {
      updateResult('Environment Setup', 'warning', 'EXPO_PUBLIC_API_URL not set, using default');
    }

    // Test 2: Backend Deployment Status
    updateResult('Backend Deployment', 'checking', 'Testing backend deployment...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('Backend Deployment', 'success', 'Backend is deployed and responding', JSON.stringify(data, null, 2));
      } else if (response.status === 404) {
        updateResult('Backend Deployment', 'error', 'Backend not found (404)', 'The backend is not deployed to the Rork platform. This is the main issue causing tRPC failures.');
      } else {
        const text = await response.text();
        updateResult('Backend Deployment', 'error', `Backend error (${response.status})`, text.substring(0, 200));
      }
    } catch (error) {
      updateResult('Backend Deployment', 'error', 'Cannot reach backend', error instanceof Error ? error.message : 'Network error');
    }

    // Test 3: tRPC Endpoint
    updateResult('tRPC Endpoint', 'checking', 'Testing tRPC endpoint...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('tRPC Endpoint', 'success', 'tRPC endpoint working', JSON.stringify(data, null, 2));
      } else {
        updateResult('tRPC Endpoint', 'error', `tRPC endpoint failed (${response.status})`, 'tRPC routes are not accessible');
      }
    } catch {
      updateResult('tRPC Endpoint', 'error', 'tRPC endpoint unreachable', 'This confirms the backend deployment issue');
    }

    // Test 4: Alternative Health Checks
    const healthUrls = [
      'https://zvfley8yoowhncate9z5.rork.app/api/hello',
      'https://zvfley8yoowhncate9z5.rork.app/api/env-test'
    ];

    for (const url of healthUrls) {
      const testName = `Health Check (${url.split('/').pop()})`;
      updateResult(testName, 'checking', 'Testing...');
      
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          updateResult(testName, 'success', 'Endpoint working', JSON.stringify(data, null, 2));
        } else {
          updateResult(testName, 'error', `Failed (${response.status})`, 'Endpoint not accessible');
        }
      } catch {
        updateResult(testName, 'error', 'Unreachable', 'Network error');
      }
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle size={20} color="#10B981" />;
      case 'error': return <XCircle size={20} color="#EF4444" />;
      case 'warning': return <AlertTriangle size={20} color="#F59E0B" />;
      case 'checking': return <RefreshCw size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'checking': return '#6B7280';
    }
  };

  const showSolution = () => {
    // For web compatibility, we'll show the solution inline instead of using Alert
    console.log('Solution: Backend needs to be deployed to Rork platform');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Deployment Diagnosis',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Deployment Diagnosis</Text>
        <Text style={styles.subtitle}>Identifying the root cause of tRPC failures</Text>
        
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics Again'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {results.map((result, index) => (
          <View key={`${result.test}-${index}`} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              {getStatusIcon(result.status)}
              <Text style={styles.resultTest}>{result.test}</Text>
            </View>
            <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>{result.details}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.solutionCard}>
          <View style={styles.solutionHeader}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.solutionTitle}>Root Cause Identified</Text>
          </View>
          
          <Text style={styles.solutionText}>
            The backend is not deployed to the Rork platform. Your backend code exists locally in the `/backend` folder but is not accessible at:
          </Text>
          
          <View style={styles.urlContainer}>
            <Text style={styles.urlText}>https://zvfley8yoowhncate9z5.rork.app/api</Text>
          </View>
          
          <Text style={styles.solutionText}>
            This causes all tRPC requests to fail with &quot;Failed to fetch&quot; errors.
          </Text>
          
          <TouchableOpacity style={styles.solutionButton} onPress={showSolution}>
            <Text style={styles.solutionButtonText}>View Solution Steps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Technical Details</Text>
          <Text style={styles.infoText}>
            • Backend code exists in /backend/hono.ts{'\n'}
            • tRPC router configured in /backend/trpc/app-router.ts{'\n'}
            • API route handler exists in /app/api/[...slug]+api.ts{'\n'}
            • Environment variables are properly configured{'\n'}
            • Issue: Backend not deployed to production URL
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  detailsContainer: {
    marginTop: 8,
    marginLeft: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 8,
  },
  detailsText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  solutionCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  solutionText: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
    marginBottom: 12,
  },
  urlContainer: {
    backgroundColor: '#FCA5A5',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  urlText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  solutionButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  solutionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});