import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export default function BackendDebugPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (name: string, status: 'pending' | 'success' | 'error', message: string) => {
    setResults(prev => [...prev, {
      name,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = React.useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check environment variables
    addResult('Environment Variables', 'pending', 'Checking...');
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      addResult('Environment Variables', 'success', `API URL: ${apiUrl}`);
    } else {
      addResult('Environment Variables', 'error', 'EXPO_PUBLIC_API_URL not set');
    }

    // Test 2: Direct backend health check
    addResult('Backend Health Check', 'pending', 'Testing...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addResult('Backend Health Check', 'success', `Status: ${response.status}, Message: ${data.message || 'OK'}`);
      } else {
        const errorText = await response.text();
        addResult('Backend Health Check', 'error', `HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      addResult('Backend Health Check', 'error', `Network Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Test 3: Alternative URLs
    const testUrls = [
      'https://zvfley8yoowhncate9z5.rork.app/api/hello',
      'https://zvfley8yoowhncate9z5.rork.app/api/env-test',
      'https://zvfley8yoowhncate9z5.rork.app/api/trpc/example.hi'
    ];

    for (const url of testUrls) {
      const testName = `Test ${url.split('/').pop()}`;
      addResult(testName, 'pending', 'Testing...');
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          addResult(testName, 'success', `Status: ${response.status}, Response: ${JSON.stringify(data).substring(0, 100)}`);
        } else {
          const errorText = await response.text();
          addResult(testName, 'error', `HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        addResult(testName, 'error', `Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    setIsRunning(false);
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backend Debug',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connectivity Debug</Text>
        <Text style={styles.subtitle}>Diagnosing connection issues</Text>
        
        <TouchableOpacity 
          style={[styles.refreshButton, isRunning && styles.refreshButtonDisabled]} 
          onPress={runTests}
          disabled={isRunning}
        >
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.refreshButtonText}>
            {isRunning ? 'Running Tests...' : 'Run Tests Again'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {results.map((result, index) => (
          <View key={`${result.name}-${index}`} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
          </View>
        ))}

        {results.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No test results yet</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Expected Backend URL</Text>
          <Text style={styles.infoText}>https://zvfley8yoowhncate9z5.rork.app/api</Text>
          
          <Text style={styles.infoTitle}>Environment</Text>
          <Text style={styles.infoText}>
            Mode: {__DEV__ ? 'Development' : 'Production'}{'\n'}
            API URL: {process.env.EXPO_PUBLIC_API_URL || 'Not Set'}
          </Text>

          <Text style={styles.infoTitle}>Common Issues</Text>
          <Text style={styles.infoText}>
            • Backend deployment may be down{'\n'}
            • URL configuration mismatch{'\n'}
            • Network connectivity issues{'\n'}
            • CORS configuration problems
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
  refreshButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  refreshButtonText: {
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
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  resultTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});