import { createClient } from '@supabase/supabase-js';
import { Users, DollarSign, Clock, CheckCircle, ShieldAlert, Award } from 'lucide-react';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function SubAgentPortalPage() {
  // Fetch referrals and commission records
  const { data: commissions } = await supabase
    .from('commissions')
    .select(`
      id,
      amount_lkr,
      payout_status,
      created_at,
      candidate:candidates (
        id,
        full_name_en,
        passport_number,
        destination_country,
        job_category,
        compliance_gates (
          gamca_medical_status,
          slbfe_clearance_stamp,
          is_fully_cleared
        )
      )
    `)
    .order('created_at', { ascending: false });

  const records = commissions || [];

  const totalCandidates = records.length;
  const approvedEarnings = records
    .filter((r) => r.payout_status === 'approved' || r.payout_status === 'disbursed')
    .reduce((sum, r) => sum + Number(r.amount_lkr), 0);
  const pendingEarnings = records
    .filter((r) => r.payout_status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount_lkr), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Regional Sub-Agent Operations Hub</h1>
          <p className="text-sm text-slate-500">Track referred candidate deployments and SLBFE-compliant commission status</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Licensed Field Partner
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Candidates</p>
            <p className="text-2xl font-bold text-slate-900">{totalCandidates}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Approved Commission</p>
            <p className="text-2xl font-bold text-emerald-700">LKR {approvedEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Pipeline</p>
            <p className="text-2xl font-bold text-amber-700">LKR {pendingEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Referral & Commission Pipeline Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Candidate Pipeline & Ledger</h3>
            <p className="text-xs text-slate-500">Real-time statutory status updates from agency head office</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">GAMCA Status</th>
                <th className="py-3 px-4">SLBFE Clearance</th>
                <th className="py-3 px-4">Commission Fee</th>
                <th className="py-3 px-4 text-center">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No candidate referrals logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r: any) => {
                  const candidate = r.candidate;
                  const gates = Array.isArray(candidate?.compliance_gates)
                    ? candidate?.compliance_gates[0]
                    : candidate?.compliance_gates;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{candidate?.full_name_en}</div>
                        <div className="font-mono text-slate-400 text-[11px]">PP: {candidate?.passport_number}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{candidate?.destination_country}</div>
                        <div className="text-slate-500 text-[11px]">{candidate?.job_category}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          gates?.gamca_medical_status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {gates?.gamca_medical_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {gates?.is_fully_cleared ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Departure Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> In Compliance
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        LKR {Number(r.amount_lkr).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          r.payout_status === 'disbursed'
                            ? 'bg-blue-100 text-blue-800'
                            : r.payout_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.payout_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
