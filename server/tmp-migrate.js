import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service key to bypass RLS for DDL

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
    const sql = `
    CREATE TABLE IF NOT EXISTS public.consumption_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT,
        quantity NUMERIC DEFAULT 1,
        unit TEXT,
        price NUMERIC,
        consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their own or household consumption logs" ON public.consumption_logs;
    CREATE POLICY "Users can view their own or household consumption logs"
        ON public.consumption_logs FOR SELECT
        USING (
            auth.uid() = user_id 
            OR 
            household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
        );

    DROP POLICY IF EXISTS "Users can insert personal or household consumption logs" ON public.consumption_logs;
    CREATE POLICY "Users can insert personal or household consumption logs"
        ON public.consumption_logs FOR INSERT
        WITH CHECK (
            auth.uid() = user_id 
            OR 
            (household_id IS NOT NULL AND household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid()))
        );
        
    DROP POLICY IF EXISTS "Users can delete personal or household consumption logs" ON public.consumption_logs;
    CREATE POLICY "Users can delete personal or household consumption logs"
        ON public.consumption_logs FOR DELETE
        USING (
            auth.uid() = user_id 
            OR 
            (household_id IS NOT NULL AND household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND role = 'admin'))
        );
  `

    // Try using remote RPC execution if postgres extension is installed, or REST API.
    // Wait, Supabase JS client doesn't support raw SQL execution over REST unless using an RPC.
    // Let me just write it as a .sql file and ask the user to run it via the dashboard.
    console.log("Supabase JS doesn't support raw DDL over REST. Please run the SQL manually.");
}

migrate()
