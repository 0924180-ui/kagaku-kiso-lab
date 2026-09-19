// Supabase設定はsetup.htmlから入力できます。
// 入力内容はこの端末のブラウザ(localStorage)に保存されます。
(function(){
  try {
    const saved = JSON.parse(localStorage.getItem('kagaku_lab_supabase_config') || '{}');
    window.SUPABASE_URL = saved.url || '';
    window.SUPABASE_ANON_KEY = saved.anonKey || '';
  } catch(e) {
    window.SUPABASE_URL = '';
    window.SUPABASE_ANON_KEY = '';
  }
})();
