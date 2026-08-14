// lesson-gallery-modal.js – Opens gallery images in a full‑screen zoomable modal
(function () {
  'use strict';

  // ── Create modal structure once, hide it ──
  function buildModal() {
    if (document.getElementById('gallery-zoom-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'gallery-zoom-modal';
    modal.innerHTML = `
      <div class="gzm-backdrop"></div>
      <div class="gzm-content">
        <img id="gzm-image" src="" alt="Zoomed image" />
        <div class="gzm-controls">
          <button class="gzm-btn gzm-zoom-in" title="Zoom in">🔍+</button>
          <button class="gzm-btn gzm-zoom-out" title="Zoom out">🔍-</button>
          <button class="gzm-btn gzm-reset" title="Reset zoom">↺</button>
          <button class="gzm-btn gzm-close" title="Close">✕</button>
        </div>
      </div>
    `;

    // Inline essential styles (the rest will be in a <style> tag)
    const style = document.createElement('style');
    style.textContent = `
      #gallery-zoom-modal {
        position: fixed;
        inset: 0;
        z-index: 10001;
        display: none;
        align-items: center;
        justify-content: center;
      }
      #gallery-zoom-modal.active {
        display: flex;
      }
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
        transition: transform 0.2s ease;
        cursor: grab;
      }
      #gzm-image:active {
        cursor: grabbing;
      }
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
      .gzm-btn:hover {
        background: rgba(255,255,255,0.4);
      }
      .gzm-close {
        font-size: 1rem;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // ── Event listeners ──
    const img = document.getElementById('gzm-image');
    const closeBtn = modal.querySelector('.gzm-close');
    const backdrop = modal.querySelector('.gzm-backdrop');
    const zoomIn = modal.querySelector('.gzm-zoom-in');
    const zoomOut = modal.querySelector('.gzm-zoom-out');
    const reset = modal.querySelector('.gzm-reset');

    let scale = 1;

    function updateZoom() {
      img.style.transform = `scale(${scale})`;
    }

    function closeModal() {
      modal.classList.remove('active');
      scale = 1;
      updateZoom();
      img.src = '';
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    zoomIn.addEventListener('click', () => {
      scale = Math.min(scale + 0.3, 4);
      updateZoom();
    });
    zoomOut.addEventListener('click', () => {
      scale = Math.max(scale - 0.3, 0.5);
      updateZoom();
    });
    reset.addEventListener('click', () => {
      scale = 1;
      updateZoom();
    });

    // Mouse wheel zoom
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      scale = Math.min(Math.max(scale + delta, 0.5), 4);
      updateZoom();
    });

    // Touch pinch zoom
    let initialDistance = 0;
    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });
    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialDistance > 0) {
          const factor = currentDistance / initialDistance;
          scale = Math.min(Math.max(factor, 0.5), 4);
          updateZoom();
        }
      }
    }, { passive: false });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // ── Open modal with an image ──
  function openModal(src) {
    const modal = document.getElementById('gallery-zoom-modal');
    if (!modal) return;
    const img = document.getElementById('gzm-image');
    img.src = src;
    modal.classList.add('active');
  }

  // ── Delegate click on all images inside .gallery ──
  function attachGalleryListeners() {
    document.addEventListener('click', (e) => {
      const img = e.target.closest('.gallery img');
      if (!img) return;
      // Ignore if the image is inside a link (let the link work)
      if (img.closest('a')) return;
      e.preventDefault();
      const src = img.getAttribute('src');
      if (src) openModal(src);
    });
  }

  // ── Initialise ──
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