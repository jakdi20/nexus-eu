import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get the user's company profile
    const { data: myProfile, error: profileError } = await supabaseClient
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !myProfile) {
      throw new Error('Profile not found');
    }

    // Get all other company profiles
    const { data: otherProfiles, error: otherProfilesError } = await supabaseClient
      .from('company_profiles')
      .select('*')
      .neq('id', myProfile.id);

    if (otherProfilesError) {
      throw otherProfilesError;
    }

    console.log(`Calculating matches for ${myProfile.company_name} against ${otherProfiles?.length || 0} companies`);

    // Calculate match scores
    const matches = [];
    for (const profile of otherProfiles || []) {
      const { score, reasons } = calculateMatchScore(myProfile, profile);
      
      if (score > 30) { // Only create matches with score > 30
        matches.push({
          company_id_1: myProfile.id,
          company_id_2: profile.id,
          match_score: score,
          match_reasons: reasons,
        });
      }
    }

    console.log(`Found ${matches.length} potential matches`);

    // Delete existing matches for this company
    await supabaseClient
      .from('matches')
      .delete()
      .or(`company_id_1.eq.${myProfile.id},company_id_2.eq.${myProfile.id}`);

    // Insert new matches
    if (matches.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('matches')
        .insert(matches);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
        throw insertError;
      }

      // Create notification for new matches
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'match',
          title: 'Neue Matches gefunden!',
          content: `Wir haben ${matches.length} neue potenzielle Partner für Sie gefunden.`,
          read: false,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchCount: matches.length,
        message: `${matches.length} Matches erfolgreich berechnet` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in calculate-matches:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateMatchScore(profile1: any, profile2: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Same industry bonus
  if (profile1.industry === profile2.industry) {
    score += 20;
    reasons.push('Gleiche Branche');
  }

  // Location proximity (same country)
  if (profile1.country === profile2.country) {
    score += 15;
    reasons.push('Gleicher Standort');
    
    // Same city bonus
    if (profile1.city === profile2.city) {
      score += 10;
      reasons.push('Gleiche Stadt');
    }
  }

  // Partnership type compatibility
  const partnershipMatch = profile1.partnership_types?.some((type: string) => 
    profile2.partnership_types?.includes(type)
  );
  if (partnershipMatch) {
    score += 20;
    reasons.push('Kompatible Partnerschaftstypen');
  }

  // Offers/Seeks matching (what one offers, the other seeks)
  const offersSeeksMatch = profile1.offers?.some((offer: string) => 
    profile2.seeks?.some((seek: string) => 
      offer.toLowerCase().includes(seek.toLowerCase()) || 
      seek.toLowerCase().includes(offer.toLowerCase())
    )
  );
  if (offersSeeksMatch) {
    score += 25;
    reasons.push('Angebote passen zu Bedürfnissen');
  }

  // Reverse: what profile2 offers, profile1 seeks
  const seeksOffersMatch = profile1.seeks?.some((seek: string) => 
    profile2.offers?.some((offer: string) => 
      seek.toLowerCase().includes(offer.toLowerCase()) || 
      offer.toLowerCase().includes(seek.toLowerCase())
    )
  );
  if (seeksOffersMatch) {
    score += 25;
    reasons.push('Bedürfnisse passen zu Angeboten');
  }

  // Company size compatibility
  if (profile1.company_size === profile2.company_size) {
    score += 10;
    reasons.push('Ähnliche Unternehmensgröße');
  }

  // Verified bonus
  if (profile2.verification_status === 'verified') {
    score += 5;
    reasons.push('Verifiziertes Unternehmen');
  }

  return { score: Math.min(100, score), reasons };
}