import React, { useState } from 'react';
import AuthCard from './AuthCard';

import { UserRole } from '../types';
interface SignupFormProps {
  onSignup: (email: string, password: string, name: string, role: UserRole) => void;
  onSwitch: (form: 'login') => void;
  error?: string;
  logoUrl?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitch, error, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('patient');
  const [touched, setTouched] = useState<{email: boolean; password: boolean; name: boolean}>({email: false, password: false, name: false});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  function checkPasswordStrength(pw: string): 'weak' | 'medium' | 'strong' {
    if (pw.length < 8) return 'weak';
    if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/.test(pw)) return 'strong';
    if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(pw)) return 'medium';
    return 'weak';
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordStrength(checkPasswordStrength(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(email, password, name, role);
  };

  // Only allow signup for patient role
  if (role !== 'patient') {
    return (
      <AuthCard title="Signup Not Allowed" logoUrl={logoUrl}>
        <div className="text-center text-gray-600">Only patients can sign up. Please contact admin for access.</div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" logoUrl={logoUrl}>
      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-base text-gray-700" aria-label="Role">Account Type</label>
          <div className="flex gap-2 mb-2">
            <button type="button" className={`flex-1 px-4 py-2 rounded-lg border font-bold text-sm ${role === 'patient' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setRole('patient')}>Patient</button>
            <button type="button" className={`flex-1 px-4 py-2 rounded-lg border font-bold text-sm ${role === 'hospital_admin' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'}`} disabled>Hospital</button>
            <button type="button" className={`flex-1 px-4 py-2 rounded-lg border font-bold text-sm ${role === 'insurance_provider' ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700'}`} disabled>Insurance Provider</button>
            <button type="button" className={`flex-1 px-4 py-2 rounded-lg border font-bold text-sm ${role === 'admin' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'}`} disabled>System</button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-medium text-base text-gray-700" aria-label="Full name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(t => ({...t, name: true}))}
            aria-required="true"
            aria-invalid={!!error && touched.name}
            aria-describedby={error && touched.name ? 'name-error' : undefined}
          />
        </div>
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
            onBlur={() => setTouched(t => ({...t, email: true}))}
            aria-required="true"
            aria-invalid={!!error && touched.email}
            aria-describedby={error && touched.email ? 'email-error' : undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-medium text-base text-gray-700" aria-label="Password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 w-full pr-10"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setTouched(t => ({...t, password: true}))}
              aria-required="true"
              aria-invalid={!!error && touched.password}
              aria-describedby={error && touched.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>
        </div>
        {password && (
          <div className={`italic text-xs mt-1 ${passwordStrength === 'strong' ? 'text-green-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>Password strength: {passwordStrength}</div>
        )}
        {error && (
          <div id="password-error" className="text-red-500 italic text-xs mt-1" role="alert">{error}</div>
        )}
        <button
          type="submit"
          className="bg-blue-900 text-white rounded-lg py-3 font-bold text-base mt-2 hover:bg-blue-800 transition disabled:opacity-50"
          disabled={!email || !password || !name}
        >
          Sign Up
        </button>
        <div className="flex flex-col gap-2 mt-2">
          <button type="button" className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => onSwitch('login')}>Already have an account? Sign in</button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignupForm;
