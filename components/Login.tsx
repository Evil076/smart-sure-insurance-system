import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import PasswordResetForm from './PasswordResetForm';
import { supabase } from '../services/supabaseClient';

interface Props {
  onLogin: (role: string, profile: any) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [form, setForm] = useState<'login' | 'signup' | 'reset'>('login');
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // Supabase Auth Handlers
  const handleLogin = async (email: string, password: string, role: string) => {
    setError(undefined);
    setSuccess(undefined);

    // Check if user exists and role matches
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      // Fetch all users with this email
      const { data: userRows } = await supabase.from('users').select('*').eq('email', email);
      if (userRows && userRows.length > 0) {
        // If more than one user with same email, check for conflicting roles
        const matchingRoleUser = userRows.find(u => u.role === role);
        if (!matchingRoleUser) {
          setError('This email is registered for a different role. Please use the correct account type or contact support.');
          await supabase.auth.signOut();
          return;
        }
        // If multiple roles, block login
        if (userRows.length > 1) {
          setError('This email is registered for multiple roles. Please contact support to resolve.');
          await supabase.auth.signOut();
          return;
        }
        // Build user profile for correct role
        let userProfile: any = {
          id: data.user.id,
          name: matchingRoleUser.full_name || data.user.email,
          role: matchingRoleUser.role,
        };
        if (role === 'patient') {
          userProfile = {
            ...userProfile,
            age: matchingRoleUser.age ?? 30,
            dependents: matchingRoleUser.dependents ?? 0,
            monthlyBudget: matchingRoleUser.monthly_budget ?? 5000,
            priority: matchingRoleUser.priority ?? 'cost',
            beneficiaries: matchingRoleUser.beneficiaries ?? [],
            chronicConditions: matchingRoleUser.chronic_conditions ?? [],
            lifeEvent: matchingRoleUser.life_event ?? 'none',
            employmentType: matchingRoleUser.employment_type ?? 'formal',
            preferredHospitalTier: matchingRoleUser.preferred_hospital_tier ?? 'mid-tier',
          };
          // Ensure all required fields exist (fix for blank tabs)
          if (typeof userProfile.age !== 'number') userProfile.age = 30;
          if (typeof userProfile.dependents !== 'number') userProfile.dependents = 0;
          if (typeof userProfile.monthlyBudget !== 'number') userProfile.monthlyBudget = 5000;
          if (!userProfile.priority) userProfile.priority = 'cost';
          if (!Array.isArray(userProfile.beneficiaries)) userProfile.beneficiaries = [];
          if (!Array.isArray(userProfile.chronicConditions)) userProfile.chronicConditions = [];
          if (!userProfile.lifeEvent) userProfile.lifeEvent = 'none';
          if (!userProfile.employmentType) userProfile.employmentType = 'formal';
          if (!userProfile.preferredHospitalTier) userProfile.preferredHospitalTier = 'mid-tier';
        }
        if (role === 'hospital_admin') {
          userProfile = {
            ...userProfile,
            hospitalId: matchingRoleUser.hospital_id || undefined,
          };
          // Fallback: If hospitalId is missing, try to match hospital by email
          if (!userProfile.hospitalId) {
            try {
              const { KISII_HOSPITALS } = await import('../constants');
              const hospitalMatch = KISII_HOSPITALS.find(h => h.contact === email || h.name.toLowerCase().includes(email.split('@')[0].toLowerCase()));
              if (hospitalMatch) {
                userProfile.hospitalId = hospitalMatch.id;
              }
            } catch { }
          }
        }
        localStorage.setItem('smartsure_user', JSON.stringify(userProfile));
        onLogin(role, userProfile);
      } else {
        // User exists in Auth but not in users table - use default profile based on role
        let userProfile: any = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'User',
          role: role,
        };
        if (role === 'admin') {
          userProfile = {
            ...userProfile,
            name: 'System Admin',
            role: 'admin',
          };
        }
        localStorage.setItem('smartsure_user', JSON.stringify(userProfile));
        onLogin(role, userProfile);
      }
    } else {
      setError('Login failed.');
    }
  };

  const handleSignup = async (email: string, password: string, name: string, role: string) => {
    setError(undefined);
    setSuccess(undefined);

    // Check if user already exists in Auth
    const { error: checkError } = await supabase.auth.signInWithPassword({ email, password });
    if (!checkError) {
      setError('Account already exists. Please sign in.');
      setForm('login');
      return;
    }

    // Password strength check
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Password too weak. Use at least 8 chars, upper, lower, number.');
      return;
    }

    // Create Supabase Auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Try to insert into users table
    try {
      await supabase.from('users').insert([{
        full_name: name,
        email,
        password_hash: 'auth',
        role,
        phone_number: '+0000000000'
      }]);
    } catch (e) {
      // Table might not exist, continue anyway
      console.log('Could not insert into users table');
    }

    setSuccess('Account created! Please check your email to verify and then sign in.');
    setForm('login');
  };

  const handleReset = async (email: string) => {
    setError(undefined);
    setSuccess(undefined);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Password reset link sent!');
    }
  };

  return (
    <>
      {form === 'login' && (
        <LoginForm
          onLogin={handleLogin}
          onSwitch={f => { setForm(f); setError(undefined); setSuccess(undefined); }}
          error={error}
          logoUrl={undefined}
        />
      )}
      {form === 'signup' && (
        <SignupForm
          onSignup={handleSignup}
          onSwitch={() => { setForm('login'); setError(undefined); setSuccess(undefined); }}
          error={error}
          logoUrl={undefined}
        />
      )}
      {form === 'reset' && (
        <PasswordResetForm
          onReset={handleReset}
          onSwitch={() => { setForm('login'); setError(undefined); setSuccess(undefined); }}
          error={error}
          success={success}
          logoUrl={undefined}
        />
      )}
    </>
  );
};

export default Login;
