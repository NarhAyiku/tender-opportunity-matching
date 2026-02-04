import { useState, useRef, useCallback } from 'react';
import { supabase } from './supabase';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function isAllowedFile(file) {
  // Check MIME type first
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true;
  // Fallback: check extension (some browsers don't set MIME correctly for PDFs)
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Reusable hook for uploading files to Supabase Storage and updating the profile row.
 *
 * @param {object} options
 * @param {'resumes'|'transcripts'} options.bucket       – Storage bucket name.
 * @param {string}                  options.urlColumn     – Profile column for the public URL (e.g. "resume_url").
 * @param {string}                  options.filenameColumn – Profile column for the original filename (e.g. "cv_filename").
 * @param {string}                  options.userId        – Current auth user id.
 * @param {() => void}             [options.onSuccess]    – Callback after successful upload + profile update.
 */
export default function useFileUpload({ bucket, urlColumn, filenameColumn, userId, onSuccess }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const triggerPicker = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset input so the same file can be re-selected
      event.target.value = '';

      // --- Validate type ---
      if (!isAllowedFile(file)) {
        setError('Only PDF and DOCX files are allowed.');
        return;
      }

      // --- Validate size ---
      if (file.size > MAX_SIZE_BYTES) {
        setError('File must be smaller than 10 MB.');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        // Build a unique path: <userId>/<timestamp>_<filename>
        const filePath = `${userId}/${Date.now()}_${file.name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl || '';

        // Update the profile row
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            [urlColumn]: publicUrl,
            [filenameColumn]: file.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        onSuccess?.();
      } catch (err) {
        // AbortErrors during auth transitions — retry once after a short delay
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
          try {
            await new Promise(r => setTimeout(r, 1000));
            const retryPath = `${userId}/${Date.now()}_${file.name}`;
            const { error: retryErr } = await supabase.storage
              .from(bucket)
              .upload(retryPath, file, { upsert: true });
            if (!retryErr) {
              const { data: retryUrl } = supabase.storage.from(bucket).getPublicUrl(retryPath);
              await supabase
                .from('profiles')
                .update({
                  [urlColumn]: retryUrl?.publicUrl || '',
                  [filenameColumn]: file.name,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId);
              onSuccess?.();
              return;
            }
          } catch (_) {
            // Fall through to generic error
          }
        }
        console.error(`Upload to ${bucket} failed:`, err);
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [bucket, urlColumn, filenameColumn, userId, onSuccess],
  );

  return { inputRef, uploading, error, triggerPicker, handleFileChange };
}
