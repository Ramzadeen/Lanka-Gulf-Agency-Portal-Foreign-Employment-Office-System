import { createClient } from '@supabase/supabase-js';
import AgencyComplianceTable from '@/components/AgencyComplianceTable';
import CandidateIntakeScanner from '@/components/CandidateIntakeScanner';

export const revalidate = 0; // Dynamic data

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AgencyCompliancePage() {
  // Fetch candidates joined with their compliance gates
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select(`
      id,
      full_name_en,
      passport_number,
      nic_number,
      destination_country,
      job_category,
      compliance_gates (
        gamca_medical_status,
        gamca_ref_number,
        pre_departure_training,
        training_certificate_no,
        embassy_contract_attestation,
        embassy_ref_no,
        slbfe_clearance_stamp,
        slbfe_registration_no,
        is_fully_cleared
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
        Failed to fetch compliance registry: {error.message}
      </div>
    );
  }

  // Format single gate object from array response
  const formattedCandidates = (candidates || []).map((c: any) => ({
    ...c,
    compliance_gates: Array.isArray(c.compliance_gates) ? c.compliance_gates[0] : c.compliance_gates,
  }));

  // Demo fallback agency ID for testing
  const agencyId = '00000000-0000-0000-0000-000000000000';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Foreign Employment Agency Compliance Engine</h1>
        <p className="text-sm text-slate-500">SLBFE clearance pipeline and GCC deployment verification system</p>
      </div>

      {/* Pillar 2: AI Intake */}
      <CandidateIntakeScanner agencyId={agencyId} />

      {/* Pillar 1: Compliance Gate Registry */}
      <AgencyComplianceTable candidates={formattedCandidates} />
    </div>
  );
}
