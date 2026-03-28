import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function BackendFixTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendEndpoints = async () => {
    setIsLoading(true);
    setResults([]);
    
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    
    // Test 1: Basic connectivity
    addResult('🔍 Testing basic connectivity...');
    try {
      const response = await fetch(`${baseUrl}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      addResult(`✅ Base URL (${baseUrl}): ${response.status} ${response.statusText}`);
      const text = await response.text();
      addResult(`📄 Response preview: ${text.substring(0, 100)}...`);
    } catch (error) {
      addResult(`❌ Base URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: API endpoint
    addResult('🔍 Testing /api endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      addResult(`✅ API endpoint: ${response.status} ${response.statusText}`);
      const text = await response.text();
      addResult(`📄 API Response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addResult(`❌ API endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Health check
    addResult('🔍 Testing health check...');
    try {
      const response = await fetch(`${baseUrl}/api/hello`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      addResult(`✅ Health check: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        addResult(`📄 Health data: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: tRPC endpoint
    addResult('🔍 Testing tRPC endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/trpc/debug.ping`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      addResult(`✅ tRPC ping: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        addResult(`📄 tRPC data: ${JSON.stringify(data)}`);
      } else {
        const text = await response.text();
        addResult(`📄 tRPC error: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      addResult(`❌ tRPC ping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Environment test
    addResult('🔍 Testing environment endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/env-test`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      addResult(`✅ Environment test: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        addResult(`📄 Environment: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(`❌ Environment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsLoading(false);
    addResult('🏁 Backend diagnostic complete!');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Fix Test' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connectivity Test</Text>
        <Text style={styles.subtitle}>Testing: https://zvfley8yoowhncate9z5.rork.app</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testBackendEndpoints}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔄 Testing...' : '🚀 Run Backend Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={`result-${index}-${result.substring(0, 10)}`} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {results.length === 0 && (
          <Text style={styles.placeholderText}>
            Tap &quot;Run Backend Test&quot; to start diagnostics
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  resultText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    lineHeight: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
});