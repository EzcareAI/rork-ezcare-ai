import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

interface TestResult {
  name: string;
  url: string;
  status: 'testing' | 'success' | 'failed';
  response?: any;
  error?: string;
  duration?: number;
}

export default function DeploymentTestScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      name: 'Root Health Check',
      url: 'https://zvfley8yoowhncate9z5.rork.app/api',
      method: 'GET'
    },
    {
      name: 'Hello Endpoint',
      url: 'https://zvfley8yoowhncate9z5.rork.app/api/hello',
      method: 'GET'
    },
    {
      name: 'Environment Test',
      url: 'https://zvfley8yoowhncate9z5.rork.app/api/env-test',
      method: 'GET'
    },
    {
      name: 'tRPC Health Check',
      url: 'https://zvfley8yoowhncate9z5.rork.app/api/trpc/debug.ping',
      method: 'POST',
      body: JSON.stringify({
        "0": {
          "json": null,
          "meta": {
            "values": ["undefined"]
          }
        }
      })
    }
  ];

  const runTest = async (test: typeof tests[0]): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: test.body,
        signal: AbortSignal.timeout(10000)
      });

      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: test.name,
          url: test.url,
          status: 'success',
          response: data,
          duration
        };
      } else {
        const errorText = await response.text();
        return {
          name: test.name,
          url: test.url,
          status: 'failed',
          error: `HTTP ${response.status}: ${errorText}`,
          duration
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: test.name,
        url: test.url,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Initialize results with testing status
    const initialResults = tests.map(test => ({
      name: test.name,
      url: test.url,
      status: 'testing' as const
    }));
    setResults(initialResults);

    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i]);
      setResults(prev => prev.map((r, index) => index === i ? result : r));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return '#FFA500';
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const showDetails = (result: TestResult) => {
    if (!result || !result.name || !result.name.trim()) return;
    
    const details = [
      `Name: ${result.name}`,
      `URL: ${result.url}`,
      `Status: ${result.status}`,
      result.duration ? `Duration: ${result.duration}ms` : '',
      result.error ? `Error: ${result.error}` : '',
      result.response ? `Response: ${JSON.stringify(result.response, null, 2)}` : ''
    ].filter(Boolean).join('\n\n');

    console.log('Test Details:', details);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const testingCount = results.filter(r => r.status === 'testing').length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Deployment Test',
          headerStyle: { backgroundColor: '#f8f9fa' },
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Backend Deployment Test</Text>
          <Text style={styles.subtitle}>
            Testing if the backend is properly deployed and accessible
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>{successCount}</Text>
            <Text style={styles.summaryLabel}>Passed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F44336' }]}>{failedCount}</Text>
            <Text style={styles.summaryLabel}>Failed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#FFA500' }]}>{testingCount}</Text>
            <Text style={styles.summaryLabel}>Testing</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.refreshButtonText}>
            {isRunning ? 'Running Tests...' : 'Run Tests Again'}
          </Text>
        </TouchableOpacity>

        <View style={styles.testsList}>
          {results.map((result, index) => (
            <TouchableOpacity
              key={`${result.name}-${index}`}
              style={[
                styles.testItem,
                { borderLeftColor: getStatusColor(result.status) }
              ]}
              onPress={() => showDetails(result)}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testIcon}>{getStatusIcon(result.status)}</Text>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{result.name}</Text>
                  <Text style={styles.testUrl} numberOfLines={1}>{result.url}</Text>
                </View>
                {result.duration && (
                  <Text style={styles.duration}>{result.duration}ms</Text>
                )}
              </View>
              
              {result.error && (
                <Text style={styles.errorText} numberOfLines={2}>
                  {result.error}
                </Text>
              )}
              
              {result.response && (
                <Text style={styles.successText} numberOfLines={1}>
                  ✅ Response received
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>What this means:</Text>
          <Text style={styles.instructionsText}>
            • If all tests fail with &ldquo;Failed to fetch&rdquo;, the backend is not deployed{'\n'}
            • If root health check passes but others fail, there&rsquo;s a routing issue{'\n'}
            • If tRPC test fails but others pass, there&rsquo;s a tRPC configuration issue{'\n'}
            • All tests should pass for the app to work properly
          </Text>
        </View>

        {failedCount > 0 && (
          <View style={styles.troubleshooting}>
            <Text style={styles.troubleshootingTitle}>Troubleshooting Steps:</Text>
            <Text style={styles.troubleshootingText}>
              1. Check if the backend is deployed to Rork platform{'\n'}
              2. Verify the URL https://zvfley8yoowhncate9z5.rork.app/api is accessible{'\n'}
              3. Check environment variables are set correctly{'\n'}
              4. Review backend logs for errors{'\n'}
              5. Ensure CORS is configured properly
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testsList: {
    gap: 12,
  },
  testItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
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
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  testUrl: {
    fontSize: 12,
    color: '#6c757d',
  },
  duration: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    fontStyle: 'italic',
  },
  successText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
  },
  instructions: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  troubleshooting: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
    marginBottom: 8,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#c62828',
    lineHeight: 20,
  },
});