import React, { useState } from 'react';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  logoUrl?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children, logoUrl }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center" style={{ gap: 24 }}>
      {logoUrl && <img src={logoUrl} alt="Logo" className="mb-6 w-16 h-16" />}
      <h2 className="text-2xl font-bold font-sans text-gray-900 mb-6 text-center">{title}</h2>
      {children}
    </div>
  </div>
);

export default AuthCard;
