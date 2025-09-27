let translations = {};
const supportedLangs = ['en', 'de', 'ru'];
let currentLang = 'en'; // default

async function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translation = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
        if (translation) {
            element.innerHTML = translation;
        }
    });
    // also update title
    const titleElement = document.querySelector('title');
    const titleKey = titleElement ? titleElement.dataset.translateKey : null;
    if(titleKey) {
        const translation = titleKey.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
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