import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, X, CreditCard, Settings, LogOut, Zap, RotateCcw, TrendingUp, Trash2, MessageSquare, TestTube } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import { trpc } from '@/lib/trpc';



export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { user, logout, deleteAccount, isLoading } = useAuth();
  const quizHistoryQuery = trpc.quiz.getHistory.useQuery(
    { userId: user?.id || '' },
    {
      enabled: !!user?.id
    }
  );

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading]);

  const quizHistory = quizHistoryQuery.data || [];
  const latestQuizResult = quizHistory.length > 0 ? quizHistory[0] : null;



  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/');
            }
          }
        ]
      );
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/');
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      setShowDeleteModal(true);
    } else {
      Alert.alert(
        'Delete Account',
        'This will permanently delete your account and all your data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              const result = await deleteAccount();
              if (result.success) {
                Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.');
                router.replace('/');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    const result = await deleteAccount();
    if (result.success) {
      router.replace('/');
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi! I\'d like to try EZCare AI on WhatsApp.');
    const url = `https://wa.me/1234567890?text=${message}`;
    Linking.openURL(url).catch(() => {
      console.log('Could not open WhatsApp');
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not loading and no user, return null (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)}>
          <Menu size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.creditsContainer}>
          <Zap size={16} color="#F59E0B" />
          <Text style={styles.creditsText}>{user.credits}</Text>
        </View>
      </View>

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Health Score Card */}
        {latestQuizResult && (
          <View style={styles.healthScoreCard}>
            <LinearGradient
              colors={['#4F46E5', '#06B6D4', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreTitle}>Your Latest Health Score</Text>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreNumber}>
                    {latestQuizResult.health_score}
                  </Text>
                  <Text style={styles.scoreLabel}>Health Score</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreNumber}>
                    {latestQuizResult.bmi}
                  </Text>
                  <Text style={styles.scoreLabel}>BMI ({latestQuizResult.bmi_category})</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quiz History Chart */}
        {quizHistory.length > 1 && (
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <TrendingUp size={24} color="#10B981" />
              <Text style={styles.historyTitle}>Health Score History</Text>
            </View>
            <View style={styles.historyChart}>
              {quizHistory.slice(-5).map((result) => (
                <View key={result.id} style={styles.historyBar}>
                  <View 
                    style={[
                      styles.historyBarFill, 
                      { 
                        height: `${result.health_score}%`,
                        backgroundColor: getScoreColor(result.health_score)
                      }
                    ]} 
                  />
                  <Text style={styles.historyBarLabel}>{result.health_score}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/quiz')}
            >
              <RotateCcw size={24} color="#10B981" />
              <Text style={styles.actionButtonText}>Retake Health Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/chat')}
            >
              <MessageSquare size={24} color="#10B981" />
              <Text style={styles.actionButtonText}>Chat with Ez</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/backend-test')}
            >
              <TestTube size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Backend Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp CTA */}
        <View style={styles.whatsappCard}>
          <Text style={styles.whatsappTitle}>Try Ez on WhatsApp</Text>
          <Text style={styles.whatsappText}>
            Get health guidance directly in WhatsApp. Perfect for quick questions on the go!
          </Text>
          <TouchableOpacity 
            style={styles.whatsappButton}
            onPress={handleWhatsApp}
          >
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.whatsappButtonText}>Chat on WhatsApp</Text>
          </TouchableOpacity>
          <Text style={styles.whatsappNote}>
            Coming soon - placeholder for now
          </Text>
        </View>
      </ScrollView>

      {/* Sidebar */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackdrop}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planText}>{user.subscription_plan.toUpperCase()} Plan</Text>
                <View style={styles.creditsInfo}>
                  <Zap size={16} color="#F59E0B" />
                  <Text style={styles.creditsCount}>{user.credits} credits</Text>
                </View>
              </View>
            </View>

            <View style={styles.sidebarMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setSidebarOpen(false);
                  router.push('/pricing');
                }}
              >
                <CreditCard size={20} color="#6B7280" />
                <Text style={styles.menuText}>Upgrade Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setSidebarOpen(false);
                  router.push('/billing');
                }}
              >
                <Settings size={20} color="#6B7280" />
                <Text style={styles.menuText}>Billing Portal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setSidebarOpen(false);
                  handleDeleteAccount();
                }}
              >
                <Trash2 size={20} color="#EF4444" />
                <Text style={styles.deleteAccountText}>Delete Account</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={20} color="#6B7280" />
                <Text style={styles.menuText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This will permanently delete your account and all your data. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  healthScoreCard: {
    marginVertical: 20,
  },
  scoreGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 40,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    paddingTop: 20,
  },
  historyBar: {
    alignItems: 'center',
    flex: 1,
  },
  historyBarFill: {
    width: 20,
    backgroundColor: '#10B981',
    borderRadius: 10,
    minHeight: 20,
  },
  historyBarLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  chatCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 400,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  disclaimer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    maxHeight: 250,
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#10B981',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    maxWidth: '80%',
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsCount: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  sidebarMenu: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
  },
  deleteAccountText: {
    fontSize: 16,
    color: '#EF4444',
  },
  whatsappCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  whatsappTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  whatsappText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});