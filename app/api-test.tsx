import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApiTestScreen() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEndpoint = async (url: string, description: string) => {
    try {
      addResult(`🔍 Testing ${description}: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const text = await response.text();
      addResult(`✅ ${description} - Status: ${response.status}`);
      addResult(`📄 Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
    } catch (error) {
      addResult(`❌ ${description} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    
    // Test different endpoints
    await testEndpoint(`${baseUrl}`, 'Root endpoint');
    await testEndpoint(`${baseUrl}/api`, 'API root');
    await testEndpoint(`${baseUrl}/api/hello`, 'API hello');
    await testEndpoint(`${baseUrl}/api/env-test`, 'API env test');
    await testEndpoint(`${baseUrl}/api/trpc/debug.ping`, 'tRPC ping');
    
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connectivity Test</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Run Tests'}
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
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#333',
  },
});