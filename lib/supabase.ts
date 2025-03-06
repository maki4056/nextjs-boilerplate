import { createClient } from '@supabase/supabase-js'

export type Database = {
    id: string;
    created_at: string;
    message: string;
    name: string;
    url: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string 

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
