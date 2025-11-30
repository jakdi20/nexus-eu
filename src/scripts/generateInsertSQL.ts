import companiesData from '../../public/companies_100.json';

// Map company_size to database enum values
function mapCompanySize(size: string): string {
  if (size === '1-10') return '1';
  if (size === '501+') return '250+';
  return size;
}

// Escape single quotes in SQL strings
function escapeSql(str: string | null): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Generate SQL INSERT statements
function generateInsertSQL() {
  const values = companiesData.map((item: any) => {
    const c = item.company;
    const companySize = mapCompanySize(c.profile.company_size);
    
    return `(
  '${c.id}',
  NULL,
  '${escapeSql(c.company_name)}',
  '${escapeSql(c.legal_form)}',
  '${escapeSql(c.location.country)}',
  '${escapeSql(c.location.firmensitz)}',
  '${escapeSql(c.location.address)}',
  '${escapeSql(c.profile.industry)}',
  '${companySize}',
  ${c.profile.founded_year},
  '${escapeSql(c.profile.description)}',
  '${escapeSql(c.contact.website)}',
  '${escapeSql(c.contact.contact_email)}',
  '${escapeSql(c.contact.contact_phone)}',
  '${escapeSql(c.matching.offers)}',
  '${escapeSql(c.matching.seeks)}',
  '${escapeSql(c.branding.logo_url)}',
  ${c.verification.verified},
  '${c.verification.verification_status}',
  ${c.verification.verification_badge_url ? `'${escapeSql(c.verification.verification_badge_url)}'` : 'NULL'},
  ${c.monetization.is_premium},
  ${c.monetization.is_sponsored},
  ${c.monetization.sponsored_until ? `'${c.monetization.sponsored_until}'` : 'NULL'},
  '${c.system.created_at}',
  '${c.system.updated_at}'
)`;
  }).join(',\n');

  const sql = `INSERT INTO company_profiles (
  id, user_id, company_name, legal_form, country, firmensitz, address,
  industry, company_size, founded_year, description,
  website, contact_email, contact_phone,
  offers, seeks, logo_url,
  verified, verification_status, verification_badge_url,
  is_premium, is_sponsored, sponsored_until,
  created_at, updated_at
) VALUES\n${values};`;

  return sql;
}

// Split into batches of 20 companies
export function generateBatchedInserts() {
  const batchSize = 20;
  const batches: string[] = [];
  
  for (let i = 0; i < companiesData.length; i += batchSize) {
    const batch = companiesData.slice(i, i + batchSize);
    const batchData = batch.map((item: any) => {
      const c = item.company;
      const companySize = mapCompanySize(c.profile.company_size);
      
      return `(
  '${c.id}',
  NULL,
  '${escapeSql(c.company_name)}',
  '${escapeSql(c.legal_form)}',
  '${escapeSql(c.location.country)}',
  '${escapeSql(c.location.firmensitz)}',
  '${escapeSql(c.location.address)}',
  '${escapeSql(c.profile.industry)}',
  '${companySize}',
  ${c.profile.founded_year},
  '${escapeSql(c.profile.description)}',
  '${escapeSql(c.contact.website)}',
  '${escapeSql(c.contact.contact_email)}',
  '${escapeSql(c.contact.contact_phone)}',
  '${escapeSql(c.matching.offers)}',
  '${escapeSql(c.matching.seeks)}',
  '${escapeSql(c.branding.logo_url)}',
  ${c.verification.verified},
  '${c.verification.verification_status}',
  ${c.verification.verification_badge_url ? `'${escapeSql(c.verification.verification_badge_url)}'` : 'NULL'},
  ${c.monetization.is_premium},
  ${c.monetization.is_sponsored},
  ${c.monetization.sponsored_until ? `'${c.monetization.sponsored_until}'` : 'NULL'},
  '${c.system.created_at}',
  '${c.system.updated_at}'
)`;
    }).join(',\n');

    const sql = `-- Batch ${Math.floor(i / batchSize) + 1} (Companies ${i + 1}-${Math.min(i + batchSize, companiesData.length)})
INSERT INTO company_profiles (
  id, user_id, company_name, legal_form, country, firmensitz, address,
  industry, company_size, founded_year, description,
  website, contact_email, contact_phone,
  offers, seeks, logo_url,
  verified, verification_status, verification_badge_url,
  is_premium, is_sponsored, sponsored_until,
  created_at, updated_at
) VALUES
${batchData};
`;
    
    batches.push(sql);
  }
  
  return batches;
}

console.log(generateInsertSQL());
