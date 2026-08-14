'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react';
import ComplianceGateManager, { CandidateWithGates } from './ComplianceGateManager';

export default function AgencyComplianceTable({ candidates }: { candidates: CandidateWithGates[] }) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithGates | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Candidate Compliance Registry</h3>
            <p className="text-xs text-slate-500">Statutory tracking for GCC deployment clearance</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-700 rounded-full font-mono">
            {candidates.length} Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Candidate & Passport</th>
                <th className="py-3 px-4">Destination / Job</th>
                <th className="py-3 px-4 text-center">1. GAMCA</th>
                <th className="py-3 px-4 text-center">2. Training</th>
                <th className="py-3 px-4 text-center">3. Embassy</th>
                <th className="py-3 px-4 text-center">4. SLBFE</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {candidates.map((c) => {
                const g = c.compliance_gates;
                const isReady = g.is_fully_cleared;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.full_name_en}</div>
                      <div className="font-mono text-slate-400 text-[11px]">PP: {c.passport_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{c.destination_country}</div>
                      <div className="text-slate-500 text-[11px]">{c.job_category}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        g.gamca_medical_status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.gamca_medical_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        g.pre_departure_training === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.pre_departure_training}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        g.embassy_contract_attestation === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.embassy_contract_attestation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        g.slbfe_clearance_stamp === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.slbfe_clearance_stamp}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full text-[10px] border border-amber-200">
                          <ShieldAlert className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                      >
                        Manage Gates <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Viewport for Active Gate Management */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow hover:bg-slate-800 z-10"
            >
              ✕
            </button>
            <ComplianceGateManager
              candidate={selectedCandidate}
              onUpdateSuccess={() => {
                setSelectedCandidate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
