// ED-general-translation.js
// Pure translation engine – no auto‑init, just exports an API.
(function() {
	const STORAGE_KEY = 'dashboardLang';
	
	let uiText = null;
	let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
	
	function getNestedValue(obj, path) {
		return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
	}
	
	// Tiny helper – render HTML only when the string actually contains tags.
	// This keeps the plain-text path (textContent) for the vast majority of
	// strings, and switches to innerHTML only for strings that carry markup.
	const HTML_TAG_RE = /<[a-z][\s\S]*>/i;
	
	function setTranslatedContent(el, text) {
		if (HTML_TAG_RE.test(text)) {
			el.innerHTML = text;
			} else {
			el.textContent = text;
		}
	}
	
	function translatePage() {
		if (!uiText) return;
		const lang = currentLang;
		const langObj = uiText[lang] || uiText['en'];
		
		document.querySelectorAll('[data-i18n]').forEach(el => {
			const key  = el.getAttribute('data-i18n');
			const text = getNestedValue(langObj, key);
			if (text !== undefined) setTranslatedContent(el, text);
		});
		
		document.querySelectorAll('[data-i18n-title]').forEach(el => {
			const key  = el.getAttribute('data-i18n-title');
			const text = getNestedValue(langObj, key);
			if (text !== undefined) el.setAttribute('title', text);   // attributes stay plain
		});
		
		document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
			const key  = el.getAttribute('data-i18n-placeholder');
			const text = getNestedValue(langObj, key);
			if (text !== undefined) el.setAttribute('placeholder', text);
		});
		
		document.documentElement.lang = lang;
		document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
		
		const langSelect = document.getElementById('langSelect');
		if (langSelect && langSelect.value !== lang) langSelect.value = lang;
		
		document.dispatchEvent(new CustomEvent('translationsApplied', { detail: { lang } }));
	}
	
	function setLanguage(lang) {
		if (lang === currentLang) return;
		currentLang = lang;
		localStorage.setItem(STORAGE_KEY, lang);
		translatePage();
	}
	
	// Delegation – works even when header loads later
	document.addEventListener('change', function(e) {
		if (e.target && e.target.id === 'langSelect') {
			setLanguage(e.target.value);
		}
	});
	
	window.EDTranslation = {
		getText: function(key) {
			if (!uiText) return '';
			const langObj = uiText[currentLang] || uiText['en'];
			return getNestedValue(langObj, key) || '';
		},
		init: function(dict) {
			uiText = dict;
		},
		translatePage: translatePage,
		getCurrentLang: function() { return currentLang; }
	};
	
	// Global t() helper (used by PWA, etc.)
	window.t = window.EDTranslation.getText.bind(window.EDTranslation);
})();