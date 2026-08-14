// hgh-init.js – safe version
(function() {
  let currentTheme = localStorage.getItem('hghTheme') || 'light';
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('hghTheme', currentTheme);
  }
  function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
  }
  async function loadComponent(url, targetId) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}`);
    document.getElementById(targetId).innerHTML = await resp.text();
  }
  function updateConnectionStatus() {
    const dot = document.getElementById('status-dot');
    const label = document.getElementById('connection-status-label');
    const statusSpan = document.getElementById('connection-status');
    if (!dot || !statusSpan) return;
    const online = navigator.onLine;
    dot.className = 'status-dot' + (online ? '' : ' offline');
    const text = online ? (window.EDTranslation?.getText?.('onlineStatus') || 'Online') : (window.EDTranslation?.getText?.('offlineStatus') || 'Offline');
    if (label) label.textContent = text;
    statusSpan.title = text;
  }
  function setupRating() {
    const heartsContainer = document.getElementById('rateHearts');
    if (!heartsContainer) return;
    const hearts = heartsContainer.querySelectorAll('.heart');
    const STORAGE_KEY = 'hghAppRating';
    let currentRating = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    function updateHearts() {
      hearts.forEach(heart => {
        const rating = parseInt(heart.getAttribute('data-rating'), 10);
        heart.classList.toggle('active', rating <= currentRating);
      });
    }
    async function logRatingToSupabase(rating) {
      const FUNCTION_URL = 'https://hmjbzzuresgzwzefjpyt.supabase.co/functions/v1/log-hgh-interaction';
      try {
        await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity_type: 'app_rating', entity_id: String(rating) })
        });
      } catch (err) {
        console.warn('Could not send rating:', err);
      }
    }
    hearts.forEach(heart => {
      heart.addEventListener('click', () => {
        const rating = parseInt(heart.getAttribute('data-rating'), 10);
        currentRating = (currentRating === rating) ? 0 : rating;
        localStorage.setItem(STORAGE_KEY, currentRating);
        updateHearts();
        if (currentRating > 0) logRatingToSupabase(currentRating);
      });
    });
    updateHearts();
  }
  async function init() {
    applyTheme();
    await loadComponent('hgh-header.html', 'header-container');
    await loadComponent('hgh-footer.html', 'footer-container');
    // Safe translation init
    if (window.EDTranslation) {
      EDTranslation.init(window.HGH_UI_TEXT || {});
      EDTranslation.translatePage();
    }
    updateConnectionStatus();
    if (window.EDPWA) window.EDPWA.init();
    if (window.EDPWA && window.EDPWA.updateNotificationUI) window.EDPWA.updateNotificationUI();
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    document.addEventListener('translationsApplied', updateConnectionStatus);
    setupRating();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();