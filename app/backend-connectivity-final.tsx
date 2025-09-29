import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function BackendConnectivityTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnectivity = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🔍 Starting backend connectivity test...');
      
      // Test 1: Health check
      try {
        addResult('📡 Testing health check endpoint...');
        const healthResponse = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          addResult(`✅ Health check successful: ${healthData.message}`);
        } else {
          addResult(`❌ Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
        }
      } catch (error) {
        addResult(`❌ Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test 2: Simple hello endpoint
      try {
        addResult('📡 Testing hello endpoint...');
        const helloResponse = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/hello', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (helloResponse.ok) {
          const helloData = await helloResponse.json();
          addResult(`✅ Hello endpoint successful: ${helloData.message}`);
        } else {
          addResult(`❌ Hello endpoint failed: ${helloResponse.status} ${helloResponse.statusText}`);
        }
      } catch (error) {
        addResult(`❌ Hello endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test 3: tRPC endpoint
      try {
        addResult('📡 Testing tRPC endpoint...');
        const trpcResponse = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/example.hi', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (trpcResponse.ok) {
          const trpcData = await trpcResponse.json();
          addResult(`✅ tRPC endpoint successful: ${JSON.stringify(trpcData)}`);
        } else {
          addResult(`❌ tRPC endpoint failed: ${trpcResponse.status} ${trpcResponse.statusText}`);
        }
      } catch (error) {
        addResult(`❌ tRPC endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      addResult('🏁 Backend connectivity test completed');
    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testBackendConnectivity}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Run Test Again'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
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
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
});