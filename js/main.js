(function () {
  'use strict';

  var WEDDING_DATE = new Date('2026-09-06T15:30:00+03:00');

  var intro = document.getElementById('intro');
  var page = document.getElementById('page');
  var introVideo = document.getElementById('intro-video');
  var heroVideo = document.getElementById('hero-video');
  var playBtn = document.getElementById('play-btn');
  var skipBtn = document.getElementById('skip-btn');
  var progressWrap = document.getElementById('intro-progress');
  var progressBar = progressWrap.querySelector('.intro__progress-bar');
  var replayBtn = document.getElementById('replay-btn');

  function showPage() {
    intro.classList.add('intro--hidden');
    page.classList.add('page--visible');
    introVideo.pause();
    heroVideo.play().catch(function () {});
    sessionStorage.setItem('wedding-intro-seen', '1');
    initReveals();
  }

  function showIntro() {
    intro.classList.remove('intro--hidden', 'intro--playing');
    page.classList.remove('page--visible');
    introVideo.currentTime = 0;
    skipBtn.hidden = true;
    progressWrap.hidden = true;
    progressBar.style.width = '0%';
    heroVideo.pause();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function playVideo() {
    intro.classList.add('intro--playing');
    skipBtn.hidden = false;
    progressWrap.hidden = false;

    introVideo.muted = false;
    introVideo.play().catch(function () {
      introVideo.muted = true;
      introVideo.play();
    });
  }

  playBtn.addEventListener('click', playVideo);
  skipBtn.addEventListener('click', showPage);
  replayBtn.addEventListener('click', showIntro);

  introVideo.addEventListener('timeupdate', function () {
    if (introVideo.duration) {
      progressBar.style.width = (introVideo.currentTime / introVideo.duration * 100) + '%';
    }
  });

  introVideo.addEventListener('ended', showPage);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !intro.classList.contains('intro--hidden')) {
      showPage();
    }
  });

  function updateCountdown() {
    var now = Date.now();
    var diff = WEDDING_DATE.getTime() - now;

    var els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs')
    };

    if (diff <= 0) {
      els.days.textContent = '0';
      els.hours.textContent = '0';
      els.mins.textContent = '0';
      els.secs.textContent = '0';
      return;
    }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    var values = { days: d, hours: h, mins: m, secs: s };
    Object.keys(values).forEach(function (key) {
      var val = String(values[key]).padStart(2, '0');
      if (els[key].textContent !== val) {
        els[key].textContent = val;
        els[key].classList.remove('tick');
        void els[key].offsetWidth;
        els[key].classList.add('tick');
      }
    });
  }

  var revealObserver;

  function initReveals() {
    if (revealObserver) return;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (sessionStorage.getItem('wedding-intro-seen')) {
    showPage();
  }
})();
