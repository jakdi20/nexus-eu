import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'de' } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profiles, error: profilesError } = await supabaseClient
      .from('company_profiles')
      .select('*');

    if (profilesError) {
      throw profilesError;
    }

    console.log(`AI Search: Processing query "${query}" for ${profiles?.length || 0} companies in ${language}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = language === 'en' 
      ? `You are an intelligent assistant helping companies find partners.
You will receive a search query and a list of company profiles.
Your task is to identify and rank the most suitable companies.

Rate each company on a scale of 0-100 based on:
- How well the industry matches the query
- How relevant the services/offerings are
- How well the location fits
- How well the desired partnerships match

Respond ONLY with a JSON array containing the top 10 companies with their IDs and scores.
Format: [{"id": "uuid", "score": 85, "reason": "Brief explanation"}]`
      : `Du bist ein intelligenter Assistent, der Unternehmen bei der Partnersuche hilft.
Du erhältst eine Suchanfrage und eine Liste von Unternehmensprofilen.
Deine Aufgabe ist es, die passendsten Unternehmen zu identifizieren und zu ranken.

Bewerte jedes Unternehmen auf einer Skala von 0-100 basierend auf:
- Wie gut passt die Branche zur Anfrage
- Wie relevant sind die Angebote/Dienstleistungen
- Wie gut passt der Standort
- Wie gut passen die gesuchten Partnerschaften

Antworte NUR mit einem JSON-Array mit den IDs der Top 10 Unternehmen und ihrer Scores.
Format: [{"id": "uuid", "score": 85, "reason": "Kurze Begründung"}]`;

    const userPrompt = language === 'en'
      ? `Search query: "${query}"

Available companies:
${profiles?.map((p, idx) => `
${idx + 1}. ID: ${p.id}
   Name: ${p.company_name}
   Industry: ${p.industry}
   Location: ${p.firmensitz}, ${p.country}
   Size: ${p.company_size}
   Description: ${p.description || 'No description'}
   Offers: ${p.offers || 'No information'}
   Looking for: ${p.seeks || 'No information'}
`).join('\n---\n')}

Find the top 10 most suitable companies for this query.`
      : `Suchanfrage: "${query}"

Verfügbare Unternehmen:
${profiles?.map((p, idx) => `
${idx + 1}. ID: ${p.id}
   Name: ${p.company_name}
   Branche: ${p.industry}
   Standort: ${p.firmensitz}, ${p.country}
   Größe: ${p.company_size}
   Beschreibung: ${p.description || 'Keine Beschreibung'}
   Bietet an: ${p.offers || 'Keine Angaben'}
   Sucht: ${p.seeks || 'Keine Angaben'}
`).join('\n---\n')}

Finde die Top 10 passendsten Unternehmen für diese Anfrage.`;

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
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'en' ? 'Rate limit exceeded. Please try again in a moment.' : 'Rate-Limit überschritten. Bitte versuchen Sie es in einem Moment erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'en' ? 'AI credits exhausted. Please contact support.' : 'AI-Credits aufgebraucht. Bitte kontaktieren Sie den Support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI API error');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    let rankedCompanies;
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rankedCompanies = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      rankedCompanies = profiles?.slice(0, 10).map((p) => ({
        id: p.id,
        score: 50,
        reason: language === 'en' ? 'General match' : 'Allgemeine Übereinstimmung'
      })) || [];
    }

    const results = rankedCompanies
      .map((ranked: { id: string; score: number; reason: string }) => {
        const company = profiles?.find((p) => p.id === ranked.id);
        if (company) {
          return {
            ...company,
            ai_score: ranked.score,
            ai_reason: ranked.reason,
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 10);

    return new Response(
      JSON.stringify({ 
        results,
        query,
        total_searched: profiles?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-partner-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
