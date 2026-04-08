let translations = {};
const supportedLangs = ['en', 'de', 'ru'];
let currentLang = 'en'; // default

const keyCache = new Map();

function getTranslation(key) {
    let parts = keyCache.get(key);
    if (!parts) {
        parts = key.split('.');
        keyCache.set(key, parts);
    }

    let result = translations;
    for (let i = 0, len = parts.length; i < len; i++) {
        if (!result) return null;
        result = result[parts[i]];
    }
    return result;
}

async function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });
    // also update title
    const titleElement = document.querySelector('title');
    const titleKey = titleElement ? titleElement.dataset.translateKey : null;
    if(titleKey) {
        const translation = getTranslation(titleKey);
        if(translation) {
            document.title = translation;
        }
    }
}

export async function setLanguage(lang, onLanguageChange) {
    if (!supportedLangs.includes(lang)) {
        lang = 'en';
    }
    currentLang = lang;
    localStorage.setItem('lang', lang);

    try {
        const response = await fetch(`locales/${lang}.json`);
        translations = await response.json();
        await applyTranslations();
        if (onLanguageChange) {
            onLanguageChange(translations);
        }
        return translations;
    } catch (error) {
        console.error(`Could not load language file: ${lang}.json`, error);
        return {};
    }
}

export function getInitialLang() {
    let lang = localStorage.getItem('lang');
    if (lang && supportedLangs.includes(lang)) {
        return lang;
    }
    lang = navigator.language.split('-')[0];
    if (supportedLangs.includes(lang)) {
        return lang;
    }
    return 'en';
}

export function getTranslations() {
    return translations;
}