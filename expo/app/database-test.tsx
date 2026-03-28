import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import { useAuth } from '@/contexts/auth-context';

export default function DatabaseTestPage() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [trpcStripeResult, setTrpcStripeResult] = useState<any>(null);
  const [trpcStripeLoading, setTrpcStripeLoading] = useState(false);

  const runDatabaseTest = async () => {
    setIsLoading(true);
    try {
      const results: any = {
        envVars: {
          EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'DEFINED' : 'UNDEFINED',
          EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'UNDEFINED',
          EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'UNDEFINED'
        }
      };
      
      // Test API endpoints
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8081');
      console.log('Testing API connectivity to:', baseUrl);
      console.log('Full API URL would be:', `${baseUrl}/api`);
      
      try {
        const healthResponse = await fetch(`${baseUrl}/api`);
        results.apiRoot = await healthResponse.json();
      } catch (error) {
        results.apiRoot = { error: error instanceof Error ? error.message : 'Failed to fetch' };
      }
      
      try {
        const helloResponse = await fetch(`${baseUrl}/api/hello`);
        results.apiHello = await helloResponse.json();
      } catch (error) {
        results.apiHello = { error: error instanceof Error ? error.message : 'Failed to fetch' };
      }
      
      try {
        const envResponse = await fetch(`${baseUrl}/api/env-test`);
        results.apiEnvTest = await envResponse.json();
      } catch (error) {
        results.apiEnvTest = { error: error instanceof Error ? error.message : 'Failed to fetch' };
      }
      
      // Test tRPC
      try {
        console.log('Testing tRPC connection...');
        const tRPCResult = await trpcClient.example.hi.query();
        results.tRPC = { success: true, data: tRPCResult };
        console.log('tRPC result:', tRPCResult);
      } catch (error) {
        console.error('tRPC error details:', error);
        results.tRPC = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      // Test database
      try {
        const dbResult = await trpcClient.test.database.query();
        results.database = dbResult;
      } catch (error) {
        results.database = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      // Test tRPC debug ping
      try {
        const debugResult = await trpcClient.debug.ping.query();
        results.debugPing = { success: true, data: debugResult };
      } catch (error) {
        results.debugPing = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      setTestResult({
        success: results.apiRoot?.status === 'ok' && results.tRPC?.success,
        message: results.apiRoot?.status === 'ok' && results.tRPC?.success ? 'All tests passed!' : 'Some tests failed',
        baseUrl,
        ...results
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to run tests',
        baseUrl: typeof window !== 'undefined' ? window.location.origin : (process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8081')
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api';
      console.log('Testing checkout at:', `${apiUrl}/checkout`);
      
      const response = await fetch(`${apiUrl}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'starter',
          userId: user.id,
          email: user.email
        })
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setCheckoutResult({
        success: response.ok && (typeof data === 'object' && data.success),
        message: response.ok ? 'Checkout API is working' : 'Checkout API failed',
        status: response.status,
        contentType,
        data,
        error: !response.ok ? `HTTP ${response.status}` : null
      });
      
    } catch (error) {
      console.error('Checkout test failed:', error);
      setCheckoutResult({
        success: false,
        message: 'Failed to connect to checkout API',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Database Test',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Database Connection Test</Text>
          <Text style={styles.subtitle}>
            This page tests if your Supabase database tables are set up correctly.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={runDatabaseTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Database Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.checkoutButton, (checkoutLoading || !user) && styles.buttonDisabled]}
          onPress={testCheckout}
          disabled={checkoutLoading || !user}
        >
          <Text style={styles.buttonText}>
            {checkoutLoading ? 'Testing...' : 'Test Checkout API'}
          </Text>
        </TouchableOpacity>
        
        {!user && (
          <Text style={styles.warningText}>Please login to test checkout API</Text>
        )}

        {testResult && (
          <View style={styles.resultContainer}>
            <View style={[styles.statusBadge, testResult.success ? styles.successBadge : styles.errorBadge]}>
              <Text style={styles.statusText}>
                {testResult.success ? '✅ SUCCESS' : '❌ FAILED'}
              </Text>
            </View>
            
            <Text style={styles.message}>{testResult.message}</Text>
            
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>Base URL: {testResult.baseUrl}</Text>
              <Text style={styles.debugText}>API Root: {JSON.stringify(testResult.apiRoot, null, 2)}</Text>
              <Text style={styles.debugText}>API Hello: {JSON.stringify(testResult.apiHello, null, 2)}</Text>
              <Text style={styles.debugText}>API Env Test: {JSON.stringify(testResult.apiEnvTest, null, 2)}</Text>
              <Text style={styles.debugText}>tRPC: {JSON.stringify(testResult.tRPC, null, 2)}</Text>
              <Text style={styles.debugText}>Debug Ping: {JSON.stringify(testResult.debugPing, null, 2)}</Text>
              <Text style={styles.debugText}>Database: {JSON.stringify(testResult.database, null, 2)}</Text>
            </View>
            
            {testResult.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{testResult.error}</Text>
              </View>
            )}
            
            {testResult.tables && testResult.tables.length > 0 && (
              <View style={styles.tablesContainer}>
                <Text style={styles.tablesTitle}>Table Status:</Text>
                {testResult.tables.map((table: any) => (
                  <View key={table.table} style={styles.tableRow}>
                    <Text style={styles.tableName}>{table.table}</Text>
                    <Text style={[styles.tableStatus, table.exists ? styles.tableExists : styles.tableMissing]}>
                      {table.exists ? '✅ EXISTS' : '❌ MISSING'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {!testResult.success && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>How to Fix:</Text>
                <Text style={styles.instructionsText}>
                  1. Go to your Supabase dashboard{'\n'}
                  2. Click &quot;SQL Editor&quot; in the left sidebar{'\n'}
                  3. Click &quot;New Query&quot;{'\n'}
                  4. Copy the entire contents of supabase-schema.sql{'\n'}
                  5. Paste it into the editor and click &quot;Run&quot;{'\n'}
                  6. Verify tables appear in &quot;Table Editor&quot;
                </Text>
              </View>
            )}
          </View>
        )}
        
        {checkoutResult && (
          <View style={styles.resultContainer}>
            <View style={[styles.statusBadge, checkoutResult.success ? styles.successBadge : styles.errorBadge]}>
              <Text style={styles.statusText}>
                {checkoutResult.success ? '✅ CHECKOUT SUCCESS' : '❌ CHECKOUT FAILED'}
              </Text>
            </View>
            
            <Text style={styles.message}>{checkoutResult.message}</Text>
            
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Checkout Debug Info:</Text>
              <Text style={styles.debugText}>Status: {checkoutResult.status}</Text>
              <Text style={styles.debugText}>Content-Type: {checkoutResult.contentType}</Text>
              <Text style={styles.debugText}>Response: {JSON.stringify(checkoutResult.data, null, 2)}</Text>
            </View>
            
            {checkoutResult.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Checkout Error:</Text>
                <Text style={styles.errorText}>{checkoutResult.error}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    marginTop: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#f59e0b',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: '#dcfce7',
  },
  errorBadge: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontFamily: 'monospace',
  },
  tablesContainer: {
    marginBottom: 16,
  },
  tablesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginBottom: 4,
  },
  tableName: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  tableStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableExists: {
    color: '#059669',
  },
  tableMissing: {
    color: '#dc2626',
  },
  instructionsContainer: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#0c4a6e',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});