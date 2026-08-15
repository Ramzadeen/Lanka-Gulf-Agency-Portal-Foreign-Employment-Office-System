'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function recordSubAgentReferral(data: {
  subAgentId: string;
  agencyId: string;
  fullNameEn: string;
  passportNumber: string;
  nicNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  destinationCountry: 'KSA' | 'UAE' | 'QATAR' | 'OMAN' | 'KUWAIT' | 'BAHRAIN';
  jobCategory: string;
  commissionLkr: number;
}) {
  try {
    // 1. Insert candidate tied to sub-agent
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({
        sub_agent_id: data.subAgentId,
        agency_id: data.agencyId,
        full_name_en: data.fullNameEn,
        passport_number: data.passportNumber.toUpperCase().trim(),
        nic_number: data.nicNumber.toUpperCase().trim(),
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        destination_country: data.destinationCountry,
        job_category: data.jobCategory,
      })
      .select()
      .single();

    if (candidateError) throw candidateError;

    // 2. Initialize Compliance Gates
    const { error: gateError } = await supabase
      .from('compliance_gates')
      .insert({ candidate_id: candidate.id });

    if (gateError) throw gateError;

    // 3. Initialize Sub-Agent Commission Record
    const { error: commissionError } = await supabase
      .from('commissions')
      .insert({
        sub_agent_id: data.subAgentId,
        candidate_id: candidate.id,
        amount_lkr: data.commissionLkr,
        payout_status: 'pending',
        notes: 'Initial referral recorded. Pending GAMCA and SLBFE clearance.',
      });

    if (commissionError) throw commissionError;

    revalidatePath('/portal/sub-agent');
    return { success: true, candidateId: candidate.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Referral registration failed';
    return { success: false, error: message };
  }
}

export async function updateCommissionStatus(commissionId: string, status: 'pending' | 'approved' | 'disbursed' | 'cancelled') {
  try {
    const { error } = await supabase
      .from('commissions')
      .update({ payout_status: status, updated_at: new Date().toISOString() })
      .eq('id', commissionId);

    if (error) throw error;
    revalidatePath('/portal/sub-agent');
    revalidatePath('/portal/agency');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Commission status update failed';
    return { success: false, error: message };
  }
}
