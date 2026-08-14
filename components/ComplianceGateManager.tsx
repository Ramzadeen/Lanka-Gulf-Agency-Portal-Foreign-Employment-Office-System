'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileBadge, 
  Stethoscope, 
  GraduationCap, 
  Building2, 
  Stamp, 
  Loader2,
  Check
} from 'lucide-react';
import { ComplianceStatus, GCCCountry } from '@/types/database';
import { updateCandidateComplianceGate } from '@/app/actions/compliance';

export interface CandidateWithGates {
  id: string;
  full_name_en: string;
  passport_number: string;
  nic_number: string;
  destination_country: GCCCountry;
  job_category: string;
  compliance_gates: {
    gamca_medical_status: ComplianceStatus;
    gamca_ref_number?: string;
    pre_departure_training: ComplianceStatus;
    training_certificate_no?: string;
    embassy_contract_attestation: ComplianceStatus;
    embassy_ref_no?: string;
    slbfe_clearance_stamp: ComplianceStatus;
    slbfe_registration_no?: string;
    is_fully_cleared: boolean;
  };
}

interface ComplianceGateManagerProps {
  candidate: CandidateWithGates;
  onUpdateSuccess?: () => void;
}

export default function ComplianceGateManager({ candidate, onUpdateSuccess }: ComplianceGateManagerProps) {
  const [gates, setGates] = useState(candidate.compliance_gates);
  const [activeGate, setActiveGate] = useState<'gamca' | 'training' | 'embassy' | 'slbfe'>('gamca');
  const [refNumber, setRefNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus>('passed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await updateCandidateComplianceGate({
      candidateId: candidate.id,
      gate: activeGate,
      status: selectedStatus,
      referenceNumber: refNumber.trim() ? refNumber.trim() : undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Update failed.' });
    } else {
      setStatusMessage({ type: 'success', text: `Gate: ${activeGate.toUpperCase()} updated successfully.` });
      if (res.data) {
        setGates(res.data);
      }
      setRefNumber('');
      if (onUpdateSuccess) onUpdateSuccess();
    }
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Cleared
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const gateConfig = [
    {
      key: 'gamca' as const,
      label: '1. GAMCA Medical Fitness',
      desc: 'Mandatory GCC Health Council accredited clinic test',
      icon: Stethoscope,
      status: gates.gamca_medical_status,
      ref: gates.gamca_ref_number,
      refLabel: 'GAMCA Slip / Fit Barcode ID',
    },
    {
      key: 'training' as const,
      label: '2. Pre-Departure Training',
      desc: 'SLBFE Training Certificate / NVQ Skills Validation',
      icon: GraduationCap,
      status: gates.pre_departure_training,
      ref: gates.training_certificate_no,
      refLabel: 'SLBFE Certificate Serial No.',
    },
    {
      key: 'embassy' as const,
      label: '3. Embassy Contract Attestation',
      desc: 'Musaned (KSA) / Enjaz / Gulf Embassy Labor Attestation',
      icon: Building2,
      status: gates.embassy_contract_attestation,
      ref: gates.embassy_ref_no,
      refLabel: 'Embassy Attestation File No.',
    },
    {
      key: 'slbfe' as const,
      label: '4. SLBFE Final Registration',
      desc: 'Bureau Clearance Stamp & Overseas Insurance Cover',
      icon: Stamp,
      status: gates.slbfe_clearance_stamp,
      ref: gates.slbfe_registration_no,
      refLabel: 'SLBFE Official Stamp Ref No.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
      {/* Candidate Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{candidate.full_name_en}</h2>
            {gates.is_fully_cleared ? (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> DEPLOYMENT READY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Clearance Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Passport: {candidate.passport_number} | NIC: {candidate.nic_number} | Dest: {candidate.destination_country} ({candidate.job_category})
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {statusMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 4 Pipeline Gate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateConfig.map((item) => {
          const Icon = item.icon;
          const isSelected = activeGate === item.key;

          return (
            <div
              key={item.key}
              onClick={() => {
                setActiveGate(item.key);
                setSelectedStatus(item.status);
                setRefNumber(item.ref || '');
              }}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/70 shadow-sm ring-1 ring-slate-900'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{item.label}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.desc}</p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              {item.ref && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Doc Ref:</span>
                  <span className="font-mono font-medium text-slate-700">{item.ref}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Workspace for Selected Gate */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-slate-700" />
            <h4 className="font-bold text-sm text-slate-800">
              Verify & Update: {gateConfig.find((g) => g.key === activeGate)?.label}
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-sans">Mandatory SLBFE Compliance Rule</span>
        </div>

        <form onSubmit={handleGateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Verification Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ComplianceStatus)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="passed">Passed / Verified Fit</option>
                <option value="in_progress">In Progress / Under Processing</option>
                <option value="pending">Pending Documentation</option>
                <option value="rejected">Unfit / Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {gateConfig.find((g) => g.key === activeGate)?.refLabel}
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. SLBFE-2026-99214 or GAMCA-FIT-441"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating Record...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Save Verification Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
