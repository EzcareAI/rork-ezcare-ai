import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Send,
  ArrowLeft,
  Zap,
  MessageSquare,
  ExternalLink,
  BookOpen,
} from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollLoading, setScrollLoading] = useState(false);
  const { user, updateCredits } = useAuth();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const sendChat = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat history:", error.message);
        return;
      }
      if (data) {
        const formattedMessages = data.flatMap((chat) => {
          const messages: Message[] = [
            {
              id: `${chat.id}-message`,
              role: "user",
              content: chat.message,
              timestamp: new Date(chat.created_at),
            },
          ];

          if (chat.response) {
            messages.push({
              id: `${chat.id}-response`,
              role: "assistant",
              content: chat.response,
              timestamp: new Date(chat.created_at),
            });
          }

          return messages;
        });
        if (formattedMessages.length === 0) {
          formattedMessages.unshift({
            id: "welcome",
            role: "assistant" as const,
            content:
              "Hi, I'm Ez 👋 Your AI health buddy! I'm here to help explain symptoms, provide wellness tips, and offer health guidance in simple terms. What can I help you with today?\n\n⚠️ **Important**: This is educational content only — not medical advice. For emergencies, call 911.",
            timestamp: new Date(),
          });
        }

        setMessages(formattedMessages);
      }
    };

    sendChat();
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      try {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (autoScroll && scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: false });
            }
          });
        });
      } catch (e) {
        console.error("Error scrolling to bottom:", e);
      }
    };

    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!user || user.credits <= 0) {
      Alert.alert(
        "No Credits",
        "You need credits to chat with Ez. Please upgrade your plan or wait for your weekly credits to reset."
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const model =
        user.subscription_plan === "trial" ? "gpt-4o-mini" : "gpt-5";

      let systemPrompt = "";
      const basePrompt =
        "You are Ez, a friendly AI health buddy for people aged 30-70. Provide helpful, caring health guidance in simple terms using a casual, friendly tone. Combine traditional and modern health advice but never prescribe medications or diagnose conditions. Always remind users that this is educational content only and not medical advice. For emergencies, they should call 911 or seek immediate medical attention. Use markdown formatting for better readability (bold, lists, etc.).";

      try {
        const { data: quizData } = await supabase
          .from("quiz_responses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (quizData) {
          systemPrompt = `${basePrompt}\n\nUser's latest health data:\n- Health Score: ${quizData.health_score}/100\n- BMI: ${quizData.bmi} (${quizData.bmi_category})\n- Activity Level: ${quizData.activity_level}\n- Sleep: ${quizData.sleep_hours} hours\n- Stress Level: ${quizData.stress_level}/10\n- Diet Quality: ${quizData.diet_quality}\n\nUse this information to provide more personalized responses.`;
        } else {
          systemPrompt = basePrompt;
        }
      } catch (err) {
        console.warn("Failed to fetch quiz data:", err);
        systemPrompt = basePrompt;
      }

      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
              .slice(-5)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage.content },
          ],
        }),
      });

      let assistantContent =
        "I'm sorry, I couldn't process that request. Please try again.";
      let skipSave = false;

      try {
      } catch (e) {
        console.error("Failed to log response details:", e);
      }

      const text = await response.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        if (__DEV__) {
          console.error(
            "Failed to parse LLM response as JSON. Raw response:",
            text
          );
          console.error("JSON parse error:", parseErr);
        }
      }

      if (parsed && (parsed.completion || parsed.text || parsed.result)) {
        assistantContent = parsed.completion || parsed.text || parsed.result;
      }

      if (!response.ok && response.status >= 500) {
        assistantContent =
          "Sorry — our AI service is temporarily unavailable. Please try again in a few minutes.";
        skipSave = true;
      } else if (!response.ok && response.status === 429) {
        assistantContent =
          "You're being rate limited. Please wait a moment and try again.";
      } else if (!response.ok) {
        assistantContent =
          "There was an error processing your request. Please try again.";
      }

      if (response.ok) {
        try {
          {
            user.subscription_plan !== "premium" &&
              updateCredits(user.credits - 1);
          }
        } catch (e) {
          console.warn("Failed to update credits:", e);
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!skipSave) {
        try {
          const { data, error } = await supabase
            .from("chats")
            .insert({
              user_id: user.id,
              message: userMessage.content,
              response: assistantMessage.content,
            })
            .select();

          if (error) {
            console.warn("Failed to save chat:", error.message);
          }
          if (data) {
            console.log("✅ Chat saved successfully");
          }
        } catch (saveError) {
          console.warn(
            "⚠️ Failed to save chat to database (backend may be down):",
            saveError instanceof Error ? saveError.message : "Unknown error"
          );
        }
      } else {
        console.log(
          "Skipping saving chat because LLM service is unavailable (5xx)"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
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

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Not medical advice — for informational purposes only. Always
          consult a qualified healthcare provider.
        </Text>
        <TouchableOpacity
          style={styles.sourcesLink}
          onPress={() => router.push("/MedicalSourcesPage" as any)}
        >
          <BookOpen size={14} color="#10B981" />
          <Text style={styles.sourcesLinkText}>View Medical Sources</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (autoScroll && !scrollLoading) {
            setScrollLoading(true);
            scrollViewRef.current?.scrollToEnd({ animated: true });
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
              setScrollLoading(false);
              scrollTimeoutRef.current = null;
            }, 1000);
          }
        }}
        onScroll={(e) => {
          try {
            const { layoutMeasurement, contentOffset, contentSize } =
              e.nativeEvent;
            const paddingToBottom = 20;
            const isAtBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;
            setAutoScroll(isAtBottom);
            if (isAtBottom && scrollLoading) {
              setScrollLoading(false);
              if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
              }
            }
          } catch (err) {
            console.error("Error handling scroll event:", err);
          }
        }}
        scrollEventThrottle={100}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === "user"
                    ? styles.userText
                    : styles.assistantText,
                ]}
              >
                {message.role === "assistant"
                  ? renderMarkdown(message.content)
                  : message.content}
              </Text>
            </View>
            {message.role === "assistant" && message.id !== "welcome" && (
              <TouchableOpacity
                style={styles.viewSourceButton}
                onPress={() => router.push("/MedicalSourcesPage" as any)}
              >
                <ExternalLink size={12} color="#10B981" />
                <Text style={styles.viewSourceText}>View Medical Sources</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.messageTime}>
              {formatTime(message.timestamp)}
            </Text>
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

      {scrollLoading && (
        <View style={styles.scrollOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={
            user.subscription_plan === "premium" || user.credits > 0
              ? "Ask me anything about your health..."
              : "No credits remaining"
          }
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={
            !isLoading &&
            (user.subscription_plan !== "premium" ? user.credits > 0 : true)
          }
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading || user.credits <= 0) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading || user.credits <= 0}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {user.credits <= 0 && (
        <View style={styles.noCreditsContainer}>
          <Text style={styles.noCreditsText}>
            You&apos;re out of credits! "Upgrade your plan for more credits."
          </Text>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push("/pricing")}
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  disclaimer: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#991B1B",
    flex: 1,
  },
  sourcesLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
  },
  sourcesLinkText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
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
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#10B981",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#F9FAFB",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#1F2937",
  },
  boldText: {
    fontWeight: "bold",
  },
  messageTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    marginHorizontal: 4,
  },
  viewSourceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewSourceText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  typingText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sendButton: {
    backgroundColor: "#10B981",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  noCreditsContainer: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    gap: 12,
  },
  noCreditsText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
  },
  upgradeButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
