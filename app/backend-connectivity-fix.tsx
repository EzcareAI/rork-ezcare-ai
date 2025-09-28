import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export default function BackendConnectivityFix() {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  const updateResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const testBackendConnectivity = async () => {
    setTesting(true);
    setResults([]);
    setBackendStatus('unknown');

    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    const apiUrl = `${baseUrl}/api`;

    // Test 1: Basic connectivity
    updateResult('connectivity', 'pending', 'Testing basic connectivity...');
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('connectivity', 'success', `Connected successfully (${response.status})`, JSON.stringify(data, null, 2));
        setBackendStatus('online');
      } else {
        const text = await response.text();
        updateResult('connectivity', 'error', `HTTP ${response.status}: ${response.statusText}`, text);
        setBackendStatus('offline');
      }
    } catch (error) {
      updateResult('connectivity', 'error', 'Connection failed', error instanceof Error ? error.message : 'Unknown error');
      setBackendStatus('offline');
    }

    // Test 2: Health endpoint
    updateResult('health', 'pending', 'Testing health endpoint...');
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('health', 'success', 'Health check passed', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        updateResult('health', 'error', `Health check failed (${response.status})`, text);
      }
    } catch (error) {
      updateResult('health', 'error', 'Health endpoint unreachable', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Simple endpoint
    updateResult('simple', 'pending', 'Testing simple endpoint...');
    try {
      const response = await fetch(`${apiUrl}/hello`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('simple', 'success', 'Simple endpoint working', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        updateResult('simple', 'error', `Simple endpoint failed (${response.status})`, text);
      }
    } catch (error) {
      updateResult('simple', 'error', 'Simple endpoint unreachable', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: tRPC endpoint
    updateResult('trpc', 'pending', 'Testing tRPC endpoint...');
    try {
      const response = await fetch(`${apiUrl}/trpc/example.hi`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('trpc', 'success', 'tRPC endpoint working', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        updateResult('trpc', 'error', `tRPC endpoint failed (${response.status})`, text);
      }
    } catch (error) {
      updateResult('trpc', 'error', 'tRPC endpoint unreachable', error instanceof Error ? error.message : 'Unknown error');
    }

    setTesting(false);
  };

  const showDiagnostics = () => {
    const diagnostics = [
      '🔍 Backend URL: https://zvfley8yoowhncate9z5.rork.app/api',
      '🔍 Environment: ' + (process.env.NODE_ENV || 'unknown'),
      '🔍 API URL from env: ' + (process.env.EXPO_PUBLIC_API_URL || 'not set'),
      '🔍 Platform: ' + (typeof window !== 'undefined' ? 'web' : 'native'),
      '🔍 Current status: ' + backendStatus,
    ];

    Alert.alert(
      'Backend Diagnostics',
      diagnostics.join('\n'),
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    testBackendConnectivity();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Backend Connectivity Fix', headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connectivity Fix</Text>
        <Text style={styles.subtitle}>
          Status: <Text style={[styles.status, { color: backendStatus === 'online' ? '#4CAF50' : backendStatus === 'offline' ? '#F44336' : '#FF9800' }]}>
            {backendStatus.toUpperCase()}
          </Text>
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, testing && styles.buttonDisabled]} 
            onPress={testBackendConnectivity}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : 'Test Again'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={showDiagnostics}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Diagnostics
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={result.name} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.resultName}>{result.name.toUpperCase()}</Text>
              <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                {result.status.toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.resultMessage}>{result.message}</Text>
            
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Details:</Text>
                <Text style={styles.detailsText}>{result.details}</Text>
              </View>
            )}
          </View>
        ))}

        {results.length === 0 && !testing && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tests run yet</Text>
          </View>
        )}

        {backendStatus === 'offline' && (
          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>🚨 Backend is Offline</Text>
            <Text style={styles.troubleshootText}>
              The backend deployment appears to be inaccessible. This could mean:
            </Text>
            <Text style={styles.troubleshootItem}>• The backend is not deployed to Rork platform</Text>
            <Text style={styles.troubleshootItem}>• The deployment failed or crashed</Text>
            <Text style={styles.troubleshootItem}>• Network connectivity issues</Text>
            <Text style={styles.troubleshootItem}>• Backend configuration problems</Text>
            
            <Text style={styles.troubleshootText}>
              {'\n'}Contact support to resolve backend deployment issues.
            </Text>
          </View>
        )}
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  status: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  results: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  troubleshootCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  troubleshootTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
  },
  troubleshootItem: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    marginBottom: 4,
  },
});