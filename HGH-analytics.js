// hgh-analytics.js – Tracks interactions in HGH tables
(function () {
  'use strict';

  const FUNCTION_URL = 'https://hmjbzzuresgzwzefjpyt.supabase.co/functions/v1/log-hgh-interaction';
  const QUEUE_KEY = '__hgh_analytics_offline_queue__';
  const lastSent = {};

  function shouldThrottle(entityType, entityId) {
    const key = `${entityType}::${entityId}`;
    const now = Date.now();
    if (lastSent[key] && now - lastSent[key] < 3000) return true;
    lastSent[key] = now;
    return false;
  }

  function sendEvent(entityType, entityId) {
    return fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
    });
  }

  function getQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
  }
  function addToQueue(entityType, entityId) {
    const queue = getQueue();
    queue.push({ entity_type: entityType, entity_id: entityId, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
  function removeFromQueue(count) {
    const queue = getQueue();
    if (count <= 0) return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(count)));
  }

  async function flushQueue() {
    const queue = getQueue();
    if (queue.length === 0) return;
    let sent = 0;
    for (const item of queue) {
      try {
        await sendEvent(item.entity_type, item.entity_id);
        sent++;
      } catch (err) {
        console.warn('HGH analytics flush failed', err);
        break;
      }
    }
    if (sent === queue.length) {
      localStorage.removeItem(QUEUE_KEY);
    } else if (sent > 0) {
      removeFromQueue(sent);
    }
  }

  function trackInteraction(entityType, entityId) {
    if (shouldThrottle(entityType, entityId)) return;
    if (navigator.onLine) {
      sendEvent(entityType, entityId).catch(() => addToQueue(entityType, entityId));
    } else {
      addToQueue(entityType, entityId);
    }
  }

  window.addEventListener('online', flushQueue);
  if (navigator.onLine) flushQueue();

  // Track page views
  function trackPageView() {
    const path = location.pathname.replace(/^\//, '').replace('.html', '');
    trackInteraction('page', path || 'home');
  }

  // Setup card click tracking (add data-analytics-id to clickable elements)
  document.addEventListener('click', function (e) {
    const tracked = e.target.closest('[data-analytics-id]');
    if (tracked) {
      const id = tracked.getAttribute('data-analytics-id');
      trackInteraction('card', id);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
})();