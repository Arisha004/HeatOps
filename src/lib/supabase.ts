import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Default project credentials provided for HeatOps Supabase instance
const DEFAULT_SUPABASE_URL = 'https://unmuahscjrivzkiagbik.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_OHZ3299UZW_cTooUuH0Ohw_khfk01sU';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase client instance
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'hse_lead' | 'site_supervisor' | 'contractor_lead';
  organization: string;
  siteRegion: string;
}

const LOCAL_STORAGE_AUTH_KEY = 'heatops_auth_session';

export const getStoredLocalUser = (): AuthProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredLocalUser = (profile: AuthProfile | null) => {
  try {
    if (!profile) {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed saving local auth state:', e);
  }
};

export const clearStoredLocalUser = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  } catch (e) {
    console.error('Failed clearing local auth state:', e);
  }
};

// Convert Supabase User object into HeatOps AuthProfile
export const mapSupabaseUserToProfile = (user: User): AuthProfile => {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    fullName: meta.full_name || user.email?.split('@')[0] || 'Contractor Supervisor',
    role: meta.role || 'site_supervisor',
    organization: meta.organization || 'L&T Heavy Civil / Sub-Contractor',
    siteRegion: meta.site_region || 'US Sun Belt Zone 1',
  };
};

export const signOutContractor = async () => {
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn('Supabase remote signout warning:', err);
  } finally {
    clearStoredLocalUser();
  }
};

/**
 * Persist site risk assessment to Supabase table `heat_assessments`
 * Gracefully ignores if table does not exist or if offline.
 */
export const persistAssessmentToSupabase = async (
  assessment: any,
  userProfile?: AuthProfile | null
) => {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const payload = {
      assessment_id: assessment.id,
      site_name: assessment.siteName,
      location: assessment.location,
      activity_type: assessment.activityType,
      decision_status: assessment.decisionStatus,
      threshold_temp: assessment.thresholdTemp,
      current_temp: assessment.currentTemp,
      heat_index: assessment.currentHeatIndex,
      data_payload: assessment,
      user_id: userProfile?.id || null,
      user_email: userProfile?.email || null,
      created_at: new Date().toISOString(),
    };

    await supabase.from('heat_assessments').upsert(payload, { onConflict: 'assessment_id' });
  } catch (err) {
    // Non-blocking: local state remains fully functional
    console.debug('Supabase sync skipped or table not initialized:', err);
  }
};

