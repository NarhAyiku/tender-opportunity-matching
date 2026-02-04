import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, X, Plus, MapPin, DollarSign, Briefcase, Building, Globe, Check } from 'lucide-react';

const JOB_LEVELS = [
  { id: 'entry', label: 'Entry Level' },
  { id: 'mid', label: 'Mid Level' },
  { id: 'senior', label: 'Senior Level' },
  { id: 'lead', label: 'Lead / Manager' },
  { id: 'executive', label: 'Executive' },
];

const WORK_ARRANGEMENTS = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
];

const OPPORTUNITY_TYPES = [
  { id: 'job', label: 'Full-time Job' },
  { id: 'internship', label: 'Internship' },
  { id: 'contract', label: 'Contract' },
  { id: 'scholarship', label: 'Scholarship' },
  { id: 'grant', label: 'Grant' },
];

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup (1-50)' },
  { id: 'small', label: 'Small (51-200)' },
  { id: 'medium', label: 'Medium (201-1000)' },
  { id: 'large', label: 'Large (1001-5000)' },
  { id: 'enterprise', label: 'Enterprise (5000+)' },
];

function MultiSelect({ options, selected, onChange, label, icon: Icon }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
        <h3 className="font-medium text-slate-900">{label}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selected.includes(opt.id)
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TagInput({ tags, onChange, label, placeholder, icon: Icon }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
        <h3 className="font-medium text-slate-900">{label}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
        <button
          onClick={addTag}
          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function LocationInput({ locations, onChange }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLocation, setNewLocation] = useState({ city: '', country: '', radius_miles: 50 });

  const addLocation = () => {
    if (newLocation.city.trim()) {
      onChange([...locations, { ...newLocation, city: newLocation.city.trim() }]);
      setNewLocation({ city: '', country: '', radius_miles: 50 });
      setShowAdd(false);
    }
  };

  const removeLocation = (index) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const updateRadius = (index, radius) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], radius_miles: radius };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-900">Preferred Locations</h3>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-emerald-600 font-medium"
        >
          + Add Location
        </button>
      </div>

      {locations.map((loc, i) => (
        <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-slate-900">{loc.city}</p>
              {loc.country && <p className="text-sm text-slate-500">{loc.country}</p>}
            </div>
            <button onClick={() => removeLocation(i)} className="text-slate-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
              <span>5 miles</span>
              <span className="font-medium text-emerald-600">{loc.radius_miles} miles</span>
              <span>100 miles</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={loc.radius_miles}
              onChange={(e) => updateRadius(i, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      ))}

      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newLocation.city}
            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
            placeholder="City name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <input
            type="text"
            value={newLocation.country}
            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
            placeholder="Country (optional)"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={addLocation}
              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {locations.length === 0 && !showAdd && (
        <p className="text-sm text-slate-400">No locations added. Add your preferred work locations.</p>
      )}
    </div>
  );
}

function SalaryRange({ min, max, currency, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-slate-400" />
        <h3 className="font-medium text-slate-900">Salary Expectations</h3>
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">Minimum</label>
          <input
            type="number"
            value={min || ''}
            onChange={(e) => onChange({ min: e.target.value ? parseFloat(e.target.value) : null, max, currency })}
            placeholder="Min salary"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <span className="text-slate-400 pt-5">—</span>
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">Maximum</label>
          <input
            type="number"
            value={max || ''}
            onChange={(e) => onChange({ min, max: e.target.value ? parseFloat(e.target.value) : null, currency })}
            placeholder="Max salary"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-slate-500 mb-1 block">Currency</label>
          <select
            value={currency}
            onChange={(e) => onChange({ min, max, currency: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="GHS">GHS</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function Preferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [prefs, setPrefs] = useState({
    desired_job_titles: [],
    preferred_locations: [],
    willing_to_relocate: 'no',
    salary_min: null,
    salary_max: null,
    salary_currency: 'USD',
    job_levels: [],
    work_arrangements: [],
    opportunity_types: [],
    preferred_industries: [],
    company_sizes: [],
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (data?.preferences) {
        setPrefs({ ...prefs, ...data.preferences });
      }
    } catch (err) {
      console.error('Preferences load error:', err);
      // Don't show error if preferences just don't exist yet
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences: prefs, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;
      navigate(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Edit Job Preferences</h1>
          </div>
          <button
            onClick={() => setPrefs({
              desired_job_titles: [],
              preferred_locations: [],
              willing_to_relocate: 'no',
              salary_min: null,
              salary_max: null,
              salary_currency: 'USD',
              job_levels: [],
              work_arrangements: [],
              opportunity_types: [],
              preferred_industries: [],
              company_sizes: [],
            })}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-6 space-y-8 pb-32">
        <TagInput
          tags={prefs.desired_job_titles}
          onChange={(tags) => setPrefs({ ...prefs, desired_job_titles: tags })}
          label="Job Titles"
          placeholder="e.g., Software Engineer"
          icon={Briefcase}
        />

        <LocationInput
          locations={prefs.preferred_locations}
          onChange={(locations) => setPrefs({ ...prefs, preferred_locations: locations })}
        />

        <SalaryRange
          min={prefs.salary_min}
          max={prefs.salary_max}
          currency={prefs.salary_currency}
          onChange={({ min, max, currency }) => setPrefs({ ...prefs, salary_min: min, salary_max: max, salary_currency: currency })}
        />

        <MultiSelect
          options={JOB_LEVELS}
          selected={prefs.job_levels}
          onChange={(levels) => setPrefs({ ...prefs, job_levels: levels })}
          label="Job Levels"
          icon={Briefcase}
        />

        <MultiSelect
          options={WORK_ARRANGEMENTS}
          selected={prefs.work_arrangements}
          onChange={(arrangements) => setPrefs({ ...prefs, work_arrangements: arrangements })}
          label="Work Arrangement"
          icon={Globe}
        />

        <MultiSelect
          options={OPPORTUNITY_TYPES}
          selected={prefs.opportunity_types}
          onChange={(types) => setPrefs({ ...prefs, opportunity_types: types })}
          label="Opportunity Types"
          icon={Briefcase}
        />

        <MultiSelect
          options={COMPANY_SIZES}
          selected={prefs.company_sizes}
          onChange={(sizes) => setPrefs({ ...prefs, company_sizes: sizes })}
          label="Company Size"
          icon={Building}
        />

        <TagInput
          tags={prefs.preferred_industries}
          onChange={(industries) => setPrefs({ ...prefs, preferred_industries: industries })}
          label="Preferred Industries"
          placeholder="e.g., Technology, Healthcare"
          icon={Building}
        />
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-100">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="w-full py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Apply Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
