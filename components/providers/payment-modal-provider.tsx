'use client';

import { PaymentModal } from '@/components/ui/payment-modal';
import { useModal } from '@/contexts/app';

export function PaymentModalProvider() {
  const { 
    showPaymentModal, 
    setShowPaymentModal, 
    paymentStatus, 
    paymentOrderInfo 
  } = useModal();

  const closeModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <PaymentModal
      isOpen={false} // 临时隐藏支付弹框，但保留代码
      // isOpen={showPaymentModal}  // 原始代码，修复后可恢复
      onClose={closeModal}
      status={paymentStatus}
      orderNo={paymentOrderInfo.orderNo}
      amount={paymentOrderInfo.amount}
      currency={paymentOrderInfo.currency}
    />
  );
}