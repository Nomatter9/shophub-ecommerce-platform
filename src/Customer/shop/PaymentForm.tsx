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
onSuccess: (paymentIntent: any) => void; }

export default function PaymentForm({
  clientSecret,
  amount,
  selectedAddressId,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  if (!stripe || !elements) return;

  setProcessing(true);
  setErrorMessage(""); 

  const { error: submitError } = await elements.submit(); 
  if (submitError) {
    setErrorMessage(submitError.message || "Validation failed");
    setProcessing(false);
    return;
  }

  const result = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/checkout/success`,
    },
    redirect: 'if_required', 
  });

  console.log("Full Stripe Response:", result);

  if (result.error) {
    setErrorMessage(result.error.message || "An unexpected error occurred.");
    setProcessing(false);
  } else {
    if (result.paymentIntent.status === 'succeeded') {
      onSuccess(result.paymentIntent); 
    }
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