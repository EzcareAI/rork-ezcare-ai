import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

interface BackendStatus {
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  response?: any;
  error?: string;
  responseTime?: number;
}

export default function BackendStatusScreen() {
  const [statuses, setStatuses] = useState<BackendStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BackendStatus | null>(null);

  const testUrls = useMemo(() => [
    'https://zvfley8yoowhncate9z5.rork.app/api',
    'https://zvfley8yoowhncate9z5.rork.app/api/hello',
    'https://zvfley8yoowhncate9z5.rork.app/api/env-test',
  ], []);

  const testBackendEndpoint = async (url: string): Promise<BackendStatus> => {
    if (!url || !url.trim() || url.length > 200) {
      return {
        url,
        status: 'error',
        error: 'Invalid URL provided',
      };
    }
    
    const startTime = Date.now();
    
    try {
      const sanitizedUrl = url.trim();
      const response = await fetch(sanitizedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          url,
          status: 'online',
          response: data,
          responseTime,
        };
      } else {
        const errorText = await response.text();
        return {
          url,
          status: 'error',
          error: `HTTP ${response.status}: ${errorText}`,
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        url,
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  };

  const testTRPCEndpoint = async (): Promise<BackendStatus> => {
    const startTime = Date.now();
    
    try {
      const result = await trpcClient.debug.ping.query();
      const responseTime = Date.now() - startTime;
      
      return {
        url: 'tRPC debug.ping',
        status: 'online',
        response: result,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        url: 'tRPC debug.ping',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  };

  const runTests = useCallback(async () => {
    setIsRefreshing(true);
    setStatuses([]);

    // Test basic endpoints
    const basicTests = testUrls.map(url => ({
      url,
      status: 'checking' as const,
    }));
    
    // Add tRPC test
    const allTests = [
      ...basicTests,
      { url: 'tRPC debug.ping', status: 'checking' as const },
    ];
    
    setStatuses(allTests);

    // Run tests sequentially
    const results: BackendStatus[] = [];
    
    for (const url of testUrls) {
      const result = await testBackendEndpoint(url);
      results.push(result);
      setStatuses(prev => prev.map(s => s.url === url ? result : s));
    }

    // Test tRPC
    const trpcResult = await testTRPCEndpoint();
    results.push(trpcResult);
    setStatuses(prev => prev.map(s => s.url === 'tRPC debug.ping' ? trpcResult : s));

    setIsRefreshing(false);
  }, [testUrls]);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const getStatusColor = (status: BackendStatus['status']) => {
    switch (status) {
      case 'checking': return '#FFA500';
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: BackendStatus['status']) => {
    switch (status) {
      case 'checking': return 'Checking...';
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const showDetails = (status: BackendStatus) => {
    if (!status || !status.url || !status.url.trim()) return;
    
    setSelectedStatus(status);
  };

  const closeDetails = () => {
    setSelectedStatus(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backend Status',
          headerStyle: { backgroundColor: '#f8f9fa' },
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Backend Connectivity Test</Text>
          <Text style={styles.subtitle}>
            Testing connection to backend services
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={runTests}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Testing...' : 'Refresh Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.testsList}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.url}
              style={styles.testItem}
              onPress={() => status && status.url && showDetails(status)}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testUrl} numberOfLines={1}>
                  {status.url}
                </Text>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(status.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(status.status)}
                  </Text>
                </View>
              </View>
              
              {status.responseTime && (
                <Text style={styles.responseTime}>
                  {status.responseTime}ms
                </Text>
              )}
              
              {status.error && (
                <Text style={styles.errorText} numberOfLines={2}>
                  {status.error}
                </Text>
              )}
              
              {status.response && (
                <Text style={styles.responseText} numberOfLines={1}>
                  ✅ {JSON.stringify(status.response)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Troubleshooting:</Text>
          <Text style={styles.instructionsText}>
            • If all endpoints show &ldquo;Offline&rdquo;, the backend is not deployed{'\n'}
            • If some endpoints work but tRPC fails, there&rsquo;s a routing issue{'\n'}
            • If you see HTML responses, check CORS configuration{'\n'}
            • Response times over 5000ms indicate server issues
          </Text>
        </View>

        {selectedStatus && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Backend Status Details</Text>
              <Text style={styles.modalText}>URL: {selectedStatus.url}</Text>
              <Text style={styles.modalText}>Status: {getStatusText(selectedStatus.status)}</Text>
              {selectedStatus.responseTime && (
                <Text style={styles.modalText}>Response Time: {selectedStatus.responseTime}ms</Text>
              )}
              {selectedStatus.error && (
                <Text style={styles.modalText}>Error: {selectedStatus.error}</Text>
              )}
              {selectedStatus.response && (
                <Text style={styles.modalText}>
                  Response: {JSON.stringify(selectedStatus.response, null, 2)}
                </Text>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeDetails}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testUrl: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  responseText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
  },
  instructions: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#495057',
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});