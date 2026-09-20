/* ═══════════════════════════════════════════════════════
   lessons-core.js
   – Shared UI translations & merge
   – Keyword auto‑wrap (uses global `keywordMap`)
   – Print section selection modal
   ═══════════════════════════════════════════════════════ */

/* ─── 1. Shared (app‑wide) translations ─── */
const HGH_UI_TEXT_SHARED = {
  en: {
    appTitle: "History & Geography Hub",
    lessonPageTitle: "Lesson",
    exercisePageTitle: "Exercise",
    goToExercise: "Go to Exercise",
    goToLesson: "Go to Lesson",
    returnMain: "Return to Main",
    welcomeMessage: "Welcome to History & Geography Hub",
    onlineStatus: "Online",
    offlineStatus: "Offline",
    installBtn: "📲 Install App",
    themeToggleTitle: "Dark/Light Theme",
    offlineBanner: "You are offline. Some features may be unavailable.",
    updateNotification: "A new version is available.",
    updateReloadBtn: "Reload",
    enablePeriodicSyncBtn: "Enable Background Updates",
    disablePeriodicSyncBtn: "Disable Background Updates",
    enableNotificationsBtn: "Enable Notifications",
    footer: {
      version: "version '0.0.1'",
      confidentiality: "Confidentiality Politics",
      terms: "Terms of Use",
      contact: "Contact",
      developer: "developed by: Mejri Ziad.",
      hosted: "Hosted on Github and Netlify.",
      rateLabel: "Rate this app"
    },
    auth: {
      signIn: "Sign in",
      signUp: "Create account",
      signOut: "Sign out",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      cancel: "Cancel",
      continue: "Continue",
      switchToSignUp: "Create an account",
      switchToSignIn: "Already have an account? Sign in",
      forgotPassword: "Forgot password?",
      forgotPasswordSent: "Password reset email sent.",
      forgotPasswordError: "Failed to send reset email.",
      profile: {
        button: "Profile",
        buttonTitle: "View and edit your profile",
        title: "My Profile",
        loading: "Loading profile…",
        saveChanges: "Save Changes",
        completeTitle: "Complete your profile",
        usernamePlaceholder: "Username",
        avatarLabel: "Choose an avatar",
        uploadAvatar: "📷 Upload",
        removeAvatar: "✕ Remove",
        createAnimatedAvatar: "Create animated avatar",
        experimentalNote: "still experimental",
        professionLabel: "Profession",
        studentOption: "Student",
        teacherOption: "Teacher",
        otherOption: "Other",
        classLabel: "Class / Grade",
        birthdayLabel: "Birthday",
        languageLabel: "Preferred language",
        langEnglish: "English",
        langFrench: "Français",
        langArabic: "العربية",
        modeLabel: "Preferred mode",
        modeLight: "Light",
        modeDark: "Dark",
        howKnowLabel: "How did you get to know the site?",
        howFriend: "From a friend",
        howSocial: "Social media",
        howSearch: "Search engine",
        howOther: "Other",
        saveContinue: "Save & Continue",
        back: "Back",
        usernameRequired: "Please enter a username.",
        professionRequired: "Please select a profession.",
        grade7: "7th grade",
        grade8: "8th grade",
        grade9: "9th grade",
        grade10: "10th grade",
        grade11: "11th grade",
        grade12: "12th grade",
        saving: "Saving…",
        saveSuccess: "Profile saved successfully!",
        loadError: "Failed to load profile.",
        imageTooLarge: "Image must be smaller than 5 MB.",
        imageProcessError: "Failed to process image. Please try a different one.",
        saveError: "Failed to save profile."
      }
    },
    programs: { history: "History", geography: "Geography", modules: "modules", lessons: "lessons" }
  },
  fr: {
    appTitle: "Hub d'Histoire et Géographie",
    lessonPageTitle: "Leçon",
    exercisePageTitle: "Exercice",
    goToExercise: "Aller à l'exercice",
    goToLesson: "Aller à la leçon",
    returnMain: "Retour à l'accueil",
    welcomeMessage: "Bienvenue sur History & Geography Hub",
    onlineStatus: "En ligne",
    offlineStatus: "Hors ligne",
    installBtn: "📲 Installer l'application",
    themeToggleTitle: "Thème Sombre/Clair",
    offlineBanner: "Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.",
    updateNotification: "Une nouvelle version est disponible.",
    updateReloadBtn: "Recharger",
    enablePeriodicSyncBtn: "Activer les mises à jour en arrière-plan",
    disablePeriodicSyncBtn: "Désactiver les mises à jour en arrière-plan",
    enableNotificationsBtn: "Activer les notifications",
    footer: {
      version: "version '0.0.1'",
      confidentiality: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
      contact: "Contact",
      developer: "développé par : Mejri Ziad.",
      hosted: "Hébergé sur Github et Netlify.",
      rateLabel: "Noter cette application"
    },
    auth: {
      signIn: "Se connecter",
      signUp: "Créer un compte",
      signOut: "Se déconnecter",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Mot de passe",
      cancel: "Annuler",
      continue: "Continuer",
      switchToSignUp: "Créer un compte",
      switchToSignIn: "Vous avez déjà un compte ? Connectez-vous",
      forgotPassword: "Mot de passe oublié ?",
      forgotPasswordSent: "Email de réinitialisation envoyé.",
      forgotPasswordError: "Échec de l'envoi de l'email de réinitialisation.",
      profile: {
        button: "Profil",
        buttonTitle: "Voir et modifier votre profil",
        title: "Mon Profil",
        loading: "Chargement du profil…",
        saveChanges: "Enregistrer les modifications",
        completeTitle: "Complétez votre profil",
        usernamePlaceholder: "Nom d'utilisateur",
        avatarLabel: "Choisissez un avatar",
        uploadAvatar: "📷 Télécharger",
        removeAvatar: "✕ Supprimer",
        createAnimatedAvatar: "Créer un avatar animé",
        experimentalNote: "encore expérimental",
        professionLabel: "Profession",
        studentOption: "Élève",
        teacherOption: "Enseignant",
        otherOption: "Autre",
        classLabel: "Classe / Niveau",
        birthdayLabel: "Date de naissance",
        languageLabel: "Langue préférée",
        modeLabel: "Mode préféré",
        lightOption: "Clair",
        darkOption: "Sombre",
        howKnowLabel: "Comment avez-vous connu le site ?",
        howFriend: "Par un ami",
        howSocial: "Réseaux sociaux",
        howSearch: "Moteur de recherche",
        howOther: "Autre",
        saveContinue: "Enregistrer et continuer",
        back: "Retour",
        usernameRequired: "Veuillez entrer un nom d'utilisateur.",
        professionRequired: "Veuillez sélectionner une profession.",
        grade7: "5ème",
        grade8: "4ème",
        grade9: "3ème",
        grade10: "Seconde",
        grade11: "Première",
        grade12: "Terminale",
        saving: "Enregistrement…",
        saveSuccess: "Profil enregistré avec succès !",
        loadError: "Échec du chargement du profil.",
        imageTooLarge: "L'image doit faire moins de 5 Mo.",
        imageProcessError: "Échec du traitement de l'image. Veuillez en essayer une autre.",
        saveError: "Échec de l'enregistrement du profil."
      }
    },
    programs: { history: "Histoire", geography: "Géographie", modules: "modules", lessons: "leçons" }
  },
  ar: {
    appTitle: "مركز التاريخ والجغرافيا",
    lessonPageTitle: "درس",
    exercisePageTitle: "تمرين",
    goToExercise: "الذهاب إلى التمرين",
    goToLesson: "الذهاب إلى الدرس",
    returnMain: "العودة إلى الرئيسية",
    welcomeMessage: "مرحبًا بك في مركز التاريخ والجغرافيا",
    onlineStatus: "متصل",
    offlineStatus: "غير متصل",
    installBtn: "📲 تثبيت التطبيق",
    themeToggleTitle: "المظهر الداكن/الفاتح",
    offlineBanner: "أنت غير متصل. قد لا تتوفر بعض الميزات.",
    updateNotification: "نسخة جديدة متاحة.",
    updateReloadBtn: "إعادة التحميل",
    enablePeriodicSyncBtn: "تفعيل التحديثات في الخلفية",
    disablePeriodicSyncBtn: "تعطيل التحديثات في الخلفية",
    enableNotificationsBtn: "تفعيل الإشعارات",
    footer: {
      version: "الإصدار '0.0.1'",
      confidentiality: "سياسة الخصوصية",
      terms: "شروط الاستخدام",
      contact: "اتصل بنا",
      developer: "طور بواسطة: ماجري زياد.",
      hosted: "مستضاف على Github و Netlify.",
      rateLabel: "قيّم هذا التطبيق"
    },
    auth: {
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      signOut: "تسجيل الخروج",
      emailPlaceholder: "البريد الإلكتروني",
      passwordPlaceholder: "كلمة المرور",
      cancel: "إلغاء",
      continue: "متابعة",
      switchToSignUp: "إنشاء حساب",
      switchToSignIn: "هل لديك حساب بالفعل؟ تسجيل الدخول",
      forgotPassword: "نسيت كلمة المرور؟",
      forgotPasswordSent: "تم إرسال بريد إعادة تعيين كلمة المرور.",
      forgotPasswordError: "فشل إرسال بريد إعادة التعيين.",
      profile: {
        button: "الملف الشخصي",
        buttonTitle: "عرض وتعديل ملفك الشخصي",
        title: "ملفي الشخصي",
        loading: "جارٍ تحميل الملف الشخصي…",
        saveChanges: "حفظ التغييرات",
        completeTitle: "أكمل ملفك الشخصي",
        usernamePlaceholder: "اسم المستخدم",
        avatarLabel: "اختر صورة رمزية",
        uploadAvatar: "📷 رفع",
        removeAvatar: "✕ إزالة",
        createAnimatedAvatar: "إنشاء صورة رمزية متحركة",
        experimentalNote: "لا يزال تجريبيًا",
        professionLabel: "المهنة",
        studentOption: "طالب",
        teacherOption: "معلم",
        otherOption: "أخرى",
        classLabel: "الصف / المستوى",
        birthdayLabel: "تاريخ الميلاد",
        languageLabel: "اللغة المفضلة",
        modeLabel: "الوضع المفضل",
        lightOption: "فاتح",
        darkOption: "داكن",
        howKnowLabel: "كيف تعرفت على الموقع؟",
        howFriend: "من صديق",
        howSocial: "وسائل التواصل الاجتماعي",
        howSearch: "محرك بحث",
        howOther: "أخرى",
        saveContinue: "حفظ ومتابعة",
        back: "رجوع",
        usernameRequired: "يرجى إدخال اسم مستخدم.",
        professionRequired: "يرجى اختيار مهنة.",
        grade7: "الصف السابع",
        grade8: "الصف الثامن",
        grade9: "الصف التاسع",
        grade10: "الصف العاشر",
        grade11: "الصف الحادي عشر",
        grade12: "الصف الثاني عشر",
        saving: "جارٍ الحفظ…",
        saveSuccess: "تم حفظ الملف الشخصي بنجاح!",
        loadError: "فشل تحميل الملف الشخصي.",
        imageTooLarge: "يجب أن يكون حجم الصورة أقل من 5 ميغابايت.",
        imageProcessError: "فشلت معالجة الصورة. يرجى تجربة صورة أخرى.",
        saveError: "فشل حفظ الملف الشخصي."
      }
    },
    programs: { history: "تاريخ", geography: "جغرافيا", modules: "وحدات", lessons: "دروس" }
  }
};

