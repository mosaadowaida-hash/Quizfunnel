import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qyyxijinqhhtdclyyfvr.supabase.co';
const supabaseAnonKey = 'sb_publishable_Xgo86uklEan6sbUZW2F4Rg_D-rTRzOY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
