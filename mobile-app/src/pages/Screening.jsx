import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  Check,
  Circle,
  CheckCircle2,
  MapPin,
  Calendar,
  Globe,
  FileText,
  Shield,
  X,
  Plus,
  Upload,
  Loader2,
  Sparkles,
} from 'lucide-react';
import useFileUpload from '../lib/useFileUpload';
import useResumeParser from '../lib/useResumeParser';

const STEP_COUNT = 5;

function DocumentUploadStep({ form, setForm, userId, onBack, onNext }) {
  const { parseFile, parsing, parseError } = useResumeParser();

  const resumeUpload = useFileUpload({
    bucket: 'resumes',
    urlColumn: 'resume_url',
    filenameColumn: 'cv_filename',
    userId,
    onSuccess: async () => {
      setForm((prev) => ({ ...prev, has_resume: true }));
    },
  });

  const transcriptUpload = useFileUpload({
    bucket: 'transcripts',
    urlColumn: 'transcript_url',
    filenameColumn: 'transcript_filename',
    userId,
    onSuccess: () => setForm((prev) => ({ ...prev, has_transcript: true })),
  });

  // Custom handler to capture file for parsing before upload keeps going
  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Start parsing
      const parsedData = await parseFile(file);
      if (parsedData) {
        setForm(prev => ({
          ...prev,
          // Only overwrite if empty to respect user edits
          name: prev.name || parsedData.name,
          email: prev.email || parsedData.email,
          phone: prev.phone || parsedData.phone,
        }));
      }
    }
    // Pass to original handler
    resumeUpload.handleFileChange(e);
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hidden file inputs */}
      <input
        ref={resumeUpload.inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleResumeSelect}
      />
      <input
        ref={transcriptUpload.inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={transcriptUpload.handleFileChange}
      />

      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-2xl shadow-inner">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upload Documents</h3>
          <p className="text-sm text-slate-500 font-medium">Auto-fill your profile instantly</p>
        </div>
      </div>

      {/* Parsing Status Banner */}
      {parsing && (
        <div className="p-4 bg-blue-50/90 backdrop-blur-sm border border-blue-100 text-blue-700 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm ring-1 ring-blue-100">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI is analyzing your resume...</span>
        </div>
      )}

      {parseError && (
        <div className="p-3 bg-red-50/90 backdrop-blur-sm border border-red-100 text-red-600 rounded-2xl text-sm font-medium shadow-sm">
          {parseError}
        </div>
      )}

      {(resumeUpload.error || transcriptUpload.error) && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {resumeUpload.error || transcriptUpload.error}
        </div>
      )}

      <div className="space-y-4">
        {/* Resume row */}
        <div
          className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${form.has_resume
            ? 'border-purple-200 bg-purple-50/80 shadow-md ring-1 ring-purple-100'
            : 'border-white/60 bg-white/60 hover:bg-white/90 hover:border-purple-300 hover:shadow-lg hover:scale-[1.01]'
            }`}
        >
          <div className={`p-3 rounded-xl transition-colors ${form.has_resume ? 'bg-purple-100' : 'bg-white shadow-sm group-hover:scale-110 transition-transform'}`}>
            {form.has_resume ? (
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            ) : resumeUpload.uploading || parsing ? (
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-500" />
            )}
          </div>

          <div className="flex-1">
            <span className="block font-bold text-slate-900">Resume / CV</span>
            <span className="text-sm text-slate-500 font-medium">
              {parsing ? 'Extracting details...' : form.has_resume ? 'Ready to use' : 'PDF or DOCX'}
            </span>
          </div>

          {form.has_resume ? (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-sm">
              Uploaded
            </span>
          ) : (
            <button
              onClick={resumeUpload.triggerPicker}
              disabled={resumeUpload.uploading || parsing}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              {resumeUpload.uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>

        {/* Transcript row */}
        <div
          className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${form.has_transcript
            ? 'border-purple-200 bg-purple-50/80 shadow-md ring-1 ring-purple-100'
            : 'border-white/60 bg-white/60 hover:bg-white/90 hover:border-purple-300 hover:shadow-lg hover:scale-[1.01]'
            }`}
        >
          <div className={`p-3 rounded-xl transition-colors ${form.has_transcript ? 'bg-purple-100' : 'bg-white shadow-sm group-hover:scale-110 transition-transform'}`}>
            {form.has_transcript ? (
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            ) : transcriptUpload.uploading ? (
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-500" />
            )}
          </div>

          <div className="flex-1">
            <span className="block font-bold text-slate-900">Transcript</span>
            <span className="text-sm text-slate-500 font-medium">Optional</span>
          </div>

          {form.has_transcript ? (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-sm">
              Uploaded
            </span>
          ) : (
            <button
              onClick={transcriptUpload.triggerPicker}
              disabled={transcriptUpload.uploading}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              {transcriptUpload.uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={onBack}
          className="px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 bg-gradient-premium text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Screening() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    age: '',
    location: '',
    preferred_countries: [],
    has_resume: false,
    has_transcript: false,
    consent_share_documents: false,
    name: '',
    email: '',
    phone: '',
  });
  const [countryInput, setCountryInput] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before fetching screening data
    if (authLoading) return;

    let cancelled = false;

    const loadScreeningData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('screening, age, location, preferred_countries, consent_share_documents, resume_url, transcript_url')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (data) {
          const screening = data.screening || {};
          setForm({
            age: screening.age || data.age || '',
            location: screening.location || data.location || '',
            preferred_countries: screening.preferred_countries || data.preferred_countries || [],
            has_resume: !!data.resume_url,
            has_transcript: !!data.transcript_url,
            consent_share_documents: screening.consent_share_documents || data.consent_share_documents || false,
          });
        }
      } catch (err) {
        if (cancelled) return;
        // AbortErrors are expected during auth transitions — ignore silently
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
        console.error('Screening load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadScreeningData();

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const addCountry = () => {
    const trimmed = countryInput.trim();
    if (trimmed && !form.preferred_countries.includes(trimmed)) {
      setForm({ ...form, preferred_countries: [...form.preferred_countries, trimmed] });
      setCountryInput('');
    }
  };

  const removeCountry = (country) => {
    setForm({ ...form, preferred_countries: form.preferred_countries.filter((c) => c !== country) });
  };

  const checklist = [
    { key: 'age', label: 'Age', done: !!form.age },
    { key: 'location', label: 'Location', done: !!form.location },
    { key: 'countries', label: 'Preferred countries', done: form.preferred_countries.length > 0 },
    { key: 'docs', label: 'Resume & transcript uploaded', done: form.has_resume && form.has_transcript },
    { key: 'consent', label: 'Document sharing consent', done: form.consent_share_documents },
  ];

  const allComplete = checklist.every((c) => c.done);

  const completeScreening = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          screening: {
            age: parseInt(form.age, 10),
            location: form.location,
            preferred_countries: form.preferred_countries,
            consent_share_documents: form.consent_share_documents,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          age: parseInt(form.age, 10),
          location: form.location,
          preferred_countries: form.preferred_countries,
          consent_share_documents: form.consent_share_documents,
          screening_completed: true,
          screening_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Persist extracted data
          name: form.name || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-premium opacity-10 rounded-b-[3rem]" />

      {/* Header */}
      <div className="sticky top-0 z-10 glass backdrop-blur-md border-b border-white/20">
        <div className="safe-area-top" />
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">One-Time Setup</h1>
            <p className="text-xs text-slate-500 font-medium">Complete to unlock opportunities</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-40 relative z-0">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 px-1">
          {checklist.map((item, idx) => (
            <div
              key={item.key}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${item.done ? 'bg-green-500' : currentStep === idx ? 'bg-purple-500' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium shadow-sm animate-shake">
            {error}
          </div>
        )}

        {/* Step 0: Age */}
        {currentStep === 0 && (
          <div className="glass-card rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-2xl shadow-inner">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">How old are you?</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Age (Years)</label>
              <input
                type="number"
                min="16"
                max="99"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 21"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-lg font-medium placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              disabled={!form.age}
              className="w-full py-4 bg-gradient-premium text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="glass-card rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-2xl shadow-inner">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Where are you located?</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 ml-1">Current City</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Accra, Ghana"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-lg font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!form.location}
                className="flex-1 py-4 bg-gradient-premium text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferred countries */}
        {currentStep === 2 && (
          <div className="glass-card rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-2xl shadow-inner">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Where do you want to work?</h3>
            </div>

            <div className="space-y-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                  placeholder="e.g., United States"
                  className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg font-medium placeholder:text-slate-400"
                />
                <button
                  onClick={addCountry}
                  className="px-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {form.preferred_countries.length === 0 && (
                <p className="text-slate-400 text-sm italic w-full text-center py-2">Add at least one country</p>
              )}
              {form.preferred_countries.map((country) => (
                <span
                  key={country}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold shadow-sm border border-indigo-100 animate-in zoom-in duration-300"
                >
                  {country}
                  <button onClick={() => removeCountry(country)} className="hover:text-indigo-900 hover:bg-indigo-100 rounded-full p-0.5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={form.preferred_countries.length === 0}
                className="flex-1 py-4 bg-gradient-premium text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Documents (inline upload) */}
        {currentStep === 3 && (
          <DocumentUploadStep
            form={form}
            setForm={setForm}
            userId={user?.id}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {/* Step 4: Consent */}
        {currentStep === 4 && (
          <div className="glass-card rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-2xl shadow-inner">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Privacy & Consent</h3>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
              When you express interest in an opportunity, we automatically share your profile, resume, and transcript with the employer to expedite the process.
            </div>

            <label className="flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:bg-slate-50 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/30 border-slate-200">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={form.consent_share_documents}
                  onChange={(e) => setForm({ ...form, consent_share_documents: e.target.checked })}
                  className="peer h-6 w-6 rounded-lg border-slate-300 text-purple-600 focus:ring-purple-500/30"
                />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-slate-900 mb-1">
                  I consent to sharing my documents
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  We'll only share when you explicitly click "Apply" or swipe right.
                </span>
              </div>
            </label>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent z-20">
        <div className="safe-area-bottom">
          <button
            onClick={completeScreening}
            disabled={saving || !allComplete}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 active:scale-95"
          >
            {saving ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : allComplete ? (
              <>
                <span className="text-lg">Finish Setup</span>
                <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
              </>
            ) : (
              <span className="text-slate-300 font-medium">
                {checklist.filter((c) => c.done).length} of {checklist.length} steps complete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
