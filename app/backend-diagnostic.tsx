import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function BackendDiagnostic() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runComprehensiveDiagnostic = async () => {
    setIsLoading(true);
    setResults([]);
    
    addResult('🚀 Starting comprehensive backend diagnostic...');
    
    // Test 1: Check if we can import the Hono app
    addResult('📦 Testing Hono app import...');
    try {
      const honoModule = await import('@/backend/hono');
      addResult('✅ Hono app imported successfully');
      addResult(`📄 Hono app type: ${typeof honoModule.default}`);
    } catch (error) {
      addResult(`❌ Failed to import Hono app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Test direct Hono execution
    addResult('🔧 Testing direct Hono execution...');
    try {
      const honoModule = await import('@/backend/hono');
      const testRequest = new Request('https://test.com/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const response = await honoModule.default.fetch(testRequest);
      const text = await response.text();
      
      addResult(`✅ Direct Hono test: ${response.status} ${response.statusText}`);
      addResult(`📄 Direct Hono response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addResult(`❌ Direct Hono test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Test API route handler
    addResult('🛣️ Testing API route handler...');
    try {
      // Simulate what the API route does
      const testUrl = 'https://zvfley8yoowhncate9z5.rork.app/api/hello';
      const url = new URL(testUrl);
      const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
      const newUrl = new URL(pathWithoutApi, url.origin);
      
      addResult(`📄 Original path: ${url.pathname}`);
      addResult(`📄 Path without /api: ${pathWithoutApi}`);
      addResult(`📄 New URL: ${newUrl.toString()}`);
      
      const honoModule = await import('@/backend/hono');
      const modifiedRequest = new Request(newUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const response = await honoModule.default.fetch(modifiedRequest);
      const text = await response.text();
      
      addResult(`✅ API route simulation: ${response.status} ${response.statusText}`);
      addResult(`📄 API route response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addResult(`❌ API route simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Test actual deployed endpoint
    addResult('🌐 Testing actual deployed endpoint...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const text = await response.text();
      addResult(`✅ Deployed endpoint: ${response.status} ${response.statusText}`);
      addResult(`📄 Deployed response: ${text.substring(0, 200)}...`);
      addResult(`📄 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    } catch (error) {
      addResult(`❌ Deployed endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Test tRPC endpoint
    addResult('🔌 Testing tRPC endpoint...');
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const text = await response.text();
      addResult(`✅ tRPC endpoint: ${response.status} ${response.statusText}`);
      addResult(`📄 tRPC response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addResult(`❌ tRPC endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 6: Environment check
    addResult('🔍 Checking environment variables...');
    try {
      const envVars = {
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      };
      
      addResult(`📄 Environment variables: ${JSON.stringify(envVars, null, 2)}`);
    } catch (error) {
      addResult(`❌ Environment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    addResult('🏁 Comprehensive diagnostic complete!');
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Diagnostic' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Diagnostic Tool</Text>
        <Text style={styles.subtitle}>Comprehensive backend testing</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={runComprehensiveDiagnostic}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔄 Running Diagnostic...' : '🚀 Run Full Diagnostic'}
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
          <Text key={`diagnostic-${index}-${result.substring(0, 10)}`} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {results.length === 0 && (
          <Text style={styles.placeholderText}>
            Tap &quot;Run Full Diagnostic&quot; to start comprehensive testing
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