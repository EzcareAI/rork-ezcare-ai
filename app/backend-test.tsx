import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';

export default function BackendTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBackendHealth = async () => {
    setIsLoading(true);
    addResult('Testing backend health...');
    
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/');
      const data = await response.json();
      addResult(`✅ Backend health: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Backend health failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testTRPCPing = async () => {
    setIsLoading(true);
    addResult('Testing tRPC ping...');
    
    try {
      const result = await trpcClient.debug.ping.query();
      addResult(`✅ tRPC ping: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult(`❌ tRPC ping failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testStripeEndpoint = async () => {
    setIsLoading(true);
    addResult('Testing Stripe endpoint...');
    
    try {
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/env-test');
      const data = await response.json();
      addResult(`✅ Environment test: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Environment test failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Backend Test</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testBackendHealth}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Backend Health</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testTRPCPing}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test tRPC Ping</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testStripeEndpoint}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Environment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.clearButton]} 
            onPress={clearResults}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet</Text>
          ) : (
            testResults.map((result, index) => (
              <View key={`result-${index}-${result.slice(0, 10)}`} style={styles.resultItem}>
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