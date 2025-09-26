import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function SimpleTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, `${timestamp}: ${result}`]);
    console.log(`${timestamp}: ${result}`);
  };

  const testBasicConnectivity = async () => {
    setIsLoading(true);
    addResult('🔍 Starting basic connectivity test...');
    
    try {
      // Test 1: Basic network connectivity
      addResult('Testing basic network connectivity...');
      const networkResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (networkResponse.ok) {
        addResult('✅ Basic network connectivity: OK');
      } else {
        addResult(`❌ Basic network connectivity failed: ${networkResponse.status}`);
      }
      
      // Test 2: Backend health check
      addResult('Testing backend health...');
      const backendUrl = 'https://zvfley8yoowhncate9z5.rork.app/api';
      
      const backendResponse = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      addResult(`Backend response status: ${backendResponse.status}`);
      addResult(`Backend response headers: ${JSON.stringify(Object.fromEntries(backendResponse.headers.entries()))}`);
      
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        addResult(`✅ Backend health: ${JSON.stringify(data)}`);
      } else {
        const errorText = await backendResponse.text();
        addResult(`❌ Backend health failed: ${backendResponse.status} - ${errorText}`);
      }
      
      // Test 3: Backend hello endpoint
      addResult('Testing backend hello endpoint...');
      const helloResponse = await fetch(`${backendUrl}/hello`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (helloResponse.ok) {
        const helloData = await helloResponse.json();
        addResult(`✅ Backend hello: ${JSON.stringify(helloData)}`);
      } else {
        const helloError = await helloResponse.text();
        addResult(`❌ Backend hello failed: ${helloResponse.status} - ${helloError}`);
      }
      
      // Test 4: tRPC endpoint directly
      addResult('Testing tRPC endpoint directly...');
      const trpcUrl = `${backendUrl}/trpc/debug.ping`;
      
      const trpcResponse = await fetch(trpcUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      addResult(`tRPC response status: ${trpcResponse.status}`);
      addResult(`tRPC response headers: ${JSON.stringify(Object.fromEntries(trpcResponse.headers.entries()))}`);
      
      if (trpcResponse.ok) {
        const trpcData = await trpcResponse.json();
        addResult(`✅ tRPC direct: ${JSON.stringify(trpcData)}`);
      } else {
        const trpcError = await trpcResponse.text();
        addResult(`❌ tRPC direct failed: ${trpcResponse.status} - ${trpcError}`);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        addResult(`❌ Test failed: ${error.message}`);
        if (error.name === 'AbortError') {
          addResult('❌ Request timed out');
        }
      } else {
        addResult(`❌ Test failed: ${String(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testTRPCClient = async () => {
    setIsLoading(true);
    addResult('🔍 Testing tRPC client...');
    
    try {
      // Import tRPC client dynamically to avoid initialization issues
      const { trpcClient } = await import('@/lib/trpc');
      
      addResult('Testing tRPC debug ping...');
      const result = await trpcClient.debug.ping.query();
      addResult(`✅ tRPC client ping: ${JSON.stringify(result)}`);
      
      addResult('Testing tRPC example.hi...');
      const hiResult = await trpcClient.example.hi.query();
      addResult(`✅ tRPC client hi: ${JSON.stringify(hiResult)}`);
      
    } catch (error) {
      if (error instanceof Error) {
        addResult(`❌ tRPC client failed: ${error.message}`);
        addResult(`Error stack: ${error.stack?.substring(0, 200) || 'No stack'}`);
      } else {
        addResult(`❌ tRPC client failed: ${String(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Simple Network Test</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testBasicConnectivity}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Basic Connectivity</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testTRPCClient}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test tRPC Client</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearResults}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet</Text>
          ) : (
            results.map((result, index) => (
              <View key={`result-${index}`} style={styles.resultItem}>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  noResults: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  resultItem: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#1F2937',
    fontFamily: 'monospace',
  },
});