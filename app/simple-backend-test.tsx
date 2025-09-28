import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function SimpleBackendTest() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testSimpleEndpoint = async () => {
    setIsLoading(true);
    setResult('Testing...');
    
    try {
      // Test the most basic endpoint
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const text = await response.text();
      
      setResult(`Status: ${response.status}\nHeaders: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\nResponse: ${text}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}\nStack: ${error instanceof Error ? error.stack : 'No stack'}`);
    }
    
    setIsLoading(false);
  };

  const testDirectHono = async () => {
    setIsLoading(true);
    setResult('Testing direct Hono...');
    
    try {
      // Import and test Hono app directly
      const app = await import('@/backend/hono');
      
      // Create a mock request
      const request = new Request('https://test.com/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const response = await app.default.fetch(request);
      const text = await response.text();
      
      setResult(`Direct Hono test:\nStatus: ${response.status}\nResponse: ${text}`);
    } catch (error) {
      setResult(`Direct Hono Error: ${error instanceof Error ? error.message : 'Unknown error'}\nStack: ${error instanceof Error ? error.stack : 'No stack'}`);
    }
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Simple Backend Test' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Simple Backend Test</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testSimpleEndpoint}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test API Endpoint'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testDirectHono}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Direct Hono'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{result || 'No test run yet'}</Text>
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
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
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
  resultContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  resultText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});