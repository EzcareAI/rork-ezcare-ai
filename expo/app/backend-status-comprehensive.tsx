import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient, checkBackendStatus } from '@/lib/trpc';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
  timestamp?: string;
}

export default function BackendStatusCheck() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    const result: TestResult = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const runComprehensiveTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Basic URL accessibility
    addResult('Basic URL Test', 'pending', 'Testing basic URL accessibility...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Basic URL Test', 'success', 'Base URL is accessible', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('Basic URL Test', 'error', `HTTP ${response.status}: ${response.statusText}`, text);
      }
    } catch (error) {
      addResult('Basic URL Test', 'error', 'Failed to access base URL', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: API endpoint
    addResult('API Endpoint Test', 'pending', 'Testing API endpoint...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('API Endpoint Test', 'success', 'API endpoint is accessible', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('API Endpoint Test', 'error', `HTTP ${response.status}: ${response.statusText}`, text);
      }
    } catch (error) {
      addResult('API Endpoint Test', 'error', 'Failed to access API endpoint', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Debug API endpoint
    addResult('Debug API Test', 'pending', 'Testing debug API endpoint...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/debug', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Debug API Test', 'success', 'Debug API is working', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('Debug API Test', 'error', `HTTP ${response.status}: ${response.statusText}`, text);
      }
    } catch (error) {
      addResult('Debug API Test', 'error', 'Failed to access debug API', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: tRPC health check
    addResult('tRPC Health Check', 'pending', 'Testing tRPC health...');
    try {
      const isHealthy = await checkBackendStatus();
      if (isHealthy) {
        addResult('tRPC Health Check', 'success', 'tRPC backend is healthy');
      } else {
        addResult('tRPC Health Check', 'error', 'tRPC backend health check failed');
      }
    } catch (error) {
      addResult('tRPC Health Check', 'error', 'tRPC health check error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: tRPC debug ping
    addResult('tRPC Debug Ping', 'pending', 'Testing tRPC debug ping...');
    try {
      const result = await trpcClient.debug.ping.query();
      addResult('tRPC Debug Ping', 'success', 'tRPC debug ping successful', JSON.stringify(result, null, 2));
    } catch (error) {
      addResult('tRPC Debug Ping', 'error', 'tRPC debug ping failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Environment variables check
    addResult('Environment Check', 'pending', 'Checking environment variables...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/env-test', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Environment Check', 'success', 'Environment variables loaded', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('Environment Check', 'error', `HTTP ${response.status}: ${response.statusText}`, text);
      }
    } catch (error) {
      addResult('Environment Check', 'error', 'Failed to check environment', error instanceof Error ? error.message : 'Unknown error');
    }

    setIsRunning(false);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(() => {
        runComprehensiveTests();
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, runComprehensiveTests]);

  const showDetails = (result: TestResult) => {
    if (result.details) {
      console.log(`${result.test} Details:`, result.details);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Status Check' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Status Diagnostics</Text>
        <Text style={styles.subtitle}>
          Comprehensive backend connectivity and deployment testing
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, isRunning && styles.buttonDisabled]}
            onPress={runComprehensiveTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.toggleButton, autoRefresh && styles.toggleActive]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <Text style={[styles.buttonText, autoRefresh && styles.toggleActiveText]}>
              {autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.results}>
          {testResults.map((result, index) => (
            <TouchableOpacity
              key={`${result.test}-${index}`}
              style={[
                styles.resultItem,
                { borderColor: getStatusColor(result.status) }
              ]}
              onPress={() => {
                if (result?.test?.trim() && result.details?.trim() && result.test.length <= 100 && result.test.length > 0) {
                  const sanitizedResult = {
                    ...result,
                    test: result.test.trim(),
                    details: result.details.trim()
                  };
                  showDetails(sanitizedResult);
                }
              }}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultStatus}>
                  {getStatusIcon(result.status)}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.timestamp && (
                <Text style={styles.resultTimestamp}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </Text>
              )}
              {result.details && (
                <Text style={styles.resultDetails}>Tap to view details in console</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Troubleshooting Guide:</Text>
          <Text style={styles.instructionItem}>
            🔍 <Text style={styles.bold}>Basic URL Test fails:</Text> App not deployed to Rork platform
          </Text>
          <Text style={styles.instructionItem}>
            🔍 <Text style={styles.bold}>API Endpoint Test fails:</Text> Backend routing misconfigured
          </Text>
          <Text style={styles.instructionItem}>
            🔍 <Text style={styles.bold}>Debug API Test fails:</Text> API routes not working
          </Text>
          <Text style={styles.instructionItem}>
            🔍 <Text style={styles.bold}>tRPC tests fail:</Text> tRPC server setup issues
          </Text>
          <Text style={styles.instructionItem}>
            🔍 <Text style={styles.bold}>Environment Check fails:</Text> Missing environment variables
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  toggleButton: {
    backgroundColor: '#666',
  },
  toggleActive: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleActiveText: {
    color: 'white',
  },
  results: {
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultStatus: {
    fontSize: 18,
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
});