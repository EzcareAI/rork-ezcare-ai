import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react-native';

export default function DeploymentStatus() {
  const insets = useSafeAreaInsets();

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open URL: ${error}`);
    }
  };

  const testBackendNow = () => {
    router.push('/backend-test');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ 
        title: 'Backend Status',
        headerShown: false
      }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backend Status</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.alertContainer}>
          <AlertTriangle size={48} color="#f59e0b" />
          <Text style={styles.alertTitle}>Backend Unavailable</Text>
          <Text style={styles.alertMessage}>
            Your backend is not responding at the expected URL. This is likely a deployment issue.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Expected URL:</Text>
            <Text style={styles.statusValue}>https://zvfley8yoowhncate9z5.rork.app/api</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: '#ef4444' }]}>Offline ❌</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Error:</Text>
            <Text style={styles.statusValue}>Connection refused / Not found</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possible Causes</Text>
          <View style={styles.causeItem}>
            <Text style={styles.causeNumber}>1.</Text>
            <Text style={styles.causeText}>Backend not deployed to the expected URL</Text>
          </View>
          <View style={styles.causeItem}>
            <Text style={styles.causeNumber}>2.</Text>
            <Text style={styles.causeText}>Deployment failed or crashed</Text>
          </View>
          <View style={styles.causeItem}>
            <Text style={styles.causeNumber}>3.</Text>
            <Text style={styles.causeText}>Server configuration issues</Text>
          </View>
          <View style={styles.causeItem}>
            <Text style={styles.causeNumber}>4.</Text>
            <Text style={styles.causeText}>DNS or network connectivity problems</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This Means</Text>
          <Text style={styles.impactText}>
            The app will continue to work with limited functionality:
          </Text>
          <View style={styles.impactItem}>
            <Text style={styles.impactBullet}>•</Text>
            <Text style={styles.impactText}>Chat history won't be saved</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactBullet}>•</Text>
            <Text style={styles.impactText}>Quiz results won't be stored</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactBullet}>•</Text>
            <Text style={styles.impactText}>User data sync is disabled</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactBullet}>•</Text>
            <Text style={styles.impactText}>Subscription features unavailable</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={testBackendNow}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.actionButtonText}>Test Backend Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => openURL('https://zvfley8yoowhncate9z5.rork.app/')}
          >
            <ExternalLink size={20} color="#3b82f6" />
            <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
              Check Main Domain
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => openURL('https://zvfley8yoowhncate9z5.rork.app/api')}
          >
            <ExternalLink size={20} color="#3b82f6" />
            <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
              Check API Endpoint
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Technical Details</Text>
          <Text style={styles.infoText}>
            The app is configured to connect to your backend at:
          </Text>
          <Text style={styles.codeText}>https://zvfley8yoowhncate9z5.rork.app/api</Text>
          <Text style={styles.infoText}>
            This URL should return a JSON response with backend status information. 
            Currently, it's either not responding or returning an error.
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
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
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  causeItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  causeNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 8,
    minWidth: 20,
  },
  causeText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    lineHeight: 20,
  },
  impactItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  impactBullet: {
    fontSize: 14,
    color: '#ef4444',
    marginRight: 8,
    minWidth: 12,
  },
  impactText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#e2e8f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    color: '#1f2937',
  },
});