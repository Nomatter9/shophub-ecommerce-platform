import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  orderId: number;
  amount: number;
  selectedAddressId: number | null;
  onSuccess: (orderId: number) => void;
}

export default function PaymentForm({
  clientSecret,
  orderId,
  amount,
  selectedAddressId,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!stripe || !elements) return;

  if (!selectedAddressId) {
    toast.error("Please select a delivery address");
    return;
  }

  setProcessing(true);

  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await axiosClient.post("/payments/confirm", {
        paymentIntentId: paymentIntent.id,
        orderId,
      });

      onSuccess(orderId);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Payment failed");
    setProcessing(false);
  }
};

  return (
    <form   id="payment-form"
     onSubmit={handleSubmit}
      className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />
      
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
        `Pay R${amount.toFixed(2)}`        )}
      </Button>
    </form>
  );
}