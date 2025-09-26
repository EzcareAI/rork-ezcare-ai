import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function BackendStatusCheck() {
  const [status, setStatus] = useState<{
    main: 'checking' | 'online' | 'offline';
    api: 'checking' | 'online' | 'offline';
    trpc: 'checking' | 'online' | 'offline';
    details: string[];
  }>({
    main: 'checking',
    api: 'checking', 
    trpc: 'checking',
    details: []
  });

  const checkBackendStatus = async () => {
    const details: string[] = [];
    const baseUrl = 'https://zvfley8yoowhncate9z5.rork.app';
    
    // Check main domain
    try {
      const response = await fetch(baseUrl, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        setStatus(prev => ({ ...prev, main: 'online' }));
        details.push(`✅ Main domain: ${response.status} ${response.statusText}`);
      } else {
        setStatus(prev => ({ ...prev, main: 'offline' }));
        details.push(`❌ Main domain: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, main: 'offline' }));
      details.push(`❌ Main domain error: ${error}`);
    }

    // Check API endpoint
    try {
      const response = await fetch(`${baseUrl}/api`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        setStatus(prev => ({ ...prev, api: 'online' }));
        const data = await response.json();
        details.push(`✅ API endpoint: ${response.status} - ${data.message || 'OK'}`);
      } else {
        setStatus(prev => ({ ...prev, api: 'offline' }));
        details.push(`❌ API endpoint: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, api: 'offline' }));
      details.push(`❌ API endpoint error: ${error}`);
    }

    // Check tRPC endpoint
    try {
      const response = await fetch(`${baseUrl}/api/trpc/example.hi`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        setStatus(prev => ({ ...prev, trpc: 'online' }));
        details.push(`✅ tRPC endpoint: ${response.status}`);
      } else {
        setStatus(prev => ({ ...prev, trpc: 'offline' }));
        details.push(`❌ tRPC endpoint: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, trpc: 'offline' }));
      details.push(`❌ tRPC endpoint error: ${error}`);
    }

    setStatus(prev => ({ ...prev, details }));
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const getStatusColor = (status: 'checking' | 'online' | 'offline') => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'offline': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: 'checking' | 'online' | 'offline') => {
    switch (status) {
      case 'online': return 'Online ✅';
      case 'offline': return 'Offline ❌';
      default: return 'Checking...';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Status' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Status Check</Text>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Main Domain:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(status.main) }]}>
              {getStatusText(status.main)}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>API Endpoint:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(status.api) }]}>
              {getStatusText(status.api)}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>tRPC Endpoint:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(status.trpc) }]}>
              {getStatusText(status.trpc)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={checkBackendStatus}>
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Details:</Text>
          {status.details.map((detail, index) => (
            <Text key={index} style={styles.detailText}>{detail}</Text>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Expected URLs:</Text>
          <Text style={styles.infoText}>• Main: https://zvfley8yoowhncate9z5.rork.app/</Text>
          <Text style={styles.infoText}>• API: https://zvfley8yoowhncate9z5.rork.app/api</Text>
          <Text style={styles.infoText}>• tRPC: https://zvfley8yoowhncate9z5.rork.app/api/trpc/*</Text>
        </View>
      </ScrollView>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});