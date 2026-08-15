'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loginWithRole(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // 1. Authenticate user via Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Invalid login credentials.' };
  }

  // 2. Fetch User Profile & Role from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, agency_name, full_name')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found. Contact the SLBFE Agency Administrator.' };
  }

  // 3. Role-Based Route Redirection
  switch (profile.role) {
    case 'agency_admin':
      redirect('/portal/agency/compliance');
    case 'gcc_employer':
      redirect('/portal/employer');
    case 'sub_agent':
      redirect('/portal/sub-agent');
    default:
      redirect('/');
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  redirect('/login');
}
