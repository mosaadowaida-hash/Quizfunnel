import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import surveyData from '@/data/Survey-Questions.json';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, topCategories, categoryScores } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    // Determine recommended vitamins based on top categories
    const recommendedVitamins = topCategories.flatMap((cat: string) => {
      const key = `${cat}_high` as keyof typeof surveyData.scoring_rules.recommendation_mapping;
      return surveyData.scoring_rules.recommendation_mapping[key] || [];
    });
    const uniqueRecommendedVitamins = Array.from(new Set(recommendedVitamins));

    // Supabase Insertion
    const { error } = await supabase.from('leads').insert([
      {
        full_name: name,
        email: email || null,
        whatsapp: phone,
        top_categories: topCategories,
        recommended_vitamins: uniqueRecommendedVitamins,
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
