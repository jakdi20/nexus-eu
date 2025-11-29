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

  // Same industry bonus - industry is now an array
  const industryMatch = profile1.industry?.some((ind: string) => 
    profile2.industry?.includes(ind)
  );
  if (industryMatch) {
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

  // Cooperation type compatibility - cooperation_type is an array
  const cooperationMatch = profile1.cooperation_type?.some((type: string) => 
    profile2.cooperation_type?.includes(type)
  );
  if (cooperationMatch) {
    score += 20;
    reasons.push('Kompatible Kooperationstypen');
  }

  // Offers/Looking_for matching (text fields, comma-separated)
  // Split by comma and trim whitespace
  const profile1Offers = profile1.offers ? profile1.offers.split(',').map((s: string) => s.trim().toLowerCase()) : [];
  const profile1LookingFor = profile1.looking_for ? profile1.looking_for.split(',').map((s: string) => s.trim().toLowerCase()) : [];
  const profile2Offers = profile2.offers ? profile2.offers.split(',').map((s: string) => s.trim().toLowerCase()) : [];
  const profile2LookingFor = profile2.looking_for ? profile2.looking_for.split(',').map((s: string) => s.trim().toLowerCase()) : [];

  // What profile1 offers matches what profile2 is looking for
  const offersLookingForMatch = profile1Offers.some((offer: string) => 
    profile2LookingFor.some((lookingFor: string) => 
      offer.includes(lookingFor) || lookingFor.includes(offer)
    )
  );
  if (offersLookingForMatch) {
    score += 25;
    reasons.push('Angebote passen zu Bedürfnissen');
  }

  // What profile1 is looking for matches what profile2 offers
  const lookingForOffersMatch = profile1LookingFor.some((lookingFor: string) => 
    profile2Offers.some((offer: string) => 
      lookingFor.includes(offer) || offer.includes(lookingFor)
    )
  );
  if (lookingForOffersMatch) {
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