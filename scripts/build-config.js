const fs = require('fs');
const path = require('path');

const url = (process.env.SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '');

const key = (
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  throw new Error('SUPABASE_URL is missing or invalid.');
}

if (!key) {
  throw new Error('SUPABASE_PUBLISHABLE_KEY is missing.');
}

const output = `// Generated at Vercel build time.
(function(){
  const buildConfig = ${JSON.stringify({ url, key })};
  window.SUPABASE_URL = buildConfig.url;
  window.SUPABASE_ANON_KEY = buildConfig.key;

  try {
    const saved = JSON.parse(
      localStorage.getItem('kagaku_lab_supabase_config') || '{}'
    );

    if (saved.url && saved.anonKey) {
      window.SUPABASE_URL = saved.url;
      window.SUPABASE_ANON_KEY = saved.anonKey;
    }
  } catch(e) {}
})();
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'js', 'supabase-config.js'),
  output,
  'utf8'
);

console.log('Supabase browser config generated successfully.');
