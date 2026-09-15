const SUPABASE_URL = "https://xvbryihihhzehebchuqc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_J9mO9NOyEva7VwReeRr-_A_CiUmaCdO";

const stockzapSupabase = window.supabase.createClient(
	SUPABASE_URL,
	SUPABASE_PUBLISHABLE_KEY
);