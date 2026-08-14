/export type UserRole = 'agency_admin' | 'gcc_employer' | 'sub_agent';
export type ComplianceStatus = 'pending' | 'in_progress' | 'passed' | 'rejected';
export type GCCCountry = 'KSA' | 'UAE' | 'QATAR' | 'OMAN' | 'KUWAIT' | 'BAHRAIN';

export interface Candidate {
  id: string;
  sub_agent_id?: string;
  assigned_employer_id?: string;
  agency_id: string;
  full_name_en: string;
  full_name_si?: string;
  full_name_ta?: string;
  passport_number: string;
  nic_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  destination_country: GCCCountry;
  job_category: string;
  created_at: string;
}

export interface ComplianceGates {
  id: string;
  candidate_id: string;
  gamca_medical_status: ComplianceStatus;
  pre_departure_training: ComplianceStatus;
  embassy_contract_attestation: ComplianceStatus;
  slbfe_clearance_stamp: ComplianceStatus;
  is_fully_cleared: boolean;
}
