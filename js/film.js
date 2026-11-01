(function () {
  var FPS = 25, D = 58;
  var C = { grey: ['--grey', '#000'], yellow: ['--yellow', '#000'], cyan: ['--cyan', '#000'], green: ['--green', '#000'], magenta: ['--magenta', '#fff'], red: ['--red', '#fff'], blue: ['--blue', '#fff'] };
  var SCENES = [
    { id: 'leader', s: 0, e: 4, n: 'Colour bars and leader', clips: ['how'] },
    { id: 'title', s: 4, e: 10, n: 'Main title', clips: ['contact'] },
    { id: 'profile', s: 10, e: 17, n: 'Profile', clips: ['summary'] },
    { id: 'bizunite', s: 17, e: 25, n: 'Bizunite', clips: ['biz', 'projects'] },
    { id: 'bk', s: 25, e: 33, n: 'BK Society, 2026 to now', clips: ['bk'] },
    { id: 'skills', s: 33, e: 42, n: 'Skills', clips: ['skills', 'comp'] },
    { id: 'education', s: 42, e: 50, n: 'Education', clips: ['edu'] },
    { id: 'end', s: 50, e: 58, n: 'End card', clips: ['contact', 'lang'] }
  ];
  var TRACKS = [
    { k: 'V3', n: 'Titles', clips: [[0, 4, 'Leader', 'grey'], [4, 10, 'Main title', 'red'], [10, 17, 'Profile', 'cyan'], [50, 58, 'End card', 'red']] },
    { k: 'V2', n: 'Work', clips: [[17, 25, 'Bizunite', 'yellow'], [25, 33, 'BK Society', 'magenta']] },
    { k: 'V1', n: 'School', clips: [[42, 44, 'SSC', 'green'], [44, 46, 'HSC', 'green'], [46, 48, 'B.Sc', 'green'], [48, 50, 'M.Sc', 'green']] },
    { k: 'A1', n: 'Skills', audio: 1, clips: [[33, 36, 'Web', 'blue'], [36, 39, 'Design', 'blue'], [39, 42, 'Video', 'blue']] },
    { k: 'A2', n: 'Languages', audio: 1, clips: [[50, 52.6, 'English', 'grey'], [52.6, 55.3, 'Hindi', 'grey'], [55.3, 58, 'Marathi', 'grey']] }
  ];
  var CUTS = [10, 17, 25, 33, 42, 50];
  // The name in many scripts. The list ends on Marathi, where the title card settles.
  var LANGS = [
    ['Ganesh Tayade', 'en'], ['गणेश तायडे', 'hi'], ['ગણેશ તાયડે', 'gu'], ['ਗਣੇਸ਼ ਤਾਯਡੇ', 'pa'], ['গণেশ তায়ডে', 'bn'],
    ['கணேஷ் தாயடே', 'ta'], ['గణేష్ తాయడే', 'te'], ['ಗಣೇಶ್ ತಾಯಡೆ', 'kn'], ['ガネーシュ・タヤデ', 'ja'], ['가네시 타야데', 'ko'],
    ['加内什·塔亚德', 'zh'], ['Ганеш Таяде', 'ru'], ['Γκανές Ταγιάντε', 'el'], ['غانيش تايادي', 'ar'], ['गणेश तायडे', 'mr']
  ];
  function setLang(el, i) { el.textContent = LANGS[i][0]; el.setAttribute('lang', LANGS[i][1]); el.style.direction = LANGS[i][1] === 'ar' ? 'rtl' : 'ltr'; }
  var AMB = { leader: '--grey', title: '--magenta', profile: '--cyan', bizunite: '--yellow', bk: '--magenta', skills: '--blue', education: '--green', end: '--magenta' };
  var $ = function (id) { return document.getElementById(id); };
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = 0, rate = 0, last = 0, drawn = -1, curScene = null, inView = true;

  function pct(v) { return (v / D * 100) + '%'; }
  function tc(sec) {
    var f = Math.round(sec * FPS), ff = f % FPS, s = Math.floor(f / FPS);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return '00:' + p(Math.floor(s / 60)) + ':' + p(s % 60) + ':' + p(ff);
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(p) { return 1 - Math.pow(1 - p, 4); }

  // Build the timeline; the same data draws the print band
  var clipEls = [];
  function clipEl(tag, c) {
    var el = document.createElement(tag), col = C[c[3]];
    el.className = 'clip';
    el.dataset.l = c[2];
    el.style.left = pct(c[0]);
    el.style.width = pct(c[1] - c[0]);
    el.style.setProperty('--c', 'var(' + col[0] + ')');
    el.style.setProperty('--t', col[1]);
    return el;
  }
  TRACKS.forEach(function (tr) {
    var h = document.createElement('div');
    h.className = 'head';
    h.innerHTML = '<b>' + tr.k + '</b><span>' + tr.n + '</span>';
    $('heads').appendChild(h);
    var lane = document.createElement('div');
    lane.className = 'lane';
    tr.clips.forEach(function (c) {
      var b = clipEl('button', c);
      b.type = 'button';
      b.setAttribute('aria-label', 'Jump to ' + c[2]);
      b.addEventListener('click', function (e) { if (e.detail === 0) { pause(); seek(c[0]); } });
      if (tr.audio) { var cv = document.createElement('canvas'); b.appendChild(cv); }
      lane.appendChild(b);
      clipEls.push({ el: b, s: c[0], e: c[1] });
    });
    $('laneWrap').appendChild(lane);
  });
  for (var i = 0; i <= 50; i += 10) {
    var sp = document.createElement('span');
    sp.style.left = pct(i);
    sp.textContent = '00:' + (i < 10 ? '0' : '') + i;
    $('ruler').appendChild(sp);
  }
  (function band() {
    var hs = document.createElement('div'), ls = document.createElement('div');
    hs.className = 'bh'; ls.className = 'bl';
    TRACKS.forEach(function (tr) {
      var i = document.createElement('i'); i.dataset.l = tr.k; hs.appendChild(i);
      var l = document.createElement('div'); l.className = 'blane';
      tr.clips.forEach(function (c) {
        var el = clipEl('div', c);
        if (tr.k === 'A2') el.dataset.l = c[2].slice(0, 2);
        l.appendChild(el);
      });
      ls.appendChild(l);
    });
    $('band').appendChild(hs); $('band').appendChild(ls);
  })();

  function drawWaves() {
    document.querySelectorAll('#laneWrap canvas').forEach(function (cv, idx) {
      var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      var g = cv.getContext('2d'), h = cv.height, mid = h / 2;
      g.fillStyle = idx < 3 ? '#fff' : '#000';
      for (var x = 0; x < cv.width; x += 2 * dpr) {
        var u = x / dpr + idx * 37;
        var a = Math.abs(Math.sin(u * .09) * Math.sin(u * .023) + .5 * Math.sin(u * .31) * Math.sin(u * .013));
        var bar = Math.max(1, a * h * .9);
        g.fillRect(x, mid - bar / 2, dpr, bar);
      }
    });
  }
  if ('ResizeObserver' in window) new ResizeObserver(drawWaves).observe($('lanes'));
  else drawWaves();

  // Every animated element is a pure function of time, so scrubbing works in both directions
  var scenes = {};
  SCENES.forEach(function (sc) {
    var root = document.querySelector('[data-sc="' + sc.id + '"]');
    scenes[sc.id] = {
      root: root,
      push: root.querySelector('.push'),
      anim: Array.prototype.map.call(root.querySelectorAll('[data-a]'), function (el) {
        var a = el.dataset.a.split(' ');
        return { el: el, in: +a[0], d: +a[1], fx: a[2] };
      })
    };
  });
  var cols = document.querySelectorAll('[data-col]'), rows = document.querySelectorAll('[data-row]');
  var langs = $('langs').children, wipe = $('wipe').children;

  // Real reels inside the BK scene: they run with the film and follow the playhead when scrubbed
  var bkv = Array.prototype.slice.call(document.querySelectorAll('#strip video')), bkSync = 0;
  function syncBk() {
    var on = curScene && curScene.id === 'bk' && rate === 1;
    bkv.forEach(function (v) {
      if (on) { if (v.paused) { var q = v.play(); if (q) q.catch(function () {}); } }
      else if (!v.paused) v.pause();
    });
  }

  function drawScene(sc, lt) {
    var S = scenes[sc.id];
    S.anim.forEach(function (a) {
      var e = ease(clamp((lt - a.in) / a.d));
      if (a.fx === 'up') a.el.style.transform = 'translateY(' + ((1 - e) * 105) + '%)';
      else if (a.fx === 'fade') { a.el.style.opacity = e; }
      else if (a.fx === 'grow') a.el.style.transform = 'scaleX(' + e + ')';
      else if (a.fx === 'fade0') a.el.classList.toggle('pre', lt < a.in);
    });
    if (S.push) S.push.style.transform = calm ? '' : 'scale(' + (1 + .03 * lt / (sc.e - sc.s)) + ')';

    if (sc.id === 'leader') {
      var inBars = lt < 1;
      $('barsv').hidden = !inBars;
      $('count').hidden = inBars;
      if (!inBars) {
        var c = lt - 1;
        $('num').textContent = 3 - Math.min(2, Math.floor(c));
        $('sweep').style.setProperty('--a', (c % 1) * 360);
      }
    } else if (sc.id === 'title') {
      $('name').style.backgroundPosition = (-(lt * 3.2)) + 'cqw 0';
      var li = Math.max(0, Math.min(LANGS.length - 1, Math.floor((lt - 1) / .2)));
      if ($('deva').getAttribute('data-i') != li) { setLang($('deva'), li); $('deva').setAttribute('data-i', li); }
    } else if (sc.id === 'bk') {
      $('strip').style.transform = 'translateX(' + (-(lt * 8)) + 'cqw)';
      if (rate !== 1 && performance.now() - bkSync > 150) {
        bkSync = performance.now();
        bkv.forEach(function (v) { if (v.duration) try { v.currentTime = lt % v.duration; } catch (e) {} });
      }
    } else if (sc.id === 'skills') {
      var ci = Math.min(2, Math.floor(lt / 3));
      cols.forEach(function (el, i) { el.classList.toggle('act', i === ci); });
    } else if (sc.id === 'education') {
      var ri = Math.min(3, Math.floor(lt / 2));
      rows.forEach(function (el, i) { el.classList.toggle('act', i === ri); });
    } else if (sc.id === 'end') {
      var li = lt < 2.6 ? 0 : lt < 5.3 ? 1 : 2;
      for (var i = 0; i < langs.length; i++) langs[i].classList.toggle('act', i === li);
    }
  }

  function drawWipe(tf) {
    var v = new Array(7).fill(0), o = 'top';
    if (!calm) CUTS.forEach(function (c) {
      var d = tf - c;
      if (d >= -.28 && d < 0) { o = 'top'; for (var i = 0; i < 7; i++) v[i] = clamp((d + .28 - i * .02) / .16); }
      else if (d >= 0 && d < .28) { o = 'bottom'; for (var j = 0; j < 7; j++) v[j] = 1 - clamp((d - j * .02) / .16); }
    });
    for (var i = 0; i < 7; i++) { wipe[i].style.transform = 'scaleY(' + v[i] + ')'; wipe[i].style.transformOrigin = o; }
  }

  var sources = {};
  document.querySelectorAll('[data-clip]').forEach(function (el) { sources[el.dataset.clip] = el; });
  var howTo = '<p style="margin:0 0 10px">This resume runs as a 58-second film. Press play, or drag the timeline to scrub through it. Each clip you land on shows its full details here.</p><p style="margin:0 0 10px">Sound starts with your first click; the <b>Sound</b> button turns it off.</p><p style="margin:0"><a href="#resume">Skip to the written resume</a></p>';

  function fillInspector(sc) {
    $('insName').textContent = sc.n;
    $('insIn').textContent = tc(sc.s);
    $('insOut').textContent = tc(sc.e);
    $('insDur').textContent = tc(sc.e - sc.s);
    var body = $('insBody');
    body.textContent = '';
    if (sc.clips[0] === 'how') { body.innerHTML = howTo; return; }
    sc.clips.forEach(function (k) {
      var n = sources[k].cloneNode(true);
      n.removeAttribute('data-clip');
      n.classList.remove('p-top');
      n.style.marginBottom = '14px';
      body.appendChild(n);
    });
  }

  function render() {
    var f = Math.min(Math.floor(t * FPS + 1e-6), D * FPS - 1);
    if (f === drawn) return;
    drawn = f;
    var tf = f / FPS;
    $('tc').textContent = tc(tf);
    $('playhead').style.left = pct(tf);
    $('lanes').setAttribute('aria-valuenow', Math.floor(tf));
    $('lanes').setAttribute('aria-valuetext', tc(tf));
    var sc = SCENES.filter(function (x) { return tf >= x.s && tf < x.e; })[0] || SCENES[SCENES.length - 1];
    if (sc !== curScene) {
      if (curScene) scenes[curScene.id].root.classList.remove('on');
      scenes[sc.id].root.classList.add('on');
      curScene = sc;
      fillInspector(sc);
      $('nowp').textContent = sc.n;
      syncBk();
      document.querySelector('.framebox').style.setProperty('--amb', 'var(' + AMB[sc.id] + ')');
    }
    drawScene(sc, tf - sc.s);
    drawWipe(tf);
    clipEls.forEach(function (c) { c.el.classList.toggle('act', tf >= c.s && tf < c.e); });
    $('bSkip').hidden = tf >= 4;
    $('rectc').textContent = tc(tf);
    if (grainOk && !calm) $('grain').style.backgroundPosition = ((f * 73) % 256) + 'px ' + ((f * 131) % 256) + 'px';
  }

  // Film grain: one noise tile, shifted a fixed amount per frame so scrubbing lands on the same grain
  var grainOk = false;
  (function grain() {
    try {
      var cv = document.createElement('canvas');
      cv.width = cv.height = 256;
      var g = cv.getContext('2d'), im = g.createImageData(256, 256), seed = 7;
      for (var i = 0; i < im.data.length; i += 4) {
        seed = (seed * 16807) % 2147483647;
        var v = seed % 256;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
        im.data[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      $('grain').style.backgroundImage = 'url(' + cv.toDataURL() + ')';
      grainOk = true;
    } catch (e) {}
  })();

  // Colour grade: swaps the seven colour tokens for the whole site
  var GRADES = ['crimson', 'midnight', 'light', 'broadcast'];
  function setGrade(g, save) {
    document.documentElement.setAttribute('data-grade', g);
    document.querySelectorAll('[data-grade]').forEach(function (b) {
      if (b.classList.contains('grade')) b.setAttribute('aria-pressed', b.dataset.grade === g);
    });
    if (save) { sfx('shutter'); try { localStorage.setItem('grade', g); } catch (e) {} }
  }
  function nextGrade() {
    var cur = document.documentElement.getAttribute('data-grade') || 'crimson';
    setGrade(GRADES[(GRADES.indexOf(cur) + 1) % GRADES.length], true);
  }
  document.querySelectorAll('.grade').forEach(function (b) {
    b.onclick = function () { setGrade(b.dataset.grade, true); };
  });
  try { var savedGrade = localStorage.getItem('grade'); if (GRADES.indexOf(savedGrade) >= 0) setGrade(savedGrade); } catch (e) {}

  // Soundtrack: synthesised live and locked to film time at 120 BPM, so every cut lands on a beat
  var A = null, soundOn = false, lastStep = -1, route = null, wasPlaying = false;
  function initAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    var c = new AC(), bus = c.createGain(), comp = c.createDynamicsCompressor();
    var split = c.createChannelSplitter(2), aL = c.createAnalyser(), aR = c.createAnalyser();
    var sfxBus = c.createGain();
    bus.gain.value = 0; sfxBus.gain.value = .9;
    aL.fftSize = aR.fftSize = 512;
    bus.connect(comp); sfxBus.connect(comp); comp.connect(c.destination); comp.connect(split);
    split.connect(aL, 0); split.connect(aR, 1);
    var nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0), seed = 11;
    for (var i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = seed / 1073741823.5 - 1; }
    A = { c: c, bus: bus, sfx: sfxBus, nb: nb, aL: aL, aR: aR, buf: new Uint8Array(512) };
    return true;
  }
  function out(when, dur, vol, pan) {
    var g = A.c.createGain(), p = A.c.createStereoPanner();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(.0001, when + dur);
    p.pan.value = pan || 0;
    g.connect(p); p.connect(route || A.bus);
    return g;
  }
  function tone(f, when, dur, vol, type, pan, fEnd) {
    var o = A.c.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, when);
    if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, when + dur * .5);
    o.connect(out(when, dur, vol, pan));
    o.start(when); o.stop(when + dur + .02);
  }
  function noise(when, dur, vol, from, to, pan) {
    var s = A.c.createBufferSource(), fl = A.c.createBiquadFilter();
    s.buffer = A.nb; s.loop = true;
    fl.type = 'bandpass'; fl.Q.value = 1.1;
    fl.frequency.setValueAtTime(from, when);
    fl.frequency.exponentialRampToValueAtTime(to, when + dur);
    s.connect(fl); fl.connect(out(when, dur, vol, pan));
    s.start(when, seededStart(when)); s.stop(when + dur + .02);
  }
  function seededStart(w) { return (w * 7.13) % .9; }
  var ROOTS = [55, 43.65, 65.41, 49];
  function pad(root, when, dur, vol) {
    [2, 2.4, 3, 4].forEach(function (m, i) {
      var o = A.c.createOscillator(), fl = A.c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = root * m; o.detune.value = i % 2 ? 7 : -7;
      fl.type = 'lowpass'; fl.frequency.value = 900;
      o.connect(fl); fl.connect(out(when, dur, vol, i % 2 ? .35 : -.35));
      o.start(when); o.stop(when + dur + .02);
    });
  }
  function playStep(s, w) {
    var sec = s / 8, root = ROOTS[Math.floor(sec / 2) % 4];
    if (sec < 1) { if (s === 0) tone(1000, w, .95, .07); return; }
    if (sec < 4) { if (s % 8 === 0) tone(1000, w, .1, .14); return; }
    if (s === 32) { tone(90, w, 1.1, .75, 'sine', 0, 32); noise(w, .7, .32, 3000, 300); }
    CUTS.forEach(function (c) {
      if (s === c * 8 - 2) noise(w, .3, .2, 500, 7000);
      if (s === c * 8) { tone(70, w, .4, .5, 'sine', 0, 36); noise(w, .22, .16, 5000, 900); }
    });
    if (s % 16 === 0 && sec < 56) pad(root, w, 2.05, .028);
    if (sec >= 56) { if (s === 448) pad(55, w, 2, .04); return; }
    if (sec >= 50) { if (s % 8 === 0) tone(root, w, .7, .22, 'triangle'); return; }
    if (s % 4 === 0) tone(120, w, .16, .62, 'sine', 0, 44);
    if (s % 4 === 2) noise(w, .05, .13, 8000, 9000, .25);
    if (s % 8 === 4 && sec >= 17) noise(w, .13, .24, 1900, 1400, -.15);
    if ([0, 3, 6, 8, 11, 14].indexOf(s % 16) >= 0) tone(root, w, .17, .26, 'triangle');
  }
  // Interface sound effects, synthesised like the score. They share the Sound switch.
  var lastSfx = {};
  function sfx(name) {
    if (!soundOn || !A) return;
    var now = performance.now(), gap = name === 'scrub' ? 28 : name === 'tick' ? 60 : 0;
    if (lastSfx[name] && now - lastSfx[name] < gap) return;
    lastSfx[name] = now;
    var w = A.c.currentTime;
    route = A.sfx;
    try {
      if (name === 'tick') { tone(1800, w, .025, .05, 'square'); }
      else if (name === 'click') { noise(w, .035, .12, 2500, 900); tone(170, w, .06, .18, 'sine', 0, 90); }
      else if (name === 'transport') { tone(95, w, .09, .5, 'sine', 0, 45); noise(w, .05, .22, 1800, 500); noise(w + .07, .03, .12, 3000, 1200); }
      else if (name === 'scrub') { tone(520 + Math.random() * 180, w, .018, .07, 'square'); }
      else if (name === 'whoosh') { noise(w, .26, .16, 350, 5000, -.2); noise(w + .02, .24, .1, 500, 6000, .2); }
      else if (name === 'flip') { noise(w, .14, .1, 600, 3200); tone(900, w + .08, .06, .05, 'triangle', 0, 1400); }
      else if (name === 'shutter') { noise(w, .025, .25, 4000, 1500); noise(w + .045, .03, .2, 2500, 800); tone(130, w + .04, .05, .2, 'sine', 0, 70); }
      else if (name === 'chime') { tone(880, w, .22, .12, 'sine'); tone(1320, w + .07, .3, .1, 'sine'); }
      else if (name === 'power') { tone(220, w, .18, .14, 'triangle', 0, 440); tone(440, w + .12, .3, .12, 'sine', 0, 880); }
    } catch (e) {}
    route = null;
  }
  function setBus() {
    if (!A) return;
    A.bus.gain.setTargetAtTime(soundOn && rate === 1 ? 1 : 0, A.c.currentTime, .012);
  }
  function setSound(on) {
    if (on && !A && !initAudio()) return;
    soundOn = on;
    if (on) { A.c.resume(); lastStep = -1; }
    $('bSound').textContent = on ? 'Sound on' : 'Sound off';
    if (on) sfx('power');
    $('bSound').setAttribute('aria-pressed', on);
    setBus();
  }
  function audioTick() {
    if (!A) return;
    var peak = function (an) {
      an.getByteTimeDomainData(A.buf);
      var m = 0;
      for (var i = 0; i < A.buf.length; i += 4) m = Math.max(m, Math.abs(A.buf[i] - 128));
      return m / 128;
    };
    $('mL').style.transform = 'scaleX(' + peak(A.aL) + ')';
    $('mR').style.transform = 'scaleX(' + peak(A.aR) + ')';
    if (!soundOn || rate !== 1) return;
    var s = Math.ceil(t * 8 - 1e-6);
    if (s !== lastStep && s / 8 - t < .06 && s < D * 8) {
      lastStep = s;
      playStep(s, A.c.currentTime + Math.max(0, s / 8 - t));
    }
  }

  function setIcon() {
    $('playIcon').setAttribute('d', rate ? 'M3 2h4v12H3zM9 2h4v12H9z' : 'M4 2v12l10-6z');
    $('bPlay').setAttribute('aria-label', rate ? 'Pause' : 'Play');
    $('rate').textContent = (rate && rate !== 1) ? rate + 'x' : '';
    $('rec').hidden = !rate;
    syncBk();
    if (!!rate !== wasPlaying) sfx('transport');
    wasPlaying = !!rate;
    setBus();
  }
  function play(r) { if (t >= D - 1 / FPS && (r || 1) > 0) t = 0; rate = r || 1; setIcon(); }
  function pause() { rate = 0; setIcon(); }
  function seek(v) {
    var before = Math.floor(t * FPS);
    t = Math.max(0, Math.min(D - 1 / FPS, v));
    if (Math.floor(t * FPS) !== before) sfx('scrub');
    render();
  }

  function tick(now) {
    if (rate) {
      t += Math.min(now - last, 100) / 1000 * rate;
      if (t >= D - 1 / FPS) { t = D - 1 / FPS; pause(); }
      if (t <= 0) { t = 0; pause(); }
      render();
    }
    audioTick();
    last = now;
    requestAnimationFrame(tick);
  }

  function cutTimes() { return SCENES.map(function (s) { return s.s; }).concat([D - 1 / FPS]); }
  function nextCut() { var n = cutTimes().filter(function (c) { return c > t + .01; })[0]; if (n != null) seek(n); }
  function prevCut() { var a = cutTimes().filter(function (c) { return c < t - .01; }); seek(a.length ? a[a.length - 1] : 0); }

  $('bPlay').onclick = function () { rate ? pause() : play(1); };
  $('bPrev').onclick = function () { pause(); prevCut(); };
  $('bNext').onclick = function () { pause(); nextCut(); };
  $('bBack').onclick = function () { pause(); seek(t - 1 / FPS); };
  $('bFwd').onclick = function () { pause(); seek(t + 1 / FPS); };
  $('bSafe').onclick = function () { var on = $('guides').classList.toggle('on'); this.setAttribute('aria-pressed', on); };
  function toggleFull() {
    var w = $('fs');
    sfx('whoosh');
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (w.requestFullscreen) w.requestFullscreen().catch(function () {});
  }
  $('bFull').onclick = toggleFull;
  function userSound(on) { setSound(on); try { localStorage.setItem('sound', on ? 'on' : 'off'); } catch (e) {} }
  $('bSound').onclick = function () { userSound(!soundOn); };
  // Browsers only allow audio after a tap or click, so sound starts on the first one unless the visitor switched it off before
  var soundPref = null; try { soundPref = localStorage.getItem('sound'); } catch (e) {}
  if (soundPref !== 'off') {
    var armSound = function (e) {
      ['pointerdown', 'keydown'].forEach(function (n) { removeEventListener(n, armSound, true); });
      if (e.target && e.target.closest && e.target.closest('#bSound')) return;
      if (!soundOn) setSound(true);
    };
    ['pointerdown', 'keydown'].forEach(function (n) { addEventListener(n, armSound, true); });
  }
  $('bSkip').onclick = function () { seek(4); if (!rate) play(1); };
  $('frame').addEventListener('click', function () { rate ? pause() : play(1); });

  // Scrub
  var lanes = $('lanes'), drag = false;
  function fromX(x) { var r = lanes.getBoundingClientRect(); seek((x - r.left) / r.width * D); }
  lanes.addEventListener('pointerdown', function (e) { drag = true; pause(); fromX(e.clientX); try { lanes.setPointerCapture(e.pointerId); } catch (err) {} });
  lanes.addEventListener('pointermove', function (e) { if (drag) fromX(e.clientX); });
  ['pointerup', 'pointercancel'].forEach(function (n) { lanes.addEventListener(n, function () { drag = false; }); });
  var tip = document.createElement('div');
  tip.className = 'tip';
  lanes.appendChild(tip);
  lanes.addEventListener('pointermove', function (e) {
    var r = lanes.getBoundingClientRect(), x = e.clientX - r.left;
    tip.style.left = x + 'px';
    tip.textContent = tc(Math.max(0, Math.min(D - 1 / FPS, x / r.width * D)));
    tip.style.display = 'block';
  });
  lanes.addEventListener('pointerleave', function () { tip.style.display = 'none'; });

  // Editor shortcuts
  document.addEventListener('keydown', function (e) {
    if (introOn) return;
    if (!$('lb').hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') stepLb(-1);
      else if (e.key === 'ArrowRight') stepLb(1);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || !inView) return;
    var k = e.key, onBtn = e.target.closest && e.target.closest('button, a');
    if (k === ' ' && onBtn) return;
    if (k === ' ' || k === 'k' || k === 'K') { e.preventDefault(); rate ? pause() : play(1); }
    else if (k === 'l' || k === 'L') { rate > 0 ? play(Math.min(8, rate * 2)) : play(1); }
    else if (k === 'j' || k === 'J') { rate < 0 ? play(Math.max(-8, rate * 2)) : play(-1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); pause(); seek(t - (e.shiftKey ? 1 : 1 / FPS)); }
    else if (k === 'ArrowRight') { e.preventDefault(); pause(); seek(t + (e.shiftKey ? 1 : 1 / FPS)); }
    else if (k === 'ArrowUp') { e.preventDefault(); pause(); prevCut(); }
    else if (k === 'ArrowDown') { e.preventDefault(); pause(); nextCut(); }
    else if (k === 'Home') { e.preventDefault(); pause(); seek(0); }
    else if (k === 'End') { e.preventDefault(); pause(); seek(D); }
    else if (k === 'g' || k === 'G') nextGrade();
    else if (k === 'm' || k === 'M') userSound(!soundOn);
    else if (k === 'f' || k === 'F') toggleFull();
  });

  // Hover ticks, click sounds and the card flip whoosh
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.tbtn, .tlink, .ib, .grade, .jump, .copy, .bitem, .proj, .tile, .clip');
    if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    sfx(el.classList.contains('bitem') ? 'flip' : 'tick');
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('button, a');
    if (el && el.id !== 'bPlay' && el.id !== 'bSound' && !el.classList.contains('grade') && el.id !== 'bFull') sfx('click');
  });
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-copy]');
    if (c) {
      var done = function (m) { c.textContent = m; setTimeout(function () { c.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(c.dataset.copy).then(function () { done('Copied'); sfx('chime'); }, function () { done('Select it'); });
      else done('Select it');
    }
    var j = e.target.closest('[data-seek]');
    if (j) { window.scrollTo(0, 0); seek(+j.dataset.seek); play(1); }
  });

  // Fit display lines to an exact share of the frame width
  function fit() {
    var w = $('frame').clientWidth;
    if (!w) return;
    document.querySelectorAll('[data-fit]').forEach(function (el) {
      el.style.fontSize = '';
      var fs = parseFloat(getComputedStyle(el).fontSize);
      var size = fs * (w * +el.dataset.fit / 100) / el.offsetWidth;
      el.style.fontSize = (size / w * 100) + 'cqw';
    });
  }

  // A hosted or local copy can link the PDF; inside a sandboxed viewer the link would do nothing
  var framed = true;
  try { framed = window.top !== window.self; } catch (e) {}
  document.querySelectorAll('[data-pdf]').forEach(function (a) { a.hidden = framed; });

  // Stop the film once it scrolls away, and leave page scrolling keys alone
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    inView = es[0].isIntersecting;
    if (!inView && rate) pause();
  }).observe($('frame'));

  // Portfolio content from js/content.js
  var site = window.SITE || {};
  document.querySelectorAll('[data-reel]').forEach(function (a) { if (site.reel) { a.href = site.reel; a.hidden = false; } });
  [['GitHub', site.github], ['LinkedIn', site.linkedin], ['Instagram', site.instagram]].forEach(function (s) {
    if (!s[1]) return;
    var a = document.createElement('a');
    a.href = s[1]; a.textContent = s[0]; a.target = '_blank'; a.rel = 'noopener';
    $('socials').appendChild(a);
  });
  function make(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  }
  (window.PROJECTS || []).forEach(function (p) {
    var card = make('article', 'proj'), th = make('div', 'thumb'), b = make('div', 'proj-b'), col = C[p.colour] || C.grey;
    th.style.setProperty('--c', 'var(' + col[0] + ')');
    th.style.setProperty('--t', col[1]);
    th.textContent = p.thumb || p.title;
    if (p.image) { var img = make('img'); img.src = p.image; img.alt = p.title; img.loading = 'lazy'; th.appendChild(img); }
    if (p.video) {
      var vid = make('video');
      vid.src = p.video; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = 'metadata';
      if (p.image) vid.poster = p.image;
      th.appendChild(vid);
      card.addEventListener('mouseenter', function () { var q = vid.play(); if (q) q.catch(function () {}); });
      card.addEventListener('mouseleave', function () { vid.pause(); });
    }
    var burn = make('span', 'thumb-tc', 'CLIP ' + ('00' + ($('projects').children.length + 1)).slice(-3));
    burn.setAttribute('aria-hidden', 'true');
    th.appendChild(burn);
    card.classList.add('rv', 'tilt');
    card.dataset.tilt = 3;
    b.appendChild(make('h3', '', p.title));
    b.appendChild(make('p', 'proj-m', [p.type, p.year].filter(Boolean).join(' / ')));
    b.appendChild(make('p', 'proj-d', p.text));
    if (p.tags && p.tags.length) {
      var ul = make('ul', 'proj-t');
      p.tags.forEach(function (x) { ul.appendChild(make('li', '', x)); });
      b.appendChild(ul);
    }
    if (p.clips && p.clips.length) {
      card.classList.add('has-clips');
      th.hidden = true;
      var row = make('div', 'clips');
      p.clips.forEach(function (c, ci) {
        var tile = make('button', 'clipt');
        tile.type = 'button';
        tile.setAttribute('aria-label', 'Play ' + c.label);
        var pic = make('img'); pic.src = c.poster || ''; pic.alt = ''; pic.loading = 'lazy'; tile.appendChild(pic);
        var pv = make('video'); pv.src = c.file; pv.muted = true; pv.loop = true; pv.playsInline = true; pv.preload = 'none'; tile.appendChild(pv);
        tile.appendChild(make('span', 'pl'));
        var cl = make('span', 'cl'); cl.appendChild(make('span', '', c.label)); cl.appendChild(make('span', '', c.dur || '')); tile.appendChild(cl);
        tile.addEventListener('mouseenter', function () { tile.classList.add('playing'); var q = pv.play(); if (q) q.catch(function () {}); });
        tile.addEventListener('mouseleave', function () { tile.classList.remove('playing'); pv.pause(); pv.currentTime = 0; });
        tile.addEventListener('click', function () { openLb(p.clips, ci, p.title); });
        row.appendChild(tile);
      });
      b.appendChild(row);
    }
    if (p.linkKey && site[p.linkKey]) { p.link = site[p.linkKey]; }
    var acts = make('div', 'acts');
    if (p.seek != null) {
      var btn = make('button', 'tbtn', p.linkText || 'Watch');
      btn.dataset.seek = p.seek;
      acts.appendChild(btn);
    } else if (p.link) {
      var a = make('a', 'tbtn', p.linkText || 'Open project');
      a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
      acts.appendChild(a);
    }
    (p.links || []).forEach(function (l) {
      var la = make('a', 'tbtn', l.label);
      la.href = l.url; la.target = '_blank'; la.rel = 'noopener';
      acts.appendChild(la);
    });
    if (acts.children.length) b.appendChild(acts);
    card.appendChild(th); card.appendChild(b);
    $('projects').appendChild(card);
  });

  // Custom cursor and 3D tilt, on mouse devices only
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches && !calm;
  if (fine) {
    document.body.classList.add('cur');
    var dot = make('div', 'cur-dot'), ring = make('div', 'cur-ring');
    document.body.appendChild(dot); document.body.appendChild(ring);
    var cx = -100, cy = -100, rx = -100, ry = -100;
    function curLabel(el) {
      if (!el || !el.closest) return '';
      if (el.closest('#frame')) return rate ? 'Pause' : 'Play';
      if (el.closest('#lanes')) return 'Scrub';
      if (el.closest('[data-seek], .bitem')) return 'Watch';
      return '';
    }
    addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      var l = curLabel(e.target), act = e.target.closest && e.target.closest('a, button, .grade');
      ring.textContent = l;
      ring.classList.toggle('lbl', !!l);
      ring.classList.toggle('on', !l && !!act);
      dot.style.opacity = l ? 0 : 1;
    }, { passive: true });
    addEventListener('pointerdown', function () { ring.classList.add('down'); });
    addEventListener('pointerup', function () { ring.classList.remove('down'); });
    document.documentElement.addEventListener('pointerleave', function () { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.documentElement.addEventListener('pointerenter', function () { dot.style.opacity = 1; ring.style.opacity = 1; });
    (function curTick() {
      rx += (cx - rx) * .2; ry += (cy - ry) * .2;
      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(curTick);
    })();
    document.querySelectorAll('.tilt').forEach(function (el) {
      var max = +(el.dataset.tilt || 6);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add('live');
        el.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * max * 2).toFixed(2) + 'deg) rotateY(' + ((px - .5) * max * 2).toFixed(2) + 'deg)';
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('live'); el.style.transform = ''; });
    });
  }

  // Cursor spotlight on the dark suite
  var spotPending = false, mx = 0, my = 0;
  addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!spotPending) { spotPending = true; requestAnimationFrame(function () { spotPending = false; $('spot').style.setProperty('--mx', mx + 'px'); $('spot').style.setProperty('--my', my + 'px'); }); }
  }, { passive: true });

  // Full-screen reel player
  var LB = { list: [], i: 0, title: '' }, lbEl = $('lb'), lbv = $('lbv');
  function showLb() {
    var c = LB.list[LB.i];
    lbv.src = c.file; lbv.poster = c.poster || '';
    $('lbt').textContent = c.label;
    $('lbn').textContent = LB.title + ' / ' + (LB.i + 1) + ' of ' + LB.list.length;
    var q = lbv.play(); if (q) q.catch(function () {});
  }
  function openLb(list, i, title) {
    LB.list = list; LB.i = i; LB.title = title || '';
    pause(); sfx('whoosh');
    lbEl.hidden = false; document.body.classList.add('lb-open');
    showLb(); $('lbx').focus();
  }
  function closeLb() {
    lbv.pause(); lbv.removeAttribute('src'); lbv.load();
    lbEl.hidden = true; document.body.classList.remove('lb-open');
  }
  function stepLb(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; showLb(); }
  $('lbx').onclick = closeLb;
  $('lbp').onclick = function () { stepLb(-1); };
  $('lbnx').onclick = function () { stepLb(1); };
  lbEl.addEventListener('click', function (e) { if (e.target === lbEl || e.target.classList.contains('lb-body')) closeLb(); });

  // Media bin
  var BIN = window.SKILLS || [];
  function fillBin(cat) {
    $('bin').textContent = '';
    BIN.filter(function (s) { return cat === 'All' || s.cat === cat; }).forEach(function (s) {
      var b = make('button', 'bitem');
      b.type = 'button';
      b.dataset.seek = { Web: 33.5, Design: 36.5, Video: 39.5 }[s.cat];
      b.style.setProperty('--c', 'var(' + { Web: '--cyan', Design: '--yellow', Video: '--magenta' }[s.cat] + ')');
      b.style.setProperty('--t', { Web: '#000', Design: '#000', Video: '#fff' }[s.cat]);
      var inr = make('div', 'bin-in'), front = make('div', 'bf'), back = make('div', 'bb');
      front.appendChild(make('b', '', s.name));
      front.appendChild(make('span', '', s.cat));
      back.appendChild(make('b', '', s.where || s.cat));
      back.appendChild(make('span', '', 'Watch in the film'));
      inr.appendChild(front); inr.appendChild(back);
      b.appendChild(inr);
      $('bin').appendChild(b);
    });
    $('binF').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.textContent === cat); });
  }
  ['All', 'Web', 'Design', 'Video'].forEach(function (cat) {
    var b = make('button', 'tbtn', cat);
    b.type = 'button';
    b.onclick = function () { fillBin(cat); };
    $('binF').appendChild(b);
  });
  fillBin('All');

  // The page as a sequence: progress strip, current section in the menu, gentle reveal
  var seqPending = false;
  function drawSeq() {
    seqPending = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    $('seq').style.transform = 'scaleX(' + (max > 0 ? clamp(scrollY / max) : 0) + ')';
  }
  addEventListener('scroll', function () { if (!seqPending) { seqPending = true; requestAnimationFrame(drawSeq); } }, { passive: true });
  drawSeq();
  if ('IntersectionObserver' in window) {
    var links = document.querySelectorAll('.tlink');
    var sectionWatch = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['do', 'work', 'skills-bin', 'resume'].forEach(function (id) { sectionWatch.observe($(id)); });
    if (!calm) {
      document.documentElement.classList.add('rv-on');
      var reveal = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -6% 0px' });
      document.querySelectorAll('.rv').forEach(function (el) { reveal.observe(el); });
    }
  }

  // Opening sequence: runs once per visit, skipped for reduced motion, click or Space to skip
  var introOn = false;
  function runIntro() {
    var el = $('intro');
    if (!el) return Promise.resolve();
    if (calm) { el.parentNode.removeChild(el); return Promise.resolve(); }
    introOn = true;
    return new Promise(function (res) {
      var nameEl = $('introName'), i = 0, done = false, timers = [];
      try { $('slDate').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }); } catch (e) {}
      var cyc = setInterval(function () { i = (i + 1) % LANGS.length; setLang(nameEl, i); }, 115);
      function finish() {
        if (done) return;
        done = true; introOn = false;
        clearInterval(cyc); timers.forEach(clearTimeout);
        el.classList.add('out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
        document.removeEventListener('keydown', onKey);
        res();
      }
      function onKey(e) { if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); finish(); } }
      timers.push(setTimeout(function () { clearInterval(cyc); setLang(nameEl, LANGS.length - 1); el.classList.add('slate'); }, 1600));
      timers.push(setTimeout(function () { el.classList.add('clapped'); sfx('transport'); }, 2300));
      timers.push(setTimeout(finish, 2900));
      setTimeout(finish, 4500); // failsafe: the site always appears
      el.addEventListener('click', finish);
      document.addEventListener('keydown', onKey);
    });
  }

  var startAt = null;
  var hash = location.hash.slice(1);
  SCENES.forEach(function (s) { if (s.id === hash) startAt = s.e - .4; });

  function boot() {
    fit();
    drawn = -1;
    if (startAt != null) { seek(startAt); return; }
    if (calm) { seek(9); return; }
    render();
    play(1);
  }
  render();
  last = performance.now();
  requestAnimationFrame(tick);
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  var fontsOrTimeout = Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2500); })]);
  Promise.all([fontsOrTimeout, runIntro()]).then(boot, boot);
})();
