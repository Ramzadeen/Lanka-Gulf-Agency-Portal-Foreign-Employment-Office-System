lib/import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function createCandidateWithGates(candidateData: Record<string, unknown>) {
  const supabase = createClientComponentClient();

  // 1. Insert Candidate Profile
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert([candidateData])
    .select()
    .single();

  if (candidateError) throw candidateError;

  // 2. Initialize Empty Compliance Gates Engine
  const { error: gateError } = await supabase
    .from('compliance_gates')
    .insert([{ candidate_id: candidate.id }]);

  if (gateError) throw gateError;

  return candidate;
}
