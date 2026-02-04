import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ApplicationPreview() {
  const { swipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swipe, setSwipe] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSwipe();
  }, [swipeId, user]);

  const loadSwipe = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch swipe with opportunity details
      const { data, error: fetchError } = await supabase
        .from('swipes')
        .select(`
          *,
          opportunity:opportunities(*)
        `)
        .eq('id', swipeId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) {
        setError('Swipe not found');
        return;
      }
      setSwipe(data);
      setCoverLetter(data.cover_letter || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (skipSavingState = false) => {
    if (!user) return false;

    try {
      if (!skipSavingState) {
        setSaving(true);
      }
      setError(null);

      const { error: updateError } = await supabase
        .from('swipes')
        .update({ cover_letter: coverLetter })
        .eq('id', swipeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      await loadSwipe();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      if (!skipSavingState) {
        setSaving(false);
      }
    }
  };

  const handleApprove = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      // Save any edits first
      const saveSuccess = await handleSaveEdit(true);
      if (!saveSuccess) {
        setError('Failed to save edits. Please try again before approving.');
        setSaving(false);
        return;
      }

      // Update swipe status to approved
      const { error: approveError } = await supabase
        .from('swipes')
        .update({ action: 'applied' })
        .eq('id', swipeId)
        .eq('user_id', user.id);

      if (approveError) throw approveError;
      navigate('/feed');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/feed');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !swipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">{error || 'Swipe not found'}</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const opportunity = swipe.opportunity;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Review Application</h1>
        </div>
        <div className="flex items-center gap-3 mt-3">
          {opportunity.company_logo_url ? (
            <img src={opportunity.company_logo_url} alt={opportunity.company_name} className="w-12 h-12 rounded-lg" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-400">
                {opportunity.company_name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{opportunity.title}</h2>
            <p className="text-sm text-gray-500">{opportunity.company_name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter
            <span className="text-xs text-gray-500 ml-2">(Edit as needed)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Your cover letter will appear here..."
          />
          <p className="text-xs text-gray-500 mt-2">
            This cover letter was generated based on your profile. Please review and edit before submitting.
          </p>
        </div>

        {/* Job Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
          <div className="space-y-2 text-sm">
            {opportunity.description && (
              <div>
                <span className="text-gray-500">Description: </span>
                <span className="text-gray-900">{opportunity.description.substring(0, 200)}...</span>
              </div>
            )}
            {opportunity.city && (
              <div>
                <span className="text-gray-500">Location: </span>
                <span className="text-gray-900">
                  {opportunity.city}{opportunity.country ? `, ${opportunity.country}` : ''}
                  {opportunity.is_remote && ' (Remote)'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="flex-1 px-4 py-3 border border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Edits'}
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Submitting...' : 'Approve & Submit'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
