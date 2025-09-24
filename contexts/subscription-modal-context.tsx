import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

interface SubscriptionModalContextType {
  isVisible: boolean;
  selectedPlan?: string;
  showModal: (plan?: string) => void;
  hideModal: () => void;
}

const defaultValue: SubscriptionModalContextType = {
  isVisible: false,
  selectedPlan: undefined,
  showModal: () => {},
  hideModal: () => {},
};

export const [SubscriptionModalProvider, useSubscriptionModal] = createContextHook((): SubscriptionModalContextType => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const showModal = useCallback((plan?: string) => {
    if (plan && typeof plan === 'string' && plan.trim()) {
      setSelectedPlan(plan.trim());
    }
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
    setSelectedPlan(undefined);
  }, []);

  return useMemo(() => ({
    isVisible,
    selectedPlan,
    showModal,
    hideModal,
  }), [isVisible, selectedPlan, showModal, hideModal]);
}, defaultValue);