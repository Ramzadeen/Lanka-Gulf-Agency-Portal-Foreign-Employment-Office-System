import { createClient } from '@supabase/supabase-js';
import { Plane, CheckCircle2, ShieldCheck, Download, ExternalLink, Globe } from 'lucide-react';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EmployerPortalPage() {
  // Fetch verified candidates assigned or visible for GCC deployment
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
      id,
      full_name_en,
      passport_number,
      destination_country,
      job_category,
      gender,
      compliance_gates (
        gamca_medical_status,
        gamca_ref_number,
        pre_departure_training,
        embassy_contract_attestation,
        slbfe_clearance_stamp,
        slbfe_registration_no,
        is_fully_cleared
      )
    `)
    .order('created_at', { ascending: false });

  const roster = candidates || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GCC Employer Allocation Portal</h1>
          <p className="text-sm text-slate-500">Verified Sri Lankan workforce pipeline and statutory deployment tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> GCC Direct Link Active
          </span>
        </div>
      </div>

      {/* Roster Overview Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Allocated Workers</h3>
            <p className="text-xs text-slate-500">Approved under bilateral labor frameworks (Musaned / MoHRE / MoI)</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-700 rounded-full font-mono">
            {roster.length} Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Worker Profile</th>
                <th className="py-3 px-4">Trade / Category</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">GAMCA Medical</th>
                <th className="py-3 px-4">SLBFE Clearance</th>
                <th className="py-3 px-4 text-center">Flight Readiness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {roster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No workers currently allocated.
                  </td>
                </tr>
              ) : (
                roster.map((c: any) => {
                  const gates = Array.isArray(c.compliance_gates) ? c.compliance_gates[0] : c.compliance_gates;
                  const isReady = gates?.is_fully_cleared;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.full_name_en}</div>
                        <div className="font-mono text-slate-400 text-[11px]">PP: {c.passport_number}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{c.job_category}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{c.destination_country}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gates?.gamca_medical_status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {gates?.gamca_medical_status === 'passed' ? 'FIT' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gates?.slbfe_clearance_stamp === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {gates?.slbfe_clearance_stamp === 'passed' ? 'STAMPED' : 'Processing'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200">
                            <Plane className="w-3 h-3" /> Ready to Book
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-medium rounded-full text-[10px]">
                            In Verification
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all">
                          <Download className="w-3 h-3" /> Dossier
                        </button>
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
