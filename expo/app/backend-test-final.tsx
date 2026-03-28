import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackendTestFinal() {
  const insets = useSafeAreaInsets();
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: string;
  }[]>([]);

  const addResult = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    setTestResults(prev => [...prev, { name, status, message, details }]);
  };

  const runTests = useCallback(async () => {
    setTestResults([]);
    
    // Test 1: Basic health check
    try {
      addResult('Health Check', 'pending', 'Testing basic connectivity...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Health Check', 'success', 'Backend is accessible', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('Health Check', 'error', `HTTP ${response.status}`, text);
      }
    } catch (error) {
      addResult('Health Check', 'error', 'Connection failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: tRPC ping
    try {
      addResult('tRPC Ping', 'pending', 'Testing tRPC connection...');
      const result = await trpcClient.debug.ping.query();
      addResult('tRPC Ping', 'success', 'tRPC is working', JSON.stringify(result, null, 2));
    } catch (error) {
      addResult('tRPC Ping', 'error', 'tRPC failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Example route
    try {
      addResult('Example Route', 'pending', 'Testing example route...');
      const result = await trpcClient.example.hi.query();
      addResult('Example Route', 'success', 'Example route working', JSON.stringify(result, null, 2));
    } catch (error) {
      addResult('Example Route', 'error', 'Example route failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Direct tRPC URL test
    try {
      addResult('Direct tRPC', 'pending', 'Testing direct tRPC URL...');
      const response = await fetch('https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Direct tRPC', 'success', 'Direct tRPC URL works', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        addResult('Direct tRPC', 'error', `HTTP ${response.status}`, text);
      }
    } catch (error) {
      addResult('Direct tRPC', 'error', 'Direct tRPC failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Backend Test Final' }} />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Backend Connectivity Test</Text>
        <Text style={styles.subtitle}>Testing: https://zvfley8yoowhncate9z5.rork.app/api</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={runTests}>
          <Text style={styles.retryButtonText}>Run Tests Again</Text>
        </TouchableOpacity>

        {testResults.map((result, index) => (
          <View key={`${result.name}-${index}`} style={styles.testResult}>
            <View style={styles.testHeader}>
              <Text style={styles.testIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.testName}>{result.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
                <Text style={styles.statusText}>{result.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.testMessage}>{result.message}</Text>
            
            {result.details && (
              <TouchableOpacity 
                style={styles.detailsContainer}
                onPress={() => Alert.alert('Details', result.details)}
              >
                <Text style={styles.detailsText} numberOfLines={3}>
                  {result.details}
                </Text>
                <Text style={styles.tapToExpand}>Tap to expand</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {testResults.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  testResult: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  testMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: 'monospace',
  },
  tapToExpand: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});