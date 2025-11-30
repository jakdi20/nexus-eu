import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get user's company profile
    const { data: myProfile, error: profileError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !myProfile) {
      console.error('Profile error:', profileError);
      throw new Error('User profile not found');
    }

    // Get all other company profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('company_profiles')
      .select('*')
      .neq('user_id', user.id)
      .limit(50);

    if (allProfilesError) {
      console.error('All profiles error:', allProfilesError);
      throw new Error('Failed to fetch profiles');
    }

    // Build AI prompt
    const systemPrompt = `Du bist ein intelligenter Business-Matching-Assistent. 
Analysiere das Unternehmensprofil und identifiziere die 5 besten Partner basierend auf:
- Komplementären Angeboten und Bedürfnissen
- Branchensynergien
- Geografischer Nähe oder Expansionsmöglichkeiten
- Unternehmensgröße und Partnerschaftstypen

Antworte NUR mit einem JSON-Array mit genau diesem Format:
[
  {
    "company_id": "uuid",
    "company_name": "Name",
    "reason": "Kurze prägnante Begründung in 1-2 Sätzen",
    "match_score": 85
  }
]`;

    const userPrompt = `Mein Unternehmensprofil:
Name: ${myProfile.company_name}
Branche: ${myProfile.industry || 'Keine'}
Standort: ${myProfile.firmensitz}, ${myProfile.country}
Größe: ${myProfile.company_size}
Beschreibung: ${myProfile.description || 'Keine'}
Angebote: ${myProfile.offers || 'Keine'}
Sucht: ${myProfile.seeks || 'Nichts'}

Verfügbare Partner:
${allProfiles.map(p => `
ID: ${p.id}
Name: ${p.company_name}
Branche: ${p.industry || 'Keine'}
Standort: ${p.firmensitz}, ${p.country}
Größe: ${p.company_size}
Beschreibung: ${p.description || 'Keine'}
Angebote: ${p.offers || 'Keine'}
Sucht: ${p.seeks || 'Nichts'}
`).join('\n---\n')}

Finde die 5 besten Matches.`;

    console.log('Sending request to Lovable AI...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response (handle markdown code blocks)
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Validate and enrich recommendations
    const enrichedRecommendations = recommendations.slice(0, 5).map((rec: any) => {
      const profile = allProfiles.find(p => p.id === rec.company_id);
      if (!profile) return null;

      return {
        ...rec,
        industry: profile.industry,
        firmensitz: profile.firmensitz,
        country: profile.country,
        company_size: profile.company_size,
        verified: profile.verification_status === 'verified',
      };
    }).filter(Boolean);

    return new Response(
      JSON.stringify({ recommendations: enrichedRecommendations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-partner-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
