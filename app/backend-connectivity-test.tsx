import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

export default function BackendConnectivityTest() {
  const [testResults, setTestResults] = useState<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: string;
  }[]>([]);

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runConnectivityTests = useCallback(async () => {
    setTestResults([]);
    
    // Test 1: Direct fetch to backend root
    try {
      addTestResult('Direct Backend Root', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult('Direct Backend Root', 'success', `Status: ${response.status}, Message: ${data.message || 'OK'}`);
      } else {
        const errorText = await response.text();
        addTestResult('Direct Backend Root', 'error', `Status: ${response.status}, Error: ${errorText}`);
      }
    } catch (error) {
      addTestResult('Direct Backend Root', 'error', `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Direct fetch to backend hello endpoint
    try {
      addTestResult('Backend Hello Endpoint', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/hello', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult('Backend Hello Endpoint', 'success', `Status: ${response.status}, Message: ${data.message || 'OK'}`);
      } else {
        const errorText = await response.text();
        addTestResult('Backend Hello Endpoint', 'error', `Status: ${response.status}, Error: ${errorText}`);
      }
    } catch (error) {
      addTestResult('Backend Hello Endpoint', 'error', `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: tRPC client test
    try {
      addTestResult('tRPC Client Test', 'pending', 'Testing...');
      const result = await trpcClient.example.hi.query();
      addTestResult('tRPC Client Test', 'success', `tRPC Response: ${JSON.stringify(result)}`);
    } catch (error) {
      addTestResult('tRPC Client Test', 'error', `tRPC Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Environment variables check
    addTestResult('Environment Check', 'success', `API URL: ${process.env.EXPO_PUBLIC_API_URL || 'NOT SET'}`);
  }, []);

  useEffect(() => {
    runConnectivityTests();
  }, [runConnectivityTests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#757575';
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
          title: 'Backend Connectivity Test',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Backend Connectivity Test</Text>
          <Text style={styles.subtitle}>Testing connection to backend services</Text>
        </View>

        <TouchableOpacity style={styles.retestButton} onPress={runConnectivityTests}>
          <Text style={styles.retestButtonText}>Run Tests Again</Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {testResults.map((result, index) => (
            <View key={`${result.test}-${index}`} style={[styles.testResult, { borderLeftColor: getStatusColor(result.status) }]}>
              <View style={styles.testHeader}>
                <Text style={styles.testIcon}>{getStatusIcon(result.status)}</Text>
                <Text style={styles.testName}>{result.test}</Text>
                <Text style={styles.timestamp}>{result.timestamp}</Text>
              </View>
              <Text style={[styles.testMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Debug Information</Text>
          <Text style={styles.infoText}>Expected Backend URL: https://zvfley8yoowhncate9z5.rork.app/api</Text>
          <Text style={styles.infoText}>Environment: {__DEV__ ? 'Development' : 'Production'}</Text>
          <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retestButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  retestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  testResult: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  testMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});