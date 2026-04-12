import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("Seeding Admin user (dwiSan)...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'dwisan@bites2bytes.internal',
    password: 'ki54nt05',
    email_confirm: true,
    user_metadata: {
      username: 'dwiSan',
      role: 'admin'
    }
  });

  if (error) {
    console.error("Failed to seed admin:", error.message);
  } else {
    console.log("Success! Admin seeded with ID:", data.user.id);
  }
}

seed();
