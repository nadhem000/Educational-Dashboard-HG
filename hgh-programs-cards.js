// hgh-programs-cards.js – Collapsible cards, default History tab, section selector, multi‑part lessons, and exercise links
(function () {
  'use strict';

  // Safe translation helper for static UI text
  function t(key, fallback) {
    if (window.EDTranslation && window.EDTranslation.getText) {
      return window.EDTranslation.getText(key) || fallback;
    }
    return fallback;
  }

  function getLangText(obj) {
    const lang = (window.EDTranslation && window.EDTranslation.getCurrentLang()) || 'en';
    if (!obj) return '';
    return obj[lang] || obj.en || obj.ar || '';
  }

  function el(tag, styles = {}, children = []) {
    const e = document.createElement(tag);
    Object.assign(e.style, styles);
    children.forEach(c => {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  }

  function programSummary(program) {
  let totalLessons = 0;
  (program.modules || []).forEach(m => {
    (m.lessons || []).forEach(l => {
      totalLessons++;
      if (l.parts) totalLessons += l.parts.length;
    });
  });
  const mods = (program.modules || []).length;
  const modText = t('programs.modules', 'modules');
  const lesText = t('programs.lessons', 'lessons');
  return `${mods} ${modText} · ${totalLessons} ${lesText}`;
}

  function generateUrls(yearKey, sectionKey, type, mIdx, lIdx, pIdx = null) {
    const mNum = mIdx + 1;
    const lNum = lIdx + 1;
    const pNum = pIdx !== null ? pIdx + 1 : null;
    const prefix = 'HGH_';
    const yearPart = yearKey;
    const sectionPart = sectionKey ? '_' + sectionKey : '';
    const typePart = '_' + type;
    const lessonBase = prefix + yearPart + sectionPart + typePart + '_lessons_mod' + mNum + '_lesson' + lNum;
    const exerciseBase = prefix + yearPart + sectionPart + typePart + '_exercisess_mod' + mNum + '_lesson' + lNum;
    if (pNum !== null) {
      return {
        lesson: lessonBase + '_part' + pNum + '.html',
        exercise: exerciseBase + '_part' + pNum + '.html'
      };
    } else {
      return {
        lesson: lessonBase + '.html',
        exercise: exerciseBase + '.html'
      };
    }
  }

  function buildSubjectDetailPanel(program, yearKey, sectionKey) {
    const type = program.type;
    const panel = el('div', { marginBottom: '1rem' });
    const header = el('div', {
      fontWeight: 'bold',
      fontSize: '1rem',
      marginBottom: '0.5rem',
      color: 'var(--ED-General-color-text-primary)',
      borderBottom: '1px solid var(--ED-General-color-border)',
      paddingBottom: '0.3rem'
    }, [getLangText(program.subject)]);
    panel.appendChild(header);

    (program.modules || []).forEach((mod, mIdx) => {
      const modDiv = el('div', { marginBottom: '0.5rem' });
      const modName = el('div', {
        fontWeight: '600',
        fontSize: '0.85rem',
        marginBottom: '0.2rem',
        color: 'var(--ED-General-color-text-secondary)'
      }, [getLangText(mod.name)]);
      modDiv.appendChild(modName);

      (mod.lessons || []).forEach((lesson, lIdx) => {
        const renderSingleItem = (titleObj, pIdx = null) => {
          const urls = generateUrls(yearKey, sectionKey, type, mIdx, lIdx, pIdx);
          const itemDiv = el('div', { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' });
          const lessonLink = document.createElement('a');
          lessonLink.href = urls.lesson;
          lessonLink.textContent = getLangText(titleObj);
          lessonLink.style.cssText = 'text-decoration:none; color:var(--ED-General-color-accent-default);';
          lessonLink.setAttribute('data-analytics-id', `lesson-${yearKey}-${sectionKey||''}-${mIdx}-${lIdx}` + (pIdx !== null ? `-${pIdx}` : ''));
          const exerciseLink = document.createElement('a');
          exerciseLink.href = urls.exercise;
          exerciseLink.textContent = '📝';
          exerciseLink.title = 'Exercise';
          exerciseLink.style.cssText = 'text-decoration:none; font-size:1rem;';
          exerciseLink.setAttribute('data-analytics-id', `exercise-${yearKey}-${sectionKey||''}-${mIdx}-${lIdx}` + (pIdx !== null ? `-${pIdx}` : ''));
          itemDiv.appendChild(lessonLink);
          itemDiv.appendChild(exerciseLink);
          return itemDiv;
        };

        if (lesson.parts && lesson.parts.length > 0) {
          const lessonTitle = el('div', {
            fontWeight: '500',
            fontSize: '0.85rem',
            marginTop: '0.3rem',
            color: 'var(--ED-General-color-text-primary)'
          }, [getLangText(lesson.title)]);
          modDiv.appendChild(lessonTitle);
          lesson.parts.forEach((part, pIdx) => {
            const row = renderSingleItem(part.title, pIdx);
            row.style.paddingLeft = '1.2rem';
            modDiv.appendChild(row);
          });
        } else {
          modDiv.appendChild(renderSingleItem(lesson.title));
        }
      });

      panel.appendChild(modDiv);
    });

    if (program.pedagogy && program.pedagogy.linkText && program.pedagogy.label) {
      const linkRow = el('div', { marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--ED-General-color-text-secondary)' });
      linkRow.innerHTML = getLangText(program.pedagogy.label) + ' <a href="#" style="color:var(--ED-General-color-accent-default);">' + getLangText(program.pedagogy.linkText) + '</a>';
      panel.appendChild(linkRow);
    }
    return panel;
  }

  // Build an expandable card for a single year (no sections)
  function buildYearCard(yearKey, yearData, programs) {
    const hisProg = programs.find(p => p.type === 'his');
    const geoProg = programs.find(p => p.type === 'geo');

    const card = el('div', {
      background: 'var(--ED-General-color-surface)',
      borderRadius: '16px',
      border: '1px solid var(--ED-General-color-border)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s'
    });

    const header = el('div', {
      padding: '1.25rem 1.5rem',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      userSelect: 'none',
      background: 'var(--ED-General-color-bg-secondary)'
    });
    const title = el('h2', { margin: '0', fontSize: '1.3rem', color: 'var(--ED-General-color-text-primary)' }, [getLangText(yearData.title)]);
    const summary = el('div', { fontSize: '0.8rem', color: 'var(--ED-General-color-text-secondary)', marginTop: '0.2rem' });
    if (hisProg) summary.appendChild(document.createTextNode('📜 ' + programSummary(hisProg) + '  '));
    if (geoProg) summary.appendChild(document.createTextNode('🌐 ' + programSummary(geoProg)));
    const arrow = el('span', { fontSize: '1.2rem', transition: 'transform 0.2s' }, ['▼']);
    const titleBlock = el('div', {});
    titleBlock.appendChild(title);
    titleBlock.appendChild(summary);
    header.appendChild(titleBlock);
    header.appendChild(arrow);
    card.appendChild(header);

    const detail = el('div', { display: 'none', padding: '0 1.5rem 1.5rem' });
    card.appendChild(detail);

    const tabs = el('div', { display: 'flex', gap: '0.5rem', marginBottom: '1rem', marginTop: '1rem' });
    const hisBtn = el('button', {
      padding: '0.4rem 0.8rem', border: 'none', borderRadius: '8px',
      background: 'var(--ED-General-color-accent-default)', color: '#fff', cursor: 'pointer',
      fontWeight: 'bold', fontSize: '0.9rem'
    }, ['📜 ' + t('programs.history', 'History')]);
    const geoBtn = el('button', {
      padding: '0.4rem 0.8rem', border: 'none', borderRadius: '8px',
      background: 'var(--ED-General-color-bg-secondary)', color: 'var(--ED-General-color-text-secondary)', cursor: 'pointer',
      fontWeight: 'bold', fontSize: '0.9rem'
    }, ['🌐 ' + t('programs.geography', 'Geography')]);
    tabs.appendChild(hisBtn);
    if (geoProg) tabs.appendChild(geoBtn);
    detail.appendChild(tabs);

    const content = el('div', {});
    detail.appendChild(content);

    let activeTab = 'his';
    function showTab(tab) {
      content.innerHTML = '';
      if (tab === 'his' && hisProg) {
        content.appendChild(buildSubjectDetailPanel(hisProg, yearKey, null));
        hisBtn.style.background = 'var(--ED-General-color-accent-default)';
        hisBtn.style.color = '#fff';
        if (geoBtn) {
          geoBtn.style.background = 'var(--ED-General-color-bg-secondary)';
          geoBtn.style.color = 'var(--ED-General-color-text-secondary)';
        }
      } else if (tab === 'geo' && geoProg) {
        content.appendChild(buildSubjectDetailPanel(geoProg, yearKey, null));
        geoBtn.style.background = 'var(--ED-General-color-accent-default)';
        geoBtn.style.color = '#fff';
        if (hisBtn) {
          hisBtn.style.background = 'var(--ED-General-color-bg-secondary)';
          hisBtn.style.color = 'var(--ED-General-color-text-secondary)';
        }
      }
      activeTab = tab;
    }
    hisBtn.addEventListener('click', (e) => { e.stopPropagation(); showTab('his'); });
    if (geoBtn) geoBtn.addEventListener('click', (e) => { e.stopPropagation(); showTab('geo'); });

    header.addEventListener('click', () => {
      const isExpanded = detail.style.display === 'block';
      detail.style.display = isExpanded ? 'none' : 'block';
      arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      if (!isExpanded) {
        if (activeTab === 'his' && hisProg) showTab('his');
        else if (activeTab === 'geo' && geoProg) showTab('geo');
      }
    });

    return card;
  }

  // Build expandable card for a multi‑section year
  function buildSectionYearCard(yearKey, yearData) {
    const sectionKeys = Object.keys(yearData.sections);
    if (sectionKeys.length === 0) return null;

    const card = el('div', {
      background: 'var(--ED-General-color-surface)',
      borderRadius: '16px',
      border: '1px solid var(--ED-General-color-border)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s'
    });

    const header = el('div', {
      padding: '1.25rem 1.5rem',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      userSelect: 'none',
      background: 'var(--ED-General-color-bg-secondary)'
    });
    const title = el('h2', { margin: '0', fontSize: '1.3rem', color: 'var(--ED-General-color-text-primary)' }, [getLangText(yearData.title)]);
    const arrow = el('span', { fontSize: '1.2rem', transition: 'transform 0.2s' }, ['▼']);
    const titleBlock = el('div', { display: 'flex', alignItems: 'center', gap: '1rem' });
    titleBlock.appendChild(title);

    const select = el('select', {
      padding: '0.3rem 0.5rem',
      borderRadius: '6px',
      border: '1px solid var(--ED-General-color-border)',
      background: 'var(--ED-General-color-surface)',
      color: 'var(--ED-General-color-text-primary)',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    });
    sectionKeys.forEach(sk => {
      const opt = document.createElement('option');
      opt.value = sk;
      opt.textContent = getLangText(yearData.sections[sk].title);
      select.appendChild(opt);
    });
    titleBlock.appendChild(select);
    header.appendChild(titleBlock);
    header.appendChild(arrow);
    card.appendChild(header);

    const detail = el('div', { display: 'none', padding: '0 1.5rem 1.5rem' });
    card.appendChild(detail);

    function renderSection(sectionKey) {
      detail.innerHTML = '';
      const programs = yearData.sectionPrograms[sectionKey] || [];
      const hisProg = programs.find(p => p.type === 'his');
      const geoProg = programs.find(p => p.type === 'geo');

      const tabs = el('div', { display: 'flex', gap: '0.5rem', marginBottom: '1rem', marginTop: '1rem' });
      const hisBtn = el('button', {
        padding: '0.4rem 0.8rem', border: 'none', borderRadius: '8px',
        background: 'var(--ED-General-color-accent-default)', color: '#fff', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '0.9rem'
      }, ['📜 ' + t('programs.history', 'History')]);
      const geoBtn = el('button', {
        padding: '0.4rem 0.8rem', border: 'none', borderRadius: '8px',
        background: 'var(--ED-General-color-bg-secondary)', color: 'var(--ED-General-color-text-secondary)', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '0.9rem'
      }, ['🌐 ' + t('programs.geography', 'Geography')]);
      tabs.appendChild(hisBtn);
      if (geoProg) tabs.appendChild(geoBtn);
      detail.appendChild(tabs);

      const content = el('div', {});
      detail.appendChild(content);

      function showTab(tab) {
        content.innerHTML = '';
        if (tab === 'his' && hisProg) {
          content.appendChild(buildSubjectDetailPanel(hisProg, yearKey, sectionKey));
          hisBtn.style.background = 'var(--ED-General-color-accent-default)';
          hisBtn.style.color = '#fff';
          if (geoBtn) {
            geoBtn.style.background = 'var(--ED-General-color-bg-secondary)';
            geoBtn.style.color = 'var(--ED-General-color-text-secondary)';
          }
        } else if (tab === 'geo' && geoProg) {
          content.appendChild(buildSubjectDetailPanel(geoProg, yearKey, sectionKey));
          geoBtn.style.background = 'var(--ED-General-color-accent-default)';
          geoBtn.style.color = '#fff';
          if (hisBtn) {
            hisBtn.style.background = 'var(--ED-General-color-bg-secondary)';
            hisBtn.style.color = 'var(--ED-General-color-text-secondary)';
          }
        }
      }
      hisBtn.addEventListener('click', (e) => { e.stopPropagation(); showTab('his'); });
      if (geoBtn) geoBtn.addEventListener('click', (e) => { e.stopPropagation(); showTab('geo'); });

      showTab('his');
    }

    header.addEventListener('click', (e) => {
      if (e.target === select || select.contains(e.target)) return;
      const isExpanded = detail.style.display === 'block';
      detail.style.display = isExpanded ? 'none' : 'block';
      arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      if (!isExpanded) {
        renderSection(select.value);
      }
    });

    select.addEventListener('change', (e) => {
      e.stopPropagation();
      if (detail.style.display === 'block') {
        renderSection(select.value);
      }
    });

    return card;
  }

  function renderAllCards() {
    let container = document.getElementById('year-programs-container');
    if (!container) {
      const main = document.querySelector('main');
      if (main) {
        container = document.createElement('div');
        container.id = 'year-programs-container';
        container.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(380px, 1fr)); gap:1.5rem; padding:1.5rem;';
        main.appendChild(container);
      } else {
        return;
      }
    }
    container.innerHTML = '';

    const data = window.HGH_YEAR_PROGRAMS;
    if (!data) return;

    const yearKeys = ['y05', 'y06', 'y07', 'y08', 'y09', 'y1sec', 'y2sec', 'y3sec', 'y4sec'];

    yearKeys.forEach(key => {
      const year = data[key];
      if (!year) return;
      if (year.sections && year.sectionPrograms) {
        const card = buildSectionYearCard(key, year);
        if (card) container.appendChild(card);
      } else {
        container.appendChild(buildYearCard(key, year, year.programs));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAllCards);
  } else {
    renderAllCards();
  }
  document.addEventListener('translationsApplied', renderAllCards);
})();