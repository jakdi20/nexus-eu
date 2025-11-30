import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyData {
  company: {
    id: string;
    user_id: string;
    company_name: string;
    legal_form: string;
    location: {
      country: string;
      firmensitz: string;
      address: string;
    };
    profile: {
      industry: string;
      company_size: string;
      founded_year: number;
      description: string;
    };
    contact: {
      website: string;
      contact_email: string;
      contact_phone: string;
    };
    matching: {
      offers: string;
      seeks: string;
    };
    branding: {
      logo_url: string;
    };
    verification: {
      verified: boolean;
      verification_status: string;
      verification_badge_url: string;
    };
    monetization: {
      is_premium: boolean;
      is_sponsored: boolean;
      sponsored_until: string | null;
    };
    system: {
      created_at: string;
      updated_at: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companies } = await req.json() as { companies: CompanyData[] };

    console.log(`Processing ${companies.length} companies...`);

    const insertData = companies.map((item) => {
      const c = item.company;
      
      // Map company_size to match enum values
      let companySize = c.profile.company_size;
      if (companySize === '1-10') companySize = '1';
      else if (companySize === '51-200') companySize = '51-250';
      else if (companySize === '201-500') companySize = '250+';
      else if (companySize === '501+') companySize = '250+';
      
      return {
        id: c.id,
        user_id: null, // Mock companies have no user association
        company_name: c.company_name,
        legal_form: c.legal_form,
        country: c.location.country,
        firmensitz: c.location.firmensitz,
        address: c.location.address,
        industry: c.profile.industry,
        company_size: companySize,
        founded_year: c.profile.founded_year,
        description: c.profile.description,
        website: c.contact.website,
        contact_email: c.contact.contact_email,
        contact_phone: c.contact.contact_phone,
        offers: c.matching.offers,
        seeks: c.matching.seeks,
        logo_url: c.branding.logo_url,
        verified: c.verification.verified,
        verification_status: c.verification.verification_status,
        verification_badge_url: c.verification.verification_badge_url || null,
        is_premium: c.monetization.is_premium,
        is_sponsored: c.monetization.is_sponsored,
        sponsored_until: c.monetization.sponsored_until,
        created_at: c.system.created_at,
        updated_at: c.system.updated_at,
      };
    });

    // Insert in batches of 50 to avoid timeout
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`);
      
      const { data, error } = await supabaseClient
        .from('company_profiles')
        .insert(batch);

      if (error) {
        console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
      
      results.push({ batch: Math.floor(i / batchSize) + 1, count: batch.length });
    }

    console.log(`Successfully imported ${companies.length} companies`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: companies.length,
        batches: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error importing companies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
