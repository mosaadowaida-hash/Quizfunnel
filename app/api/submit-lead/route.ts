import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, topCategories, categoryScores, recommendedVitamins } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    // Supabase Insertion
    const { error } = await supabase.from('leads').insert([
      {
        full_name: name,
        email: email || null,
        whatsapp: phone,
        top_categories: topCategories,
        recommended_vitamins: recommendedVitamins,
      },
    ]);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: `Failed to save to database: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting lead:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message || error}` }, { status: 500 });
  }
}
