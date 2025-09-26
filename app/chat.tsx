import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Send, ArrowLeft, Zap, MessageSquare } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { trpc } from '@/lib/trpc';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi, I'm Ez 👋 Your AI health buddy! I'm here to help explain symptoms, provide wellness tips, and offer health guidance in simple terms. What can I help you with today?\n\n⚠️ **Important**: This is educational content only — not medical advice. For emergencies, call 911.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { user, updateCredits } = useAuth();
  const saveChatMutation = trpc.chat.saveChat.useMutation();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!user || user.credits <= 0) {
      Alert.alert('No Credits', 'You need credits to chat with Ez. Please upgrade your plan or wait for your weekly credits to reset.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Deduct credit
    updateCredits(user.credits - 1);

    try {
      // Use GPT-4o for paid plans, GPT-4o-mini for free plan
      const model = user.subscription_plan === 'trial' ? 'gpt-4o-mini' : 'gpt-4o';
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are Ez, a friendly AI health buddy for people aged 30-70. Provide helpful, caring health guidance in simple terms using a casual, friendly tone. Combine traditional and modern health advice but never prescribe medications or diagnose conditions. Always remind users that this is educational content only and not medical advice. For emergencies, they should call 911 or seek immediate medical attention. Use markdown formatting for better readability (bold, lists, etc.).'
            },
            ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ]
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.completion || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save conversation to database (optional - don't fail if backend is down)
      try {
        await saveChatMutation.mutateAsync({
          message: userMessage.content,
          response: assistantMessage.content
        });
        if (__DEV__) {
          console.log('✅ Chat saved successfully');
        }
      } catch (saveError) {
        if (__DEV__) {
          console.warn('⚠️ Failed to save chat to database:', saveError instanceof Error ? saveError.message : 'Unknown error');
        }
        // Chat functionality continues to work even if saving fails
        // This is acceptable since the main AI functionality is independent
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for bold text
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MessageSquare size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Chat with Ez</Text>
        </View>
        <View style={styles.creditsContainer}>
          <Zap size={16} color="#F59E0B" />
          <Text style={styles.creditsText}>{user.credits}</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Educational only — not medical advice. For emergencies, call 911
        </Text>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.role === 'user' ? styles.userMessage : styles.assistantMessage
          ]}>
            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText
              ]}>
                {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
              </Text>
            </View>
            <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={styles.typingText}>Ez is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={user.credits > 0 ? "Ask me anything about your health..." : "No credits remaining"}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading && user.credits > 0}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isLoading || user.credits <= 0) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading || user.credits <= 0}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* No Credits Message */}
      {user.credits <= 0 && (
        <View style={styles.noCreditsContainer}>
          <Text style={styles.noCreditsText}>
            You&apos;re out of credits! {user.subscription_plan === 'trial' ? 'Credits reset weekly.' : 'Upgrade your plan for more credits.'}
          </Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/pricing')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  disclaimer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    backgroundColor: '#F9FAFB',
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
  boldText: {
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  noCreditsContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  noCreditsText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});