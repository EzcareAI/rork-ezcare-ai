import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { checkBackendStatus, createFallbackClient } from '@/lib/trpc';

export default function BackendStatusSimple() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testBackend = useCallback(async () => {
    setTesting(true);
    setLogs([]);
    setStatus('checking');
    
    addLog('🔍 Starting backend connectivity test...');
    
    try {
      // Test basic connectivity
      addLog('📡 Testing backend connectivity...');
      const isOnline = await checkBackendStatus();
      
      if (isOnline) {
        setStatus('online');
        addLog('✅ Backend is ONLINE and accessible');
        addLog('✅ All features should work normally');
      } else {
        setStatus('offline');
        addLog('❌ Backend is OFFLINE or not deployed');
        addLog('🔄 App will use fallback/mock mode');
        addLog('ℹ️ Some features may be limited');
        
        // Test fallback client
        addLog('🧪 Testing fallback client...');
        const fallbackClient = createFallbackClient();
        const mockResult = await fallbackClient.example.hi.query();
        addLog(`✅ Fallback client working: ${mockResult.message}`);
      }
    } catch (error) {
      setStatus('offline');
      addLog(`❌ Error during test: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog('🔄 Falling back to offline mode');
    }
    
    setTesting(false);
  }, []);

  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  useEffect(() => {
    testBackend();
  }, [testBackend]);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#FF9800';
      case 'checking': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Backend Online ✅';
      case 'offline': return 'Backend Offline (Using Fallback) 🔄';
      case 'checking': return 'Checking Backend Status... 🔍';
      default: return 'Unknown Status';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Status' }} />
      
      <View style={styles.header}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, testing && styles.buttonDisabled]} 
            onPress={testBackend}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : 'Test Again'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.infoButton]} 
            onPress={toggleInfo}
          >
            <Text style={styles.buttonText}>{showInfo ? 'Hide Info' : 'Show Info'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Summary</Text>
        {status === 'online' && (
          <Text style={styles.summaryText}>
            ✅ Backend is working correctly. All features are available.
          </Text>
        )}
        {status === 'offline' && (
          <Text style={styles.summaryText}>
            🔄 Backend is not accessible. The app is running in fallback mode with mock data. 
            Some features like user accounts and data persistence may be limited.
          </Text>
        )}
        {status === 'checking' && (
          <Text style={styles.summaryText}>
            🔍 Checking backend connectivity...
          </Text>
        )}
        
        {showInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Status Details:</Text>
            <Text style={styles.infoText}>
              • ONLINE: Backend is deployed and accessible{"\n"}
              • OFFLINE: Backend not deployed, using mock data{"\n"}
              • The app works in both modes{"\n"}
              • Some features may be limited in offline mode
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.logs}>
        <Text style={styles.logsTitle}>Test Logs</Text>
        {logs.map((log, index) => (
          <Text key={`log-${index}-${log.slice(0, 10)}`} style={styles.logText}>
            {log}
          </Text>
        ))}
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
    alignItems: 'center',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  infoButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  infoBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#555',
  },
  logs: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    paddingBottom: 10,
    color: '#333',
  },
  logText: {
    fontSize: 12,
    marginBottom: 5,
    paddingHorizontal: 15,
    fontFamily: 'monospace',
    color: '#555',
  },
});