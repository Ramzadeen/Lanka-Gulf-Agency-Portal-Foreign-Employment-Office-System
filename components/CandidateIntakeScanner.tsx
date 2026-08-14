components/'use client';

import React, { useState, useTransition } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, UserCheck, Shield } from 'lucide-react';
import { registerCandidate } from '@/lib/candidates';
import { GCCCountry } from '@/types/database';

interface ExtractedCandidate {
  fullNameEnglish: string;
  fullNameSinhala: string;
  fullNameTamil: string;
  passportNumber: string;
  nicNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  address: string;
  suggestedJobCategory: string;
}

export default function CandidateIntakeScanner({ agencyId }: { agencyId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [destinationCountry, setDestinationCountry] = useState<GCCCountry>('KSA');
  const [jobCategory, setJobCategory] = useState('General Construction');
  const [pdpaConsent, setPdpaConsent] = useState(false);

  const [formData, setFormData] = useState<ExtractedCandidate>({
    fullNameEnglish: '',
    fullNameSinhala: '',
    fullNameTamil: '',
    passportNumber: '',
    nicNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    suggestedJobCategory: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleScanDocument = async () => {
    if (!file) {
      setErrorMessage('Please select a passport or NIC image first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scan the document.');
      }

      setFormData({
        fullNameEnglish: result.data.fullNameEnglish || '',
        fullNameSinhala: result.data.fullNameSinhala || '',
        fullNameTamil: result.data.fullNameTamil || '',
        passportNumber: result.data.passportNumber || '',
        nicNumber: result.data.nicNumber || '',
        dateOfBirth: result.data.dateOfBirth || '',
        gender: result.data.gender === 'Female' ? 'Female' : 'Male',
        address: result.data.address || '',
        suggestedJobCategory: result.data.suggestedJobCategory || '',
      });
      
      if (result.data.suggestedJobCategory) {
        setJobCategory(result.data.suggestedJobCategory);
      }
      
      setSuccessMessage('AI Extraction Complete! Please review details below.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during AI scanning.';
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdpaConsent) {
      setErrorMessage('Worker digital consent under PDPA Act No. 9 of 2022 is mandatory before database entry.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await registerCandidate({
          agency_id: agencyId,
          full_name_en: formData.fullNameEnglish,
          full_name_si: formData.fullNameSinhala,
          full_name_ta: formData.fullNameTamil,
          passport_number: formData.passportNumber,
          nic_number: formData.nicNumber,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          destination_country: destinationCountry,
          job_category: jobCategory,
        });

        setSuccessMessage('Candidate registered and 4-stage compliance tracking initialized successfully!');
        // Reset form
        setFile(null);
        setPreviewUrl(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save candidate to the database.';
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="text-blue-600 h-6 w-6" />
        <h2 className="text-xl font-bold">Lanka-Gulf AI Document Intake Portal</h2>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <input type="file" id="doc-upload" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
        <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center space-y-2">
          <UploadCloud className="h-12 w-12 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Upload Sri Lankan Passport or National Identity Card (NIC)</span>
          <span className="text-xs text-gray-400">Supports JPEG, PNG, WEBP, or PDF</span>
        </label>
        {previewUrl && (
          <div className="mt-4 max-w-xs mx-auto">
            <img src={previewUrl} alt="Preview" className="rounded shadow max-h-48 mx-auto" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleScanDocument}
        disabled={isScanning || !file}
        className="w-full mb-6 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            <span>AI Engine Parsing Document (Extracting English, සිංහල, தமிழ்)...</span>
          </>
        ) : (
          <span>Run AI Document Scanner</span>
        )}
      </button>

      {/* Review Form */}
      <form onSubmit={handleSaveCandidate} className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <UserCheck className="text-gray-700" />
          <span>Extracted Identity Details & Verification</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name (English) *</label>
            <input type="text" required value={formData.fullNameEnglish} onChange={(e) => setFormData({...formData, fullNameEnglish: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Passport Number *</label>
            <input type="text" required value={formData.passportNumber} onChange={(e) => setFormData({...formData, passportNumber: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name (Sinhala - සිංහල)</label>
            <input type="text" value={formData.fullNameSinhala} onChange={(e) => setFormData({...formData, fullNameSinhala: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">NIC Number *</label>
            <input type="text" required value={formData.nicNumber} onChange={(e) => setFormData({...formData, nicNumber: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name (Tamil - தமிழ்)</label>
            <input type="text" value={formData.fullNameTamil} onChange={(e) => setFormData({...formData, fullNameTamil: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth (YYYY-MM-DD) *</label>
            <input type="text" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full border p-2 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Destination GCC Country *</label>
            <select value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value as GCCCountry)} className="w-full border p-2 rounded text-sm bg-white">
              <option value="KSA">Kingdom of Saudi Arabia (KSA)</option>
              <option value="UAE">United Arab Emirates (UAE)</option>
              <option value="QATAR">Qatar</option>
              <option value="OMAN">Oman</option>
              <option value="KUWAIT">Kuwait</option>
              <option value="BAHRAIN">Bahrain</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Job Category *</label>