/* ─── 2. Merge shared and lesson‑specific strings ─── */
// HGH_UI_TEXT_LESSON is defined globally in the HTML before this script loads
window.HGH_UI_TEXT = {
  en: Object.assign({}, HGH_UI_TEXT_SHARED.en, HGH_UI_TEXT_LESSON.en),
  fr: Object.assign({}, HGH_UI_TEXT_SHARED.fr, HGH_UI_TEXT_LESSON.fr),
  ar: Object.assign({}, HGH_UI_TEXT_SHARED.ar, HGH_UI_TEXT_LESSON.ar)
};

/* ─── 3. Auto‑wrap keywords (uses global `keywordMap` from HTML) ─── */
(function() {
  function getCurrentLanguage() {
    if (window.currentLang) return window.currentLang;
    const htmlLang = document.documentElement.lang || 'en';
    return htmlLang.substring(0, 2);
  }

  function wrapKeywords(rootElement) {
    const lang = getCurrentLanguage();
    const list = keywordMap[lang] || keywordMap.en;
    if (!list) return;

    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
  if (
    node.parentElement &&
    node.parentElement.closest(
      '.definition-category, strong, .key-location, .key-person, .key-organization, .key-treaty, .key-event, .key-other, .key-year, script, style'
    )
  ) {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_ACCEPT;
}
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      let html = node.textContent;
      let changed = false;
      for (const kw of list) {
        const escapedText = kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(${escapedText})(?![\\p{L}\\p{M}\\p{N}])`, 'gu');
        if (regex.test(html)) {
          const i18nAttr = kw.i18n ? ` data-i18n="${kw.i18n}"` : '';
          html = html.replace(regex, `<strong class="${kw.class}"${i18nAttr}>$1</strong>`);
          changed = true;
        }
      }
      if (changed) {
        const span = document.createElement('span');
        span.innerHTML = html;
        node.replaceWith(span);
      }
    }
  }

  function initKeywordWrapping() {
    const container = document.querySelector('.lesson-container');
    if (!container) return;

    const checkInterval = setInterval(() => {
      if (window.t && typeof window.t === 'function') {
        clearInterval(checkInterval);
        setTimeout(() => wrapKeywords(container), 150);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      wrapKeywords(container);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeywordWrapping);
  } else {
    initKeywordWrapping();
  }

  window.addEventListener('languageChanged', () => {
    const container = document.querySelector('.lesson-container');
    if (container) wrapKeywords(container);
  });
})();

/* ─── 4. Print section selection modal ─── */
(function() {
  const modal = document.getElementById('print-modal');
  const cancelBtn = document.getElementById('print-modal-cancel');
  const confirmBtn = document.getElementById('print-modal-confirm');
  const lessonCheckbox = document.getElementById('print-lesson');
  const definitionsCheckbox = document.getElementById('print-definitions');
  const galleryCheckbox = document.getElementById('print-gallery');

  window.openPrintModal = function() {
    if (!modal) return;
    if (lessonCheckbox) lessonCheckbox.checked = true;
    if (definitionsCheckbox) definitionsCheckbox.checked = true;
    if (galleryCheckbox) galleryCheckbox.checked = true;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { if (confirmBtn) confirmBtn.focus(); }, 100);
  };

  function closePrintModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  window.closePrintModal = closePrintModal;

  function handlePrintWithSections() {
    const printLesson = lessonCheckbox ? lessonCheckbox.checked : true;
    const printDefinitions = definitionsCheckbox ? definitionsCheckbox.checked : true;
    const printGallery = galleryCheckbox ? galleryCheckbox.checked : true;

    if (!printLesson && !printDefinitions && !printGallery) {
      alert('Please select at least one section to print.');
      return;
    }

    const allSections = document.querySelectorAll('[data-print-section]');
    allSections.forEach(el => {
      const section = el.getAttribute('data-print-section');
      if (section === 'lesson' && !printLesson) el.classList.add('no-print-section');
      if (section === 'definitions' && !printDefinitions) el.classList.add('no-print-section');
      if (section === 'gallery' && !printGallery) el.classList.add('no-print-section');
    });

    closePrintModal();

    setTimeout(() => {
      window.print();
      function cleanup() {
        allSections.forEach(el => el.classList.remove('no-print-section'));
        window.removeEventListener('afterprint', cleanup);
      }
      window.addEventListener('afterprint', cleanup);
      setTimeout(() => {
        allSections.forEach(el => el.classList.remove('no-print-section'));
      }, 2000);
    }, 200);
  }

  if (confirmBtn) confirmBtn.addEventListener('click', handlePrintWithSections);
  if (cancelBtn) cancelBtn.addEventListener('click', closePrintModal);

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closePrintModal();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closePrintModal();
    }
  });

  const allCheckboxes = [lessonCheckbox, definitionsCheckbox, galleryCheckbox];
  allCheckboxes.forEach(cb => {
    if (cb) {
      cb.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          cb.checked = !cb.checked;
        }
      });
    }
  });
})();