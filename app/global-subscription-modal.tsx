import React from 'react';
import SubscriptionModal from './subscription-modal';
import { useSubscriptionModal } from '@/contexts/subscription-modal-context';

export default function GlobalSubscriptionModal() {
  const { isVisible, selectedPlan, hideModal } = useSubscriptionModal();

  return (
    <SubscriptionModal
      visible={isVisible}
      onClose={hideModal}
      selectedPlan={selectedPlan}
    />
  );
}