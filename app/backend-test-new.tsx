import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function BackendTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendHealth = async () => {
    setLoading(true);
    addResult('🔍 Testing backend health...');
    
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://zvfley8yoowhncate9z5.rork.app';
      const response = await fetch(`${baseUrl}/api/`);
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ Backend health check passed: ${data.message}`);
        addResult(`📊 Environment: ${JSON.stringify(data.environment, null, 2)}`);
      } else {
        addResult(`❌ Backend health check failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Backend health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const testTrpcPing = async () => {
    setLoading(true);
    addResult('🔍 Testing tRPC ping...');
    
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://zvfley8yoowhncate9z5.rork.app';
      const url = `${baseUrl}/api/trpc/debug.ping`;
      addResult(`📡 Calling: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ tRPC ping successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        addResult(`❌ tRPC ping failed: ${response.status} ${response.statusText}`);
        addResult(`📄 Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(`❌ tRPC ping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const testTrpcHi = async () => {
    setLoading(true);
    addResult('🔍 Testing tRPC hi endpoint...');
    
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://zvfley8yoowhncate9z5.rork.app';
      const url = `${baseUrl}/api/trpc/example.hi`;
      addResult(`📡 Calling: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ tRPC hi successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        addResult(`❌ tRPC hi failed: ${response.status} ${response.statusText}`);
        addResult(`📄 Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      addResult(`❌ tRPC hi error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Test' }} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testBackendHealth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Backend Health</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testTrpcPing}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test tRPC Ping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testTrpcHi}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test tRPC Hi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.clearButton, loading && styles.buttonDisabled]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {results.length === 0 && (
          <Text style={styles.placeholderText}>
            Tap a button above to test the backend connection
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
    lineHeight: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});