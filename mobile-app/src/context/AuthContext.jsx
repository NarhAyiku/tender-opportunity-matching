import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const isAbortError = (err) =>
  err?.name === 'AbortError' ||
  err?.message?.includes('aborted') ||
  err?.message?.includes('AbortError');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchIdRef = useRef(0);

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId) => {
    const fetchId = ++fetchIdRef.current;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Discard stale results if a newer fetch was started
      if (fetchId !== fetchIdRef.current) return null;

      if (error && error.code !== 'PGRST116') {
        if (isAbortError(error)) return null;
        console.error('[Auth] Error fetching profile:', error);
      }
      return data;
    } catch (err) {
      if (isAbortError(err)) return null;
      console.error('[Auth] Profile fetch error:', err);
      return null;
    }
  }, []);

  // Initialize auth state — callback ONLY sets user state (no async Supabase queries).
  // This prevents deadlocks where .from() queries queue behind an incomplete session update.
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        console.log('[Auth] State changed:', event);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Safety fallback: if onAuthStateChange hasn't fired within 2s
    const fallbackTimer = setTimeout(() => {
      if (mounted && loading) {
        console.log('[Auth] Fallback: clearing loading state');
        setLoading(false);
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile in a SEPARATE effect that reacts to user changes.
  // This runs AFTER the auth state is fully committed, so .from() queries work.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadProfile = async () => {
      const data = await fetchProfile(user.id);
      if (!cancelled && data) {
        setProfile(data);
      }
    };

    loadProfile();

    return () => { cancelled = true; };
  }, [user?.id, fetchProfile]);

  // Sign up with email/password
  const signup = async ({ email, password, name }) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      console.log('[Auth] Signup successful:', data.user?.email);
      return data;
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email/password
  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('[Auth] Login successful:', data.user?.email);
      return data;
    } catch (err) {
      console.error('[Auth] Login error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google OAuth
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/feed`
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Auth] Google login error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign in with GitHub OAuth
  const loginWithGitHub = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/feed`
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Auth] GitHub login error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      // Optimistically clear state
      setUser(null);
      setProfile(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log('[Auth] Logged out');
    } catch (err) {
      console.error('[Auth] Logout error:', err);
      // Ensure state is cleared even if network request fails
      setUser(null);
      setProfile(null);
      setError(err.message);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err) {
      console.error('[Auth] Profile update error:', err);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
