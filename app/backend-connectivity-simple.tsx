import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';

export default function BackendConnectivitySimple() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnectivity = async () => {
    setTesting(true);
    setResults([]);
    
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    
    // Test 1: Basic health check
    addResult('🔍 Testing basic health check...');
    try {
      const response = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      addResult(`✅ Health check response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Health check data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addResult(`❌ Health check error: ${text}`);
      }
    } catch (error) {
      addResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Simple endpoint
    addResult('🔍 Testing simple endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/hello`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      addResult(`✅ Hello endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Hello endpoint data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addResult(`❌ Hello endpoint error: ${text}`);
      }
    } catch (error) {
      addResult(`❌ Hello endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: tRPC endpoint
    addResult('🔍 Testing tRPC endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/trpc/example.hi`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      addResult(`✅ tRPC endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ tRPC endpoint data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addResult(`❌ tRPC endpoint error: ${text}`);
      }
    } catch (error) {
      addResult(`❌ tRPC endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTesting(false);
  };

  useEffect(() => {
    testBackendConnectivity();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Connectivity Test' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connectivity Test</Text>
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testBackendConnectivity}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Test Again'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
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
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
    padding: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
});