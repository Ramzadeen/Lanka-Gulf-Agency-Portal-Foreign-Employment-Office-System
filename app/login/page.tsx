'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, Building2, UserCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithRole } from '@/app/actions/auth';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginWithRole(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Branding & SLBFE Compliance Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-100 text-slate-900 rounded-2xl mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lanka-Gulf Agency Portal</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Foreign Employment Statutory Gateway
          </p>
        </div>

        {/* Role Quick Reference Badges */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-xl">
            <Building2 className="w-4 h-4 mx-auto text-slate-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-700 block">Agency Admin</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <UserCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-700 block">Gulf Employer</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <ShieldCheck className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-700 block">Sub-Agent</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@lankagulfagency.lk"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Role...
              </>
            ) : (
              'Access Compliance Portal'
            )}
          </button>
        </form>

        {/* Statutory Legal Disclaimer */}
        <p className="text-[10px] text-center text-slate-400 leading-relaxed pt-2">
          Strictly regulated under <strong>SLBFE Act No. 21 of 1985</strong> and GCC bilateral labor protocols. Zero unauthorized candidate fee collection is permitted.
        </p>
      </div>
    </main>
  );
}
