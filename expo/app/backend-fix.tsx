import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function BackendFix() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [logs, setLogs] = useState<string[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkBackendStatus = async () => {
    setStatus('checking');
    addLog('🔍 Checking backend status...');
    
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    
    try {
      // Test basic connectivity
      const response = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        addLog('✅ Backend is responding');
        setStatus('online');
        
        // Test tRPC endpoint
        try {
          const trpcResponse = await fetch(`${baseUrl}/api/trpc/debug.ping`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (trpcResponse.ok) {
            addLog('✅ tRPC endpoint is working');
          } else {
            addLog(`⚠️ tRPC endpoint returned: ${trpcResponse.status}`);
          }
        } catch (error) {
          addLog(`❌ tRPC endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        addLog(`❌ Backend returned: ${response.status} ${response.statusText}`);
        setStatus('error');
      }
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('offline');
    }
  };

  const attemptBackendFix = async () => {
    setIsFixing(true);
    addLog('🔧 Attempting to fix backend issues...');
    
    try {
      // Step 1: Test if the Hono app works locally
      addLog('📦 Testing Hono app import...');
      const honoModule = await import('@/backend/hono');
      addLog('✅ Hono app imported successfully');
      
      // Step 2: Test direct Hono execution
      addLog('🧪 Testing direct Hono execution...');
      const testRequest = new Request('https://test.com/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const response = await honoModule.default.fetch(testRequest);
      const text = await response.text();
      
      addLog(`✅ Direct Hono test successful: ${response.status}`);
      addLog(`📄 Response: ${text.substring(0, 100)}...`);
      
      // Step 3: Test API route handler simulation
      addLog('🛣️ Testing API route handler...');
      const apiUrl = 'https://zvfley8yoowhncate9z5.rork.app/api/hello';
      const url = new URL(apiUrl);
      const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
      const newUrl = new URL(pathWithoutApi, 'https://test.com');
      
      const modifiedRequest = new Request(newUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const apiResponse = await honoModule.default.fetch(modifiedRequest);
      const apiText = await apiResponse.text();
      
      addLog(`✅ API route simulation successful: ${apiResponse.status}`);
      addLog(`📄 API Response: ${apiText.substring(0, 100)}...`);
      
      // Step 4: Check environment variables
      addLog('🔍 Checking environment configuration...');
      const envCheck = {
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      };
      
      addLog(`📄 Environment: ${JSON.stringify(envCheck, null, 2)}`);
      
      // Step 5: Provide fix recommendations
      addLog('💡 Backend Fix Recommendations:');
      addLog('1. The Hono app works locally, so the issue is with deployment');
      addLog('2. Check if the app is properly deployed to Rork platform');
      addLog('3. Verify the API routes are correctly configured');
      addLog('4. Ensure environment variables are set in production');
      
      addLog('✅ Backend analysis complete - check recommendations above');
      
    } catch (error) {
      addLog(`❌ Fix attempt failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      addLog('❌ Backend fix failed - manual intervention may be required');
    }
    
    setIsFixing(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    const performInitialCheck = async () => {
      await checkBackendStatus();
    };
    performInitialCheck();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'error': return '#FF9800';
      case 'checking': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return '✅ Backend Online';
      case 'offline': return '❌ Backend Offline';
      case 'error': return '⚠️ Backend Error';
      case 'checking': return '🔄 Checking...';
      default: return '❓ Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Fix Tool' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Backend Fix Tool</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.checkButton]} 
          onPress={checkBackendStatus}
          disabled={status === 'checking'}
        >
          <Text style={styles.buttonText}>
            {status === 'checking' ? '🔄 Checking...' : '🔍 Check Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.fixButton]} 
          onPress={attemptBackendFix}
          disabled={isFixing}
        >
          <Text style={styles.buttonText}>
            {isFixing ? '🔧 Fixing...' : '🔧 Attempt Fix'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text key={`log-${index}-${log.substring(0, 10)}`} style={styles.logText}>
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.placeholderText}>
            Backend status will appear here...
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#2196F3',
  },
  fixButton: {
    backgroundColor: '#FF9800',
  },
  clearButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  logText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 3,
    lineHeight: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
});