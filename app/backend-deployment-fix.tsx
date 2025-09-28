import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function BackendDeploymentFix() {
  const [testResults, setTestResults] = useState<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: string;
  }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    setTestResults(prev => [...prev, { test, status, message, details }]);
  };

  const runDeploymentTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check if the deployed URL is accessible
    try {
      addResult('URL Access', 'pending', 'Testing deployed URL...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('URL Access', 'success', 'Deployed URL is accessible', JSON.stringify(data, null, 2));
      } else {
        addResult('URL Access', 'error', `HTTP ${response.status}: ${response.statusText}`, await response.text());
      }
    } catch (error) {
      addResult('URL Access', 'error', 'Failed to access deployed URL', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Check API endpoint
    try {
      addResult('API Endpoint', 'pending', 'Testing API endpoint...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('API Endpoint', 'success', 'API endpoint is accessible', JSON.stringify(data, null, 2));
      } else {
        addResult('API Endpoint', 'error', `HTTP ${response.status}: ${response.statusText}`, await response.text());
      }
    } catch (error) {
      addResult('API Endpoint', 'error', 'Failed to access API endpoint', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Check tRPC endpoint
    try {
      addResult('tRPC Endpoint', 'pending', 'Testing tRPC endpoint...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('tRPC Endpoint', 'success', 'tRPC endpoint is accessible', JSON.stringify(data, null, 2));
      } else {
        addResult('tRPC Endpoint', 'error', `HTTP ${response.status}: ${response.statusText}`, await response.text());
      }
    } catch (error) {
      addResult('tRPC Endpoint', 'error', 'Failed to access tRPC endpoint', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Environment variables check
    try {
      addResult('Environment Check', 'pending', 'Checking environment variables...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/env-test', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Environment Check', 'success', 'Environment variables loaded', JSON.stringify(data, null, 2));
      } else {
        addResult('Environment Check', 'error', `HTTP ${response.status}: ${response.statusText}`, await response.text());
      }
    } catch (error) {
      addResult('Environment Check', 'error', 'Failed to check environment', error instanceof Error ? error.message : 'Unknown error');
    }

    setIsRunning(false);
  };

  const showDetails = (result: typeof testResults[0]) => {
    if (result.details) {
      console.log(`${result.test} Details:`, result.details);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Deployment Fix' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Deployment Diagnostics</Text>
        <Text style={styles.subtitle}>
          This tool will help diagnose and fix backend deployment issues
        </Text>

        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runDeploymentTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run Deployment Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.results}>
          {testResults.map((result, index) => (
            <TouchableOpacity
              key={`${result.test}-${index}`}
              style={[
                styles.resultItem,
                result.status === 'success' && styles.resultSuccess,
                result.status === 'error' && styles.resultError,
                result.status === 'pending' && styles.resultPending,
              ]}
              onPress={() => {
                if (result?.test?.trim() && result.details?.trim() && result.test.length <= 100) {
                  showDetails(result);
                }
              }}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={[
                  styles.resultStatus,
                  result.status === 'success' && styles.statusSuccess,
                  result.status === 'error' && styles.statusError,
                  result.status === 'pending' && styles.statusPending,
                ]}>
                  {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>Tap to view details</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Common Issues & Solutions:</Text>
          <Text style={styles.instructionItem}>
            • If URL Access fails: The app may not be deployed to Rork platform
          </Text>
          <Text style={styles.instructionItem}>
            • If API Endpoint fails: Backend routing may be misconfigured
          </Text>
          <Text style={styles.instructionItem}>
            • If tRPC Endpoint fails: tRPC server setup may have issues
          </Text>
          <Text style={styles.instructionItem}>
            • If Environment Check fails: Environment variables may be missing
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
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  resultError: {
    borderColor: '#f44336',
    backgroundColor: '#fff8f8',
  },
  resultPending: {
    borderColor: '#ff9800',
    backgroundColor: '#fffaf0',
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
  },
  resultStatus: {
    fontSize: 18,
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusError: {
    color: '#f44336',
  },
  statusPending: {
    color: '#ff9800',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
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
});