'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { ComplianceStatus } from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateGateInput {
  candidateId: string;
  gate: 'gamca' | 'training' | 'embassy' | 'slbfe';
  status: ComplianceStatus;
  referenceNumber?: string;
}

export async function updateCandidateComplianceGate(input: UpdateGateInput) {
  const { candidateId, gate, status, referenceNumber } = input;

  try {
    // 1. Fetch current status to enforce legal sequence
    const { data: currentGate, error: fetchError } = await supabase
      .from('compliance_gates')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();

    if (fetchError || !currentGate) {
      return { success: false, error: 'Candidate compliance gate record not found.' };
    }

    // 2. Strict Legal Sequence Verification
    if (gate === 'training' && status === 'passed' && currentGate.gamca_medical_status !== 'passed') {
      return {
        success: false,
        error: 'Compliance Violation: Candidate must pass GAMCA Medical before completing Pre-Departure Training.',
      };
    }

    if (gate === 'embassy' && status === 'passed' && currentGate.pre_departure_training !== 'passed') {
      return {
        success: false,
        error: 'Compliance Violation: Mandatory Pre-Departure Training must be completed prior to Foreign Embassy Contract Attestation.',
      };
    }

    if (gate === 'slbfe' && status === 'passed' && currentGate.embassy_contract_attestation !== 'passed') {
      return {
        success: false,
        error: 'Compliance Violation: Final SLBFE Clearance requires verified Foreign Embassy Contract Attestation.',
      };
    }

    // 3. Construct update payload
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      updated_at: now,
    };

    if (gate === 'gamca') {
      updatePayload.gamca_medical_status = status;
      updatePayload.gamca_updated_at = now;
      if (referenceNumber) updatePayload.gamca_ref_number = referenceNumber;
    } else if (gate === 'training') {
      updatePayload.pre_departure_training = status;
      updatePayload.training_updated_at = now;
      if (referenceNumber) updatePayload.training_certificate_no = referenceNumber;
    } else if (gate === 'embassy') {
      updatePayload.embassy_contract_attestation = status;
      updatePayload.embassy_updated_at = now;
      if (referenceNumber) updatePayload.embassy_ref_no = referenceNumber;
    } else if (gate === 'slbfe') {
      updatePayload.slbfe_clearance_stamp = status;
      updatePayload.slbfe_updated_at = now;
      if (referenceNumber) updatePayload.slbfe_registration_no = referenceNumber;
    }

    // 4. Update the database record
    const { data: updatedRecord, error: updateError } = await supabase
      .from('compliance_gates')
      .update(updatePayload)
      .eq('candidate_id', candidateId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/portal/agency');
    revalidatePath('/portal/dashboard');

    return { success: true, data: updatedRecord };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update statutory compliance gate.';
    return { success: false, error: message };
  }
}
