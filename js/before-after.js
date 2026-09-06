/* ==========================================================================
   js/before-after.js — Motion-Inspired Architectural Curtain Slider
   Direction-locked drag, spring-damped elastic physics, vanilla CSS/JS
   ========================================================================== */

export function initBeforeAfter(containerId = 'ba-slider') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const handle = container.querySelector('.ba-handle');
  const clipLayer = container.querySelector('.ba-layer--before');
  if (!handle || !clipLayer) return;

  // Spring & physics constants (matching Motion bounceStiffness & bounceDamping)
  const STIFFNESS = 420;
  const DAMPING = 28;
  const ELASTICITY = 0.2; // dragElastic: 0.2
  const DT = 0.016;

  let isPointerDown = false;
  let isDragging = false;
  let activeDirection = null; // 'x' | 'y' | null

  let startX = 0;
  let startY = 0;
  let currentPos = 50; // percentage
  let targetPos = 50;
  let velocity = 0;
  let rafId = null;

  function render(val) {
    const clamped = Math.max(0, Math.min(100, val));
    container.style.setProperty('--ba-split', `${clamped}%`);
    handle.setAttribute('aria-valuenow', Math.round(clamped));
  }

  function stepSpring() {
    const displacement = currentPos - targetPos;
    const springForce = -STIFFNESS * displacement;
    const dampingForce = -DAMPING * velocity;
    const acceleration = springForce + dampingForce;

    velocity += acceleration * DT;
    currentPos += velocity * DT;

    render(currentPos);

    // Stop loop when spring reaches equilibrium and pointer is released
    if (!isDragging && Math.abs(displacement) < 0.03 && Math.abs(velocity) < 0.03) {
      currentPos = targetPos;
      velocity = 0;
      render(currentPos);
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(stepSpring);
  }

  function wakeSpring() {
    if (!rafId) {
      rafId = requestAnimationFrame(stepSpring);
    }
  }

  function getClientCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    isPointerDown = true;
    isDragging = false;
    activeDirection = null;

    const coords = getClientCoords(e);
    startX = coords.x;
    startY = coords.y;

    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;

    const coords = getClientCoords(e);
    const dx = coords.x - startX;
    const dy = coords.y - startY;

    // Direction lock detection
    if (!activeDirection) {
      if (Math.hypot(dx, dy) < 4) return; // Deadzone threshold

      if (Math.abs(dx) >= Math.abs(dy)) {
        activeDirection = 'x';
        isDragging = true;
        container.setAttribute('data-active-dir', 'x');
        container.classList.add('ba-dragging');
      } else {
        activeDirection = 'y';
        // Vertical scroll intent: allow native page scroll
        return;
      }
    }

    if (activeDirection === 'x') {
      if (e.cancelable) e.preventDefault();

      const rect = container.getBoundingClientRect();
      const rawPct = ((coords.x - rect.left) / rect.width) * 100;

      // Elastic resistance past boundaries (dragElastic: 0.2)
      if (rawPct < 0) {
        targetPos = rawPct * ELASTICITY;
      } else if (rawPct > 100) {
        targetPos = 100 + (rawPct - 100) * ELASTICITY;
      } else {
        targetPos = rawPct;
      }

      wakeSpring();
    }
  }

  function onPointerUp(e) {
    if (!isPointerDown) return;

    isPointerDown = false;
    isDragging = false;
    activeDirection = null;

    container.classList.remove('ba-dragging');
    container.removeAttribute('data-active-dir');

    // Automatically spring back to middle (50%) when released
    targetPos = 50;
    wakeSpring();

    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
    window.removeEventListener('touchcancel', onPointerUp);
  }

  container.addEventListener('mousedown', onPointerDown);
  container.addEventListener('touchstart', onPointerDown, { passive: true });

  // Keyboard navigation with smooth spring glide and release back to middle
  handle.addEventListener('keydown', (e) => {
    let delta = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -12;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 12;
    else if (e.key === 'Home') { targetPos = 0; wakeSpring(); e.preventDefault(); return; }
    else if (e.key === 'End') { targetPos = 100; wakeSpring(); e.preventDefault(); return; }

    if (delta !== 0) {
      e.preventDefault();
      targetPos = Math.max(0, Math.min(100, currentPos + delta));
      wakeSpring();
    }
  });

  handle.addEventListener('keyup', () => {
    targetPos = 50;
    wakeSpring();
  });

  // Initial render at 50%
  render(50);
}
