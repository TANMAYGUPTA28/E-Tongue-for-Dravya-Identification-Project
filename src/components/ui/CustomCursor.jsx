import { useEffect, useRef, useState } from 'react';

/**
 * 2026 Awwwards-Caliber Custom Cursor
 * - Hardware accelerated translate3d transforms via Direct DOM Refs (Zero React re-render overhead)
 * - Spring Lerp ring trail (120 FPS fluid tracking)
 * - Click bounce physics & magnetic hover scaling on interactive targets
 * - Respects prefers-reduced-motion & touch/coarse devices
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // Disable on touch screens or when user prefers reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) {
      setIsDisabled(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isMouseDown = false;
    let isVisible = false;
    let rafId = null;

    const dotEl = dotRef.current;
    const ringEl = ringRef.current;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotEl) dotEl.style.opacity = '1';
        if (ringEl) ringEl.style.opacity = '1';
      }

      // Detect hover on interactive elements
      const target = e.target;
      const interactive = target && target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive]');
      isHovering = !!interactive;
    };

    const onMouseDown = () => {
      isMouseDown = true;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotEl) dotEl.style.opacity = '0';
      if (ringEl) ringEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dotEl) dotEl.style.opacity = '1';
      if (ringEl) ringEl.style.opacity = '1';
    };

    // Render loop running on requestAnimationFrame
    const render = () => {
      // Lerp ring towards mouse position
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotEl) {
        const dotScale = isHovering ? 0 : isMouseDown ? 0.6 : 1;
        dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      if (ringEl) {
        const size = isHovering ? 54 : isMouseDown ? 26 : 34;
        const ringScale = isMouseDown ? 0.9 : 1;
        ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
        ringEl.style.width = `${size}px`;
        ringEl.style.height = `${size}px`;
        ringEl.style.borderColor = isHovering ? '#B6F36A' : 'rgba(182, 243, 106, 0.45)';
        ringEl.style.backgroundColor = isHovering ? 'rgba(182, 243, 106, 0.10)' : 'transparent';
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (isDisabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-lime pointer-events-none z-[9999] opacity-0 transition-opacity duration-200 shadow-[0_0_10px_#B6F36A]"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 rounded-full border border-lime/40 pointer-events-none z-[9998] opacity-0 transition-opacity duration-200 backdrop-blur-[1px]"
        style={{ willChange: 'transform, width, height, border-color, background-color' }}
      />
    </>
  );
}

