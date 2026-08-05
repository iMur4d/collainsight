/**
 * CollainSight — Animated Explainer
 * Single JS-driven timeline: one requestAnimationFrame clock computes each
 * scene's crossfade opacity + Ken Burns transform every frame, and fires a
 * one-shot "enter" trigger (path draws, staggered entrances, counters) the
 * instant a scene's start time is crossed.
 */

(function () {
  'use strict';

  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SCENES = [
    { id: 'scene-1', start: 0.0,  duration: 4.5 },
    { id: 'scene-2', start: 4.5,  duration: 4.5 },
    { id: 'scene-3', start: 9.0,  duration: 4.5 },
    { id: 'scene-4', start: 13.5, duration: 4.5 },
    { id: 'scene-5', start: 18.0, duration: 5.0 },
    { id: 'scene-6', start: 23.0, duration: 5.0 },
    { id: 'scene-7', start: 28.0, duration: 4.5 },
    { id: 'scene-8', start: 32.5, duration: 5.5 }
  ];

  var CROSSFADE = 0.7;
  var TOTAL_DURATION = SCENES[SCENES.length - 1].start + SCENES[SCENES.length - 1].duration;
  var KENBURNS_SCALE = REDUCED_MOTION ? 0 : 0.045;
  var COUNTER_DURATION = REDUCED_MOTION ? 1 : 1400;

  var sceneEls = SCENES.map(function (s) { return document.getElementById(s.id); });
  var entered = SCENES.map(function () { return false; });

  var progressFill = document.getElementById('progress-fill');
  var dotsContainer = document.getElementById('scene-dots');
  var replayBtn = document.getElementById('replay-btn');

  var playStartTime = null;
  var finished = false;
  var rafId = null;

  /* ---------------------------------------------------------------
     Setup: measure every drawable path once, expose length as --len
     --------------------------------------------------------------- */
  function measurePaths() {
    var paths = document.querySelectorAll('[data-draw]');
    paths.forEach(function (path) {
      try {
        var len = path.getTotalLength();
        path.style.setProperty('--len', len.toFixed(1));
      } catch (err) {
        path.style.setProperty('--len', '1000');
      }
    });
  }

  /* ---------------------------------------------------------------
     HUD: scene dots
     --------------------------------------------------------------- */
  function buildDots() {
    SCENES.forEach(function (scene, idx) {
      var btn = document.createElement('button');
      btn.className = 'scene-dot';
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', 'Jump to scene ' + (idx + 1) + ' of ' + SCENES.length);
      btn.addEventListener('click', function () { seek(idx); });
      dotsContainer.appendChild(btn);
    });
  }

  function updateDots(currentIdx) {
    var dots = dotsContainer.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-current', i === currentIdx);
    }
  }

  /* ---------------------------------------------------------------
     Counters
     --------------------------------------------------------------- */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter-to'));
    var suffix = el.getAttribute('data-counter-suffix') || '';
    if (isNaN(target)) return;

    if (COUNTER_DURATION <= 1) {
      el.textContent = target + suffix;
      return;
    }

    el.textContent = '0' + suffix;
    var start = null;

    function step(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / COUNTER_DURATION);
      var value = Math.round(target * easeOutCubic(t));
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------
     Scene enter (fires once per scene per playthrough / seek)
     --------------------------------------------------------------- */
  function triggerEnter(idx) {
    var el = sceneEls[idx];
    if (!el) return;

    // Restart every CSS animation gated on ".is-active" inside this scene.
    el.classList.remove('is-active');
    void el.offsetWidth; // force reflow
    el.classList.add('is-active');

    var counters = el.querySelectorAll('[data-counter-to]');
    counters.forEach(animateCounter);

    updateDots(idx);
  }

  /* ---------------------------------------------------------------
     Per-frame opacity + Ken Burns transform
     --------------------------------------------------------------- */
  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function opacityFor(scene, elapsed, isLast) {
    var t = elapsed - scene.start;
    if (t < 0) return 0;
    if (t < CROSSFADE) return clamp01(t / CROSSFADE);
    if (t < scene.duration) return 1;
    if (isLast) return 1;
    if (t < scene.duration + CROSSFADE) return clamp01(1 - (t - scene.duration) / CROSSFADE);
    return 0;
  }

  function applyFrame(elapsed) {
    SCENES.forEach(function (scene, idx) {
      var isLast = idx === SCENES.length - 1;
      var op = opacityFor(scene, elapsed, isLast);
      var el = sceneEls[idx];
      if (op <= 0) {
        el.style.opacity = 0;
        el.style.transform = 'scale(' + (1 + KENBURNS_SCALE) + ')';
        return;
      }
      var t = clamp01((elapsed - scene.start) / (scene.duration + CROSSFADE));
      var scale = 1 + KENBURNS_SCALE * (1 - t);
      el.style.opacity = op;
      el.style.transform = 'scale(' + scale.toFixed(4) + ')';

      if (!entered[idx] && elapsed >= scene.start) {
        entered[idx] = true;
        triggerEnter(idx);
      }
    });
  }

  /* ---------------------------------------------------------------
     Master clock
     --------------------------------------------------------------- */
  function tick(now) {
    if (playStartTime === null) playStartTime = now;
    var elapsed = (now - playStartTime) / 1000;

    if (elapsed >= TOTAL_DURATION) {
      applyFrame(TOTAL_DURATION);
      progressFill.style.width = '100%';
      finishPlayback();
      return;
    }

    applyFrame(elapsed);
    progressFill.style.width = (elapsed / TOTAL_DURATION * 100).toFixed(2) + '%';
    rafId = requestAnimationFrame(tick);
  }

  function finishPlayback() {
    finished = true;
    replayBtn.classList.add('is-visible');
  }

  function startPlayback(fromElapsed) {
    finished = false;
    replayBtn.classList.remove('is-visible');
    playStartTime = performance.now() - (fromElapsed || 0) * 1000;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------
     Seek / replay controls
     --------------------------------------------------------------- */
  function seek(idx) {
    var target = SCENES[idx].start + 0.02;
    for (var i = 0; i < SCENES.length; i++) {
      entered[i] = i < idx;
    }
    startPlayback(target);
    entered[idx] = true;
    triggerEnter(idx);
  }

  function replay() {
    entered = SCENES.map(function () { return false; });
    startPlayback(0);
  }

  replayBtn.addEventListener('click', replay);

  /* ---------------------------------------------------------------
     Init
     --------------------------------------------------------------- */
  function init() {
    measurePaths();
    buildDots();
    startPlayback(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
