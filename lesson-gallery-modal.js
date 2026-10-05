// lesson-gallery-modal.js – Opens gallery images in a full-screen zoomable & pannable modal
(function () {
  'use strict';

  function buildModal() {
    if (document.getElementById('gallery-zoom-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'gallery-zoom-modal';
    modal.innerHTML = `
      <div class="gzm-backdrop"></div>
      <div class="gzm-content">
        <img id="gzm-image" src="" alt="Zoomed image" draggable="false" />
        <div class="gzm-controls">
          <button class="gzm-btn gzm-zoom-in"  title="Zoom in">🔍+</button>
          <button class="gzm-btn gzm-zoom-out" title="Zoom out">🔍-</button>
          <button class="gzm-btn gzm-reset"    title="Reset zoom">↺</button>
          <button class="gzm-btn gzm-close"    title="Close">✕</button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #gallery-zoom-modal {
        position: fixed;
        inset: 0;
        z-index: 10001;
        display: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      #gallery-zoom-modal.active { display: flex; }

      .gzm-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.85);
        cursor: pointer;
      }

      .gzm-content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 95vw;
        max-height: 95vh;
        z-index: 2;
      }

      #gzm-image {
        max-width: 90vw;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
        cursor: grab;
        user-select: none;
        -webkit-user-drag: none;
        touch-action: none;              /* let us handle gestures ourselves */
        will-change: transform;
        transform-origin: center center;
      }
      #gzm-image.smooth  { transition: transform 0.2s ease; }
      #gzm-image.grabbing { cursor: grabbing; }

      .gzm-controls {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        background: rgba(0,0,0,0.5);
        padding: 0.5rem 1rem;
        border-radius: 40px;
        backdrop-filter: blur(6px);
      }
      .gzm-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 1.2rem;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        line-height: 1;
      }
      .gzm-btn:hover { background: rgba(255,255,255,0.4); }
      .gzm-close { font-size: 1rem; }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    const img       = document.getElementById('gzm-image');
    const closeBtn  = modal.querySelector('.gzm-close');
    const backdrop  = modal.querySelector('.gzm-backdrop');
    const zoomInBtn = modal.querySelector('.gzm-zoom-in');
    const zoomOutBtn= modal.querySelector('.gzm-zoom-out');
    const resetBtn  = modal.querySelector('.gzm-reset');

    /* ─── State ─── */
    let scale = 1;          // zoom factor
    let tx = 0, ty = 0;     // translation in px

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 4;

    function applyTransform() {
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function smooth(fn) {
      img.classList.add('smooth');
      fn();
      clearTimeout(smooth._t);
      smooth._t = setTimeout(() => img.classList.remove('smooth'), 220);
    }

    function resetView(animate) {
      if (animate) {
        smooth(() => { scale = 1; tx = 0; ty = 0; applyTransform(); });
      } else {
        scale = 1; tx = 0; ty = 0; applyTransform();
      }
    }

    function closeModal() {
      modal.classList.remove('active');
      resetView(false);
      img.src = '';
    }

    /**
     * Zoom to `newScale`, keeping the screen point (anchorX, anchorY) fixed.
     * If anchorX/Y are undefined, zoom about the image center.
     */
    function zoomAt(newScale, anchorX, anchorY) {
      newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
      if (newScale === scale) return;

      const rect = img.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const ax = (anchorX === undefined) ? cx : anchorX;
      const ay = (anchorY === undefined) ? cy : anchorY;

      const dx = ax - cx;
      const dy = ay - cy;
      const r  = newScale / scale;

      tx += dx * (1 - r);
      ty += dy * (1 - r);
      scale = newScale;

      // When fully zoomed out, snap to center
      if (scale <= 1) { tx = 0; ty = 0; }

      applyTransform();
    }

    /* ─── Buttons ─── */
    closeBtn.addEventListener('click', closeModal);
    zoomInBtn.addEventListener('click', () => smooth(() => zoomAt(scale + 0.5)));
    zoomOutBtn.addEventListener('click', () => smooth(() => zoomAt(scale - 0.5)));
    resetBtn.addEventListener('click', () => resetView(true));

    /* ─── Backdrop click (guarded against drag-out) ─── */
    let justDragged = false;
    backdrop.addEventListener('click', () => {
      if (justDragged) return;
      closeModal();
    });

    /* ─── Mouse wheel zoom (anchored at cursor) ─── */
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      zoomAt(scale + delta, e.clientX, e.clientY);
    }, { passive: false });

    /* ─── Mouse drag to pan ─── */
    let isDragging  = false;
    let dragStartX  = 0, dragStartY  = 0;
    let startTx     = 0, startTy     = 0;

    img.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      justDragged = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startTx = tx;
      startTy = ty;
      img.classList.add('grabbing');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      tx = startTx + (e.clientX - dragStartX);
      ty = startTy + (e.clientY - dragStartY);
      applyTransform();
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      img.classList.remove('grabbing');
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);

      // If the user panned while zoomed out, glide back to center
      if (scale <= 1 && (tx !== 0 || ty !== 0)) {
        smooth(() => { tx = 0; ty = 0; applyTransform(); });
      }
    });

    /* ─── Touch: 1 finger = pan, 2 fingers = pinch zoom + pan ─── */
    let touchMode = 'none';
    let panStartX = 0, panStartY = 0, panStartTx = 0, panStartTy = 0;

    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchLastMidX = 0, pinchLastMidY = 0;

    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchMode = 'pan';
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
        panStartTx = tx;
        panStartTy = ty;
      } else if (e.touches.length === 2) {
        touchMode = 'pinch';
        const t1 = e.touches[0], t2 = e.touches[1];
        pinchStartDist  = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        pinchStartScale = scale;
        pinchLastMidX   = (t1.clientX + t2.clientX) / 2;
        pinchLastMidY   = (t1.clientY + t2.clientY) / 2;
      }
    }, { passive: false });

    img.addEventListener('touchmove', (e) => {
      e.preventDefault();

      if (touchMode === 'pan' && e.touches.length === 1) {
        tx = panStartTx + (e.touches[0].clientX - panStartX);
        ty = panStartTy + (e.touches[0].clientY - panStartY);
        applyTransform();
      } else if (touchMode === 'pinch' && e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        // Pan by the movement of the pinch midpoint
        tx += midX - pinchLastMidX;
        ty += midY - pinchLastMidY;

        // Zoom by distance ratio
        if (pinchStartDist > 0) {
          const target = pinchStartScale * (dist / pinchStartDist);
          const clamped = Math.min(Math.max(target, MIN_SCALE), MAX_SCALE);
          scale = clamped;
          if (scale <= 1) { tx = 0; ty = 0; }
        }

        pinchLastMidX = midX;
        pinchLastMidY = midY;
        applyTransform();
      }
    }, { passive: false });

    img.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        touchMode = 'none';
        // Snap back if we ended below scale 1
        if (scale <= 1 && (tx !== 0 || ty !== 0)) {
          smooth(() => { tx = 0; ty = 0; applyTransform(); });
        }
      } else if (e.touches.length === 1) {
        // Pinch → pan transition
        touchMode = 'pan';
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
        panStartTx = tx;
        panStartTy = ty;
      }
    });

    /* ─── ESC to close ─── */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /* ─── Open modal with an image ─── */
  function openModal(src) {
    const modal = document.getElementById('gallery-zoom-modal');
    if (!modal) return;
    const img = document.getElementById('gzm-image');
    img.src = src;
    modal.classList.add('active');
  }

  /* ─── Delegate click on all images inside .gallery ─── */
  function attachGalleryListeners() {
    document.addEventListener('click', (e) => {
      const img = e.target.closest('.gallery img');
      if (!img) return;
      if (img.closest('a')) return;         // let real links work
      e.preventDefault();
      const src = img.getAttribute('src');
      if (src) openModal(src);
    });
  }

  function init() {
    buildModal();
    attachGalleryListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();