'use client';

import React, { useState, useTransition } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, UserCheck, Shield } from 'lucide-react';
import { createCandidateWithGates } from '@/lib/candidates';
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
    }
  };

  const handleScanDocument = async () => {
    if (!file) {
      setErrorMessage('Please select a passport or NIC image first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const payload = new FormData();
      payload.append('file', file);

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scan document.');
      }

      setFormData(result.data);
      if (result.data.suggestedJobCategory) {
        setJobCategory(result.data.suggestedJobCategory);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing document';
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmitCandidate = () => {
    if (!pdpaConsent) {
      setErrorMessage('Candidate data protection consent (PDPA Act No. 9 of 2022) is required.');
      return;
    }

    if (!formData.passportNumber || !formData.nicNumber || !formData.fullNameEnglish) {
      setErrorMessage('Please verify all mandatory identification fields.');
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        await createCandidateWithGates({
          agency_id: agencyId,
          full_name_en: formData.fullNameEnglish,
          full_name_si: formData.fullNameSinhala || null,
          full_name_ta: formData.fullNameTamil || null,
          passport_number: formData.passportNumber.toUpperCase().trim(),
          nic_number: formData.nicNumber.toUpperCase().trim(),
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          destination_country: destinationCountry,
          job_category: jobCategory,
        });

        setSuccessMessage(`Candidate ${formData.fullNameEnglish} registered and compliance gates initiated!`);
        // Reset form
        setFile(null);
        setPreviewUrl(null);
        setFormData({
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
        setPdpaConsent(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Database insertion error';
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Trilingual Candidate Intake</h2>
          <p className="text-sm text-slate-500">Scan Sri Lankan Passports & NICs to automatically populate registration data.</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          <Shield className="w-3.5 h-3.5" /> SLBFE Compliant
        </span>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & Document Viewport */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-slate-400 transition-colors">
            {previewUrl ? (
              <div className="space-y-4">
                <img src={previewUrl} alt="Document Preview" className="max-h-60 mx-auto rounded-lg shadow-sm object-cover" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Remove & Upload Another
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">Upload Passport or NIC</span>
                <span className="text-xs text-slate-400 mt-1">JPEG, PNG, or PDF up to 10MB</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={handleScanDocument}
            disabled={!file || isScanning}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting Trilingual Data...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Run AI Auto-Fill Engine
              </>
            )}
          </button>
        </div>

        {/* Extracted Trilingual Information Form */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Legal Name (English)</label>
            <input
              type="text"
              value={formData.fullNameEnglish}
              onChange={(e) => setFormData({ ...formData, fullNameEnglish: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800 outline-none"
              placeholder="e.g. MOHAMED RASHEED KAMIL"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name in Sinhala (සිංහල)</label>
              <input
                type="text"
                value={formData.fullNameSinhala}
                onChange={(e) => setFormData({ ...formData, fullNameSinhala: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none"
                placeholder="මොහොමඩ් රෂීඩ් කාමිල්"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name in Tamil (தமிழ்)</label>
              <input
                type="text"
                value={formData.fullNameTamil}
                onChange={(e) => setFormData({ ...formData, fullNameTamil: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none"
                placeholder="முகமது ரஷீத் காமில்"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Passport Number</label>
              <input
                type="text"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-mono"
                placeholder="N1234567"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">NIC Number</label>
              <input
                type="text"
                value={formData.nicNumber}
                onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-mono"
                placeholder="198512345678 or 851234567V"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target GCC Country</label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value as GCCCountry)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-semibold"
              >
                <option value="KSA">Saudi Arabia (KSA)</option>
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="QATAR">Qatar</option>
                <option value="OMAN">Oman</option>
                <option value="KUWAIT">Kuwait</option>
                <option value="BAHRAIN">Bahrain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Job Category / Trade</label>
            <input
              type="text"
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none"
              placeholder="e.g. Mason, Electrician, Caregiver"
            />
          </div>

          {/* Legal Compliance Check */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={pdpaConsent}
                onChange={(e) => setPdpaConsent(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I certify that the candidate has given informed consent under the <strong>Personal Data Protection Act No. 9 of 2022</strong> for overseas processing, and that zero unauthorized recruitment fees have been levied on this worker.
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSubmitCandidate}
            disabled={isSaving || !pdpaConsent}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Register Candidate & Initialize Compliance Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
