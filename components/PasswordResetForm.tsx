import React, { useState } from 'react';
import AuthCard from './AuthCard';

interface PasswordResetFormProps {
  onReset: (email: string) => void;
  onSwitch: (form: 'login') => void;
  error?: string;
  success?: string;
  logoUrl?: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onReset, onSwitch, error, success, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReset(email);
  };

  return (
    <AuthCard title="Reset your password" logoUrl={logoUrl}>
      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium text-base text-gray-700" aria-label="Email address">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-required="true"
            aria-invalid={!!error && touched}
            aria-describedby={error && touched ? 'reset-error' : undefined}
          />
        </div>
        {error && (
          <div id="reset-error" className="text-red-500 italic text-xs mt-1" role="alert">{error}</div>
        )}
        {success && (
          <div className="text-green-500 italic text-xs mt-1" role="status">{success}</div>
        )}
        <button
          type="submit"
          className="bg-blue-900 text-white rounded-lg py-3 font-bold text-base mt-2 hover:bg-blue-800 transition disabled:opacity-50"
          disabled={!email}
        >
          Send Reset Link
        </button>
        <div className="flex flex-col gap-2 mt-2">
          <button type="button" className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => onSwitch('login')}>Back to sign in</button>
        </div>
      </form>
    </AuthCard>
  );
};

export default PasswordResetForm;
