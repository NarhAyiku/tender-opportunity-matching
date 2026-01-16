import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { preferencesApi } from '../api';
import { AppLayout } from '../components/layout';
import { Button, Input, Card, Spinner } from '../components/common';
import { UserPreferences, LocationPreference, PreferencesUpdateRequest } from '../types';

const JOB_LEVELS = ['entry', 'mid', 'senior', 'executive'];
const WORK_ARRANGEMENTS = ['remote', 'hybrid', 'onsite'];
const OPPORTUNITY_TYPES = ['job', 'internship', 'scholarship', 'grant'];

export function PreferencesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    desired_job_titles: [],
    preferred_locations: [],
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: 'USD',
    job_levels: [],
    work_arrangements: [],
    opportunity_types: [],
    is_actively_looking: true,
  });

  const [newJobTitle, setNewJobTitle] = useState('');
  const [newLocation, setNewLocation] = useState({ city: '', country: '' });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await preferencesApi.getPreferences();
        setPreferences(data);
      } catch {
        // No preferences yet, use defaults
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const updateData: PreferencesUpdateRequest = {
        desired_job_titles: preferences.desired_job_titles,
        preferred_locations: preferences.preferred_locations,
        salary_min: preferences.salary_min,
        salary_max: preferences.salary_max,
        salary_currency: preferences.salary_currency,
        job_levels: preferences.job_levels,
        work_arrangements: preferences.work_arrangements,
        opportunity_types: preferences.opportunity_types,
        is_actively_looking: preferences.is_actively_looking,
      };

      await preferencesApi.updatePreferences(updateData);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  const addJobTitle = () => {
    if (newJobTitle.trim() && !preferences.desired_job_titles?.includes(newJobTitle.trim())) {
      setPreferences({
        ...preferences,
        desired_job_titles: [...(preferences.desired_job_titles || []), newJobTitle.trim()],
      });
      setNewJobTitle('');
    }
  };

  const removeJobTitle = (title: string) => {
    setPreferences({
      ...preferences,
      desired_job_titles: preferences.desired_job_titles?.filter((t) => t !== title),
    });
  };

  const addLocation = () => {
    if (newLocation.city.trim() && newLocation.country.trim()) {
      const loc: LocationPreference = {
        city: newLocation.city.trim(),
        country: newLocation.country.trim(),
      };
      setPreferences({
        ...preferences,
        preferred_locations: [...(preferences.preferred_locations || []), loc],
      });
      setNewLocation({ city: '', country: '' });
    }
  };

  const removeLocation = (index: number) => {
    setPreferences({
      ...preferences,
      preferred_locations: preferences.preferred_locations?.filter((_, i) => i !== index),
    });
  };

  const toggleArrayItem = (
    field: 'job_levels' | 'work_arrangements' | 'opportunity_types',
    item: string
  ) => {
    const current = preferences[field] || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setPreferences({ ...preferences, [field]: updated });
  };

  if (isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Job Preferences</h1>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Job Titles */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Desired Job Titles</h2>
            <div className="flex gap-2 mb-3">
              <Input
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addJobTitle();
                  }
                }}
              />
              <Button type="button" onClick={addJobTitle} variant="secondary">
                <Plus size={20} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.desired_job_titles?.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {title}
                  <button type="button" onClick={() => removeJobTitle(title)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Locations */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Preferred Locations</h2>
            <div className="flex gap-2 mb-3">
              <Input
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                placeholder="City"
              />
              <Input
                value={newLocation.country}
                onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                placeholder="Country"
              />
              <Button type="button" onClick={addLocation} variant="secondary">
                <Plus size={20} />
              </Button>
            </div>
            <div className="space-y-2">
              {preferences.preferred_locations?.map((loc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">
                    {loc.city}, {loc.country}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Salary Range */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Salary Expectations</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum"
                type="number"
                value={preferences.salary_min || ''}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    salary_min: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="50000"
              />
              <Input
                label="Maximum"
                type="number"
                value={preferences.salary_max || ''}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    salary_max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="100000"
              />
            </div>
          </Card>

          {/* Job Levels */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Experience Level</h2>
            <div className="flex flex-wrap gap-2">
              {JOB_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleArrayItem('job_levels', level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    preferences.job_levels?.includes(level)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          {/* Work Arrangements */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Work Arrangement</h2>
            <div className="flex flex-wrap gap-2">
              {WORK_ARRANGEMENTS.map((arr) => (
                <button
                  key={arr}
                  type="button"
                  onClick={() => toggleArrayItem('work_arrangements', arr)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    preferences.work_arrangements?.includes(arr)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {arr.charAt(0).toUpperCase() + arr.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          {/* Opportunity Types */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Opportunity Types</h2>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem('opportunity_types', type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    preferences.opportunity_types?.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          {/* Actively Looking */}
          <Card>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Actively Looking</p>
                <p className="text-sm text-gray-500">Show recruiters you're open to opportunities</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.is_actively_looking ?? true}
                onChange={(e) =>
                  setPreferences({ ...preferences, is_actively_looking: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </Card>

          <Button type="submit" className="w-full" size="lg" isLoading={isSaving}>
            Save Preferences
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
