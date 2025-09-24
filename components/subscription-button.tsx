import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useSubscriptionModal } from '@/contexts/subscription-modal-context';

interface SubscriptionButtonProps {
  plan?: string;
  title?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function SubscriptionButton({
  plan = 'pro',
  title = 'Upgrade to Pro',
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  showIcon = true,
}: SubscriptionButtonProps) {
  const subscriptionModal = useSubscriptionModal();

  const handlePress = () => {
    if (subscriptionModal?.showModal) {
      subscriptionModal.showModal(plan);
    } else {
      console.warn('SubscriptionModal context not available');
    }
  };

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={handlePress}>
      {showIcon && <Crown size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={variant === 'outline' ? '#3B82F6' : '#fff'} />}
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#3B82F6',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});