import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function BackendConnectivityCheck() {
  const [results, setResults] = useState<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: any;
  }[]>([]);

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const runTests = useCallback(async () => {
    setResults([]);
    
    // Test 1: Basic fetch to root
    try {
      addResult('Root Endpoint', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      const text = await response.text();
      addResult('Root Endpoint', response.ok ? 'success' : 'error', 
        `Status: ${response.status} ${response.statusText}`, 
        { responseText: text.substring(0, 500) }
      );
    } catch (error) {
      addResult('Root Endpoint', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Health check endpoint
    try {
      addResult('Health Check', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/hello', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      const text = await response.text();
      addResult('Health Check', response.ok ? 'success' : 'error', 
        `Status: ${response.status} ${response.statusText}`, 
        { responseText: text }
      );
    } catch (error) {
      addResult('Health Check', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: tRPC endpoint
    try {
      addResult('tRPC Endpoint', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      const text = await response.text();
      addResult('tRPC Endpoint', response.ok ? 'success' : 'error', 
        `Status: ${response.status} ${response.statusText}`, 
        { responseText: text }
      );
    } catch (error) {
      addResult('tRPC Endpoint', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Environment variables
    addResult('Environment Check', 'success', 'Checking environment variables', {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    });

    // Test 5: Direct domain check
    try {
      addResult('Domain Check', 'pending', 'Testing...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      const text = await response.text();
      addResult('Domain Check', response.ok ? 'success' : 'error', 
        `Status: ${response.status} ${response.statusText}`, 
        { responseText: text.substring(0, 500) }
      );
    } catch (error) {
      addResult('Domain Check', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const copyResults = () => {
    const resultsText = results.map(r => 
      `${r.test}: ${r.status} - ${r.message}${r.details ? '\nDetails: ' + JSON.stringify(r.details, null, 2) : ''}`
    ).join('\n\n');
    
    console.log('Results copied to console');
    console.log('=== BACKEND CONNECTIVITY TEST RESULTS ===');
    console.log(resultsText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Connectivity Check' }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Backend Connectivity Diagnostics</Text>
          <Text style={styles.subtitle}>Testing: https://zvfley8yoowhncate9z5.rork.app/api</Text>
        </View>

        {results.map((result) => (
          <View key={`${result.test}-${result.status}`} style={[styles.testResult, 
            result.status === 'success' ? styles.success : 
            result.status === 'error' ? styles.error : styles.pending
          ]}>
            <Text style={styles.testName}>{result.test}</Text>
            <Text style={styles.testStatus}>{result.status.toUpperCase()}</Text>
            <Text style={styles.testMessage}>{result.message}</Text>
            {result.details && (
              <Text style={styles.testDetails}>
                {JSON.stringify(result.details, null, 2)}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={runTests}>
          <Text style={styles.buttonText}>Run Tests Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={copyResults}>
          <Text style={styles.buttonText}>Copy Results to Console</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  testResult: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  success: {
    borderLeftColor: '#4CAF50',
  },
  error: {
    borderLeftColor: '#F44336',
  },
  pending: {
    borderLeftColor: '#FF9800',
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  testDetails: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});