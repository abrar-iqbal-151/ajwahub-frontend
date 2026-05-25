import { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const ELEMENT_STYLE = {
  style: {
    base: {
      fontFamily: '"Inter", "Outfit", sans-serif',
      fontSize: '15px',
      color: '#e2e8f0',
      letterSpacing: '0.04em',
      '::placeholder': { color: '#4b5563' },
      iconColor: '#c9b85c',
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
};

function StripeField({ label, icon, children, error }) {
  return (
    <div className="sco-field">
      <label className="sco-label">
        <span className="sco-label-icon">{icon}</span>
        {label}
      </label>
      <div className={`sco-input-wrap ${error ? 'sco-invalid' : ''}`}>
        {children}
      </div>
      {error && <p className="sco-field-error">⚠ {error}</p>}
    </div>
  );
}

/**
 * StripeCheckout — Premium split-field card form
 * Props:
 *   total       – amount in PKR
 *   userEmail   – user's email
 *   orderId     – pending order ID
 *   onSuccess   – callback(paymentIntentId)
 *   onError     – callback(errorMessage)
 *   API         – base API URL
 */
const STRIPE_MIN_PKR = 150; // must match backend

export default function StripeCheckout({ total, userEmail, orderId, onSuccess, onError, API }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [focused, setFocused] = useState('');

  const belowMinimum = total < STRIPE_MIN_PKR;

  const setFieldError = (field, msg) =>
    setErrors(prev => ({ ...prev, [field]: msg }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Pre-validate: below Stripe minimum?
    if (belowMinimum) {
      setFieldError('number', `Minimum order for card payment is PKR ${STRIPE_MIN_PKR}. Please add more items.`);
      return;
    }

    // Validate name
    if (!cardholderName.trim()) {
      setFieldError('name', 'Cardholder name is required');
      return;
    }

    setProcessing(true);
    setErrors({ number: '', expiry: '', cvc: '', name: '' });

    try {
      // 1. Create PaymentIntent on the server (backend converts PKR → USD cents)
      const res = await fetch(`${API}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId, userEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret)
        throw new Error(data.error || 'Failed to create payment intent');

      // 2. Confirm the card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardholderName.trim(),
            email: userEmail || '',
          },
        },
      });

      if (error) {
        setFieldError('number', error.message);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setFieldError('number', 'Payment did not complete. Please try again.');
        onError('Payment incomplete');
      }
    } catch (err) {
      setFieldError('number', err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sco-form" noValidate>

      {/* ── Minimum Amount Warning ── */}
      {belowMinimum && (
        <div className="sco-min-warning">
          <span className="sco-min-warning-icon">⚠️</span>
          <div>
            <strong>Order total too low for card payment</strong>
            <p>Minimum is <strong>PKR {STRIPE_MIN_PKR}</strong>. Your total is <strong>PKR {total}</strong>. Please add more items or choose Cash on Delivery.</p>
          </div>
        </div>
      )}

      {/* ── Card Preview Banner ── */}
      <div className={`sco-card-visual ${belowMinimum ? 'sco-card-visual--disabled' : ''}`}>
        <div className="sco-card-chip">
          <div className="sco-chip-inner" />
        </div>
        <div className="sco-card-brand">
          <div className="sco-brand-circle sco-brand-circle-l" />
          <div className="sco-brand-circle sco-brand-circle-r" />
        </div>
        <div className="sco-card-number-preview">
          {cardholderName ? '•••• •••• •••• ••••' : '•••• •••• •••• ••••'}
        </div>
        <div className="sco-card-meta">
          <span className="sco-card-meta-label">Card Holder</span>
          <span className="sco-card-meta-val">
            {cardholderName.trim() || 'FULL NAME'}
          </span>
        </div>
        <div className="sco-card-logo">
          <span>STRIPE</span>
        </div>
      </div>

      {/* ── Fields ── */}
      <div className="sco-fields">

        {/* Cardholder Name */}
        <StripeField label="Cardholder Name" icon="👤" error={errors.name}>
          <input
            type="text"
            className={`sco-text-input ${focused === 'name' ? 'sco-focused' : ''}`}
            placeholder="Name as on card"
            value={cardholderName}
            onChange={e => {
              setCardholderName(e.target.value);
              if (errors.name) setFieldError('name', '');
            }}
            onFocus={() => setFocused('name')}
            onBlur={() => {
              setFocused('');
              if (!cardholderName.trim()) setFieldError('name', 'Cardholder name is required');
            }}
            autoComplete="cc-name"
          />
        </StripeField>

        {/* Card Number */}
        <StripeField label="Card Number" icon="💳" error={errors.number}>
          <CardNumberElement
            options={{ ...ELEMENT_STYLE, showIcon: true }}
            className="sco-stripe-el"
            onFocus={() => setFocused('number')}
            onBlur={() => setFocused('')}
            onChange={e => {
              if (e.error) setFieldError('number', e.error.message);
              else setFieldError('number', '');
            }}
          />
        </StripeField>

        {/* Expiry + CVC side by side */}
        <div className="sco-row">
          <StripeField label="Expiry Date" icon="📅" error={errors.expiry}>
            <CardExpiryElement
              options={ELEMENT_STYLE}
              className="sco-stripe-el"
              onFocus={() => setFocused('expiry')}
              onBlur={() => setFocused('')}
              onChange={e => {
                if (e.error) setFieldError('expiry', e.error.message);
                else setFieldError('expiry', '');
              }}
            />
          </StripeField>

          <StripeField label="CVC / CVV" icon="🔒" error={errors.cvc}>
            <CardCvcElement
              options={ELEMENT_STYLE}
              className="sco-stripe-el"
              onFocus={() => setFocused('cvc')}
              onBlur={() => setFocused('')}
              onChange={e => {
                if (e.error) setFieldError('cvc', e.error.message);
                else setFieldError('cvc', '');
              }}
            />
          </StripeField>
        </div>



        {/* Pay Button */}
        <button
          type="submit"
          className={`sco-pay-btn ${processing || !stripe || belowMinimum ? 'sco-pay-btn--loading' : ''}`}
          disabled={processing || !stripe || belowMinimum}
        >
          {processing ? (
            <><span className="spinner" /> Verifying Payment...</>
          ) : belowMinimum ? (
            <>⚠ Minimum PKR {STRIPE_MIN_PKR} required</>
          ) : (
            <>
              <span className="sco-pay-icon">💳</span>
              Pay Now
            </>
          )}
        </button>
      </div>
    </form>
  );
}
