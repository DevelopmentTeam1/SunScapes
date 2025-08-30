let translations = {};
let currentLanguage = 'en';
const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh'];
const languageNames = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文'
};

export function t(key, replacements = {}) {
    let translation = translations[key] || key;
    for (const placeholder in replacements) {
        translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
    }
    return translation;
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        if (element.hasAttribute('data-i18n-placeholder')) {
             element.placeholder = t(key);
        } else if (element.hasAttribute('data-i18n-title')) {
            element.title = t(key);
        } else {
            element.innerHTML = t(key);
        }
    });
}

function getLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    if (supportedLanguages.includes(langFromUrl)) {
        localStorage.setItem('language', langFromUrl);
        return langFromUrl;
    }

    const langFromStorage = localStorage.getItem('language');
    if (supportedLanguages.includes(langFromStorage)) {
        return langFromStorage;
    }

    const browserLang = navigator.language.split('-')[0];
    if (supportedLanguages.includes(browserLang)) {
        return browserLang;
    }

    return 'en';
}

function setLanguage(lang) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('lang', lang);
    window.location.search = urlParams.toString();
}

function createLanguageSwitcher() {
    const switcherContainer = document.getElementById('language-switcher-container');
    if (!switcherContainer) return;

    let dropdownHTML = `
        <div class="relative" id="lang-dropdown-container">
            <button id="lang-dropdown-button" class="flex items-center font-semibold hover:text-sunshine-orange dark:hover:text-sunshine-orange transition-colors p-2 rounded-full hover:bg-sand-beige/50 dark:hover:bg-charcoal/50">
                <i data-lucide="globe" class="w-5 h-5"></i>
                <span class="hidden lg:block ml-2">${languageNames[currentLanguage]}</span>
            </button>
            <div id="lang-dropdown-menu" class="hidden absolute top-full right-0 mt-2 w-36 bg-white dark:bg-charcoal rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
    `;

    for (const lang of supportedLanguages) {
        dropdownHTML += `<a href="#" data-lang="${lang}" class="block px-4 py-2 text-sm text-charcoal dark:text-sand-beige hover:bg-sand-beige/50 dark:hover:bg-charcoal/50 ${lang === currentLanguage ? 'font-bold text-ocean-blue dark:text-sunshine-orange' : ''}">${languageNames[lang]}</a>`;
    }

    dropdownHTML += `</div></div>`;
    switcherContainer.innerHTML = dropdownHTML;

    const button = document.getElementById('lang-dropdown-button');
    const menu = document.getElementById('lang-dropdown-menu');
    
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('hidden') && !button.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = a.dataset.lang;
            if (lang !== currentLanguage) {
                setLanguage(lang);
            }
        });
    });
}

function updateHreflangTags() {
    const hreflangContainer = document.getElementById('hreflang-container');
    if (!hreflangContainer) return;
    
    let tagsHTML = '';
    const pageUrl = new URL(window.location.href);

    supportedLanguages.forEach(lang => {
        pageUrl.searchParams.set('lang', lang);
        tagsHTML += `<link rel="alternate" hreflang="${lang}" href="${pageUrl.href}" />\n`;
    });
    
    pageUrl.searchParams.set('lang', 'en');
    tagsHTML += `<link rel="alternate" hreflang="x-default" href="${pageUrl.href}" />\n`;

    hreflangContainer.innerHTML = tagsHTML;
}

export async function initI18n() {
    currentLanguage = getLanguage();
    document.documentElement.lang = currentLanguage;

    try {
        const response = await fetch(`translations/${currentLanguage}.json`);
        if (!response.ok) throw new Error(`Translation file for ${currentLanguage} not found`);
        translations = await response.json();
    } catch (error) {
        console.error('I18n Error:', error);
        if (currentLanguage !== 'en') {
            try {
                const response = await fetch(`translations/en.json`);
                translations = await response.json();
            } catch (fallbackError) {
                 console.error('I18n Error: Could not load fallback English translations.', fallbackError);
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        translatePage();
        createLanguageSwitcher();
        updateHreflangTags();
        lucide.createIcons();
        document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { t, lang: currentLanguage } }));
    });
}

initI18n();
