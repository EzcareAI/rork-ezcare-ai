import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackendTestSimple() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendHealth = async () => {
    setLoading(true);
    addResult('🔍 Testing backend health...');
    
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      addResult(`✅ Backend response status: ${response.status}`);
      addResult(`✅ Backend response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      const data = await response.json();
      addResult(`✅ Backend response data: ${JSON.stringify(data, null, 2)}`);
      
      if (response.ok) {
        addResult('🎉 Backend is working!');
        // Backend is working
      } else {
        addResult('❌ Backend returned error status');
        // Backend returned error status
      }
    } catch (error) {
      addResult(`❌ Backend test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Backend test failed
    } finally {
      setLoading(false);
    }
  };

  const testTRPCPing = async () => {
    setLoading(true);
    addResult('🔍 Testing tRPC ping...');
    
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      addResult(`✅ tRPC ping response status: ${response.status}`);
      
      const data = await response.json();
      addResult(`✅ tRPC ping response: ${JSON.stringify(data, null, 2)}`);
      
      if (response.ok) {
        addResult('🎉 tRPC is working!');
        // tRPC is working
      } else {
        addResult('❌ tRPC returned error status');
        // tRPC returned error status
      }
    } catch (error) {
      addResult(`❌ tRPC test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // tRPC test failed
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Backend Test Simple' }} />
      
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
          onPress={testTRPCPing}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test tRPC Ping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={`result-${index}-${result.slice(0, 10)}`} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {results.length === 0 && (
          <Text style={styles.placeholderText}>
            No test results yet. Click a button above to test the backend.
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
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
    marginBottom: 4,
    color: '#333',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});