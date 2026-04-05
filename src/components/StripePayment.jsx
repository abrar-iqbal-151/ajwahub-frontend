import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': { color: '#d4cccc' },
      iconColor: '#fb923c',
    },
    invalid: { color: '#f87171' },
  },
};

function CheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const { clientSecret, error: serverError } = await res.json();
      if (serverError) throw new Error(serverError);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#3a0808',
        border: '1.5px solid rgba(255,255,255,0.3)',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}>
        <CardElement options={CARD_STYLE} />
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>❌ {error}</p>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            flex: 1, padding: '12px',
            background: loading ? '#555' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: '700', fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
          }}
        >
          {loading ? '⏳ Processing...' : `💳 Pay $${amount}`}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.06)',
            color: '#d4cccc',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          }}>
            Cancel
          </button>
        )}
      </div>

      <p style={{ fontSize: '11px', color: '#b0a8a8', textAlign: 'center', margin: 0 }}>
        🔒 Secured by Stripe — Test card: 4242 4242 4242 4242
      </p>
    </form>
  );
}

export default function StripePayment({ amount, onSuccess, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
