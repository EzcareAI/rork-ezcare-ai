import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function EnvironmentTest() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Get all environment variables
    const vars = {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'NOT SET',
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'NOT SET',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    };
    
    setEnvVars(vars);
    
    // Test URL construction
    const results = [];
    results.push(`Environment variables loaded: ${Object.keys(vars).length}`);
    results.push(`API URL from env: ${vars.EXPO_PUBLIC_API_URL}`);
    results.push(`Expected URL: https://zvfley8yoowhncate9z5.rork.app/api`);
    results.push(`URLs match: ${vars.EXPO_PUBLIC_API_URL === 'https://zvfley8yoowhncate9z5.rork.app/api' ? 'YES' : 'NO'}`);
    
    setTestResults(results);
  }, []);

  const testDirectFetch = async () => {
    const url = process.env.EXPO_PUBLIC_API_URL || 'https://zvfley8yoowhncate9z5.rork.app/api';
    
    try {
      console.log('🧪 Testing direct fetch to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        setTestResults(prev => [...prev, `✅ Direct fetch SUCCESS: ${JSON.stringify(data)}`]);
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        setTestResults(prev => [...prev, `❌ Direct fetch FAILED: ${response.status} - ${errorText}`]);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setTestResults(prev => [...prev, `❌ Direct fetch ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Environment Test', headerShown: true }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Environment Variables Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          {Object.entries(envVars).map(([key, value]) => (
            <View key={key} style={styles.envVar}>
              <Text style={styles.envKey}>{key}:</Text>
              <Text style={styles.envValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.testResult}>{result}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={testDirectFetch}>
          <Text style={styles.buttonText}>Test Direct Fetch</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  envVar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  envKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 200,
  },
  envValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  testResult: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});