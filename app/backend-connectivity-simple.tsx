import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { testBackendConnectivity } from '@/lib/trpc-fallback';

type TestResult = {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

export default function BackendConnectivitySimple() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  const addResult = (message: string, type: TestResult['type'] = 'info') => {
    setResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const testBackend = async () => {
    setTesting(true);
    setResults([]);
    
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app/api';
    
    addResult('🔍 Starting backend connectivity test...', 'info');
    addResult(`🔍 Testing URL: ${baseUrl}`, 'info');
    
    // Test using the improved connectivity function
    const isConnected = await testBackendConnectivity(baseUrl);
    
    if (isConnected) {
      addResult('✅ Backend is accessible!', 'success');
      setBackendStatus('online');
      
      // Test tRPC endpoint if basic connectivity works
      addResult('🔍 Testing tRPC endpoint...', 'info');
      try {
        const response = await fetch(`${baseUrl}/trpc/example.hi`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ tRPC working: ${JSON.stringify(data)}`, 'success');
        } else {
          addResult(`⚠️ tRPC endpoint returned ${response.status}`, 'warning');
        }
      } catch (error) {
        addResult(`❌ tRPC test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    } else {
      addResult('❌ Backend is not accessible', 'error');
      setBackendStatus('offline');
      addResult('🚨 BACKEND DEPLOYMENT ISSUE DETECTED', 'error');
      addResult('📋 Possible causes:', 'warning');
      addResult('   • Backend not deployed to Rork platform', 'warning');
      addResult('   • Deployment failed or crashed', 'warning');
      addResult('   • Network connectivity issues', 'warning');
      addResult('   • Environment variables not configured', 'warning');
    }

    setTesting(false);
  };

  const showDeploymentHelp = () => {
    Alert.alert(
      'Backend Deployment Help',
      'The backend appears to be offline. This means:\n\n' +
      '1. The app is not deployed to the Rork platform\n' +
      '2. The deployment may have failed\n' +
      '3. Environment variables may be missing\n\n' +
      'Contact support to resolve deployment issues.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Status' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Status</Text>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            backendStatus === 'online' && styles.statusOnline,
            backendStatus === 'offline' && styles.statusOffline,
            backendStatus === 'unknown' && styles.statusUnknown
          ]} />
          <Text style={styles.statusText}>
            {backendStatus === 'online' && '✅ Backend Online'}
            {backendStatus === 'offline' && '❌ Backend Offline'}
            {backendStatus === 'unknown' && '🔍 Testing...'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, testing && styles.buttonDisabled]} 
            onPress={testBackend}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : 'Test Again'}
            </Text>
          </TouchableOpacity>
          
          {backendStatus === 'offline' && (
            <TouchableOpacity 
              style={[styles.button, styles.helpButton]} 
              onPress={showDeploymentHelp}
            >
              <Text style={styles.buttonText}>Get Help</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={[
            styles.resultItem,
            result.type === 'success' && styles.resultSuccess,
            result.type === 'error' && styles.resultError,
            result.type === 'warning' && styles.resultWarning
          ]}>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
            <Text style={styles.resultText}>{result.message}</Text>
          </View>
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
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#F44336',
  },
  statusUnknown: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
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
  helpButton: {
    backgroundColor: '#FF9800',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
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
  resultItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  resultSuccess: {
    borderLeftColor: '#4CAF50',
  },
  resultError: {
    borderLeftColor: '#F44336',
  },
  resultWarning: {
    borderLeftColor: '#FF9800',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
});