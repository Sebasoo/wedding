(function () {
  'use strict';

  var MAP_URL = 'https://yandex.ru/maps/org/event_hall_olshevski/219124670247?si=4tu68ethwba6ja7tab4hdrnug0';
  var WEDDING_DATE = new Date('2026-09-06T15:00:00+03:00');
  var VIDEO_TRIM = 5;
  var CAPTION_LINES = 5;

  var CALENDAR = {
    title: 'Свадьба Роберта и Веры — Wedding Show',
    start: '20260906T120000Z',
    end: '20260906T160000Z',
    location: 'Event Hall Olshevski',
    details: 'Wedding Show — самое важное шоу в нашей жизни! Подтвердите присутствие до 6 августа. ' + MAP_URL
  };

  var intro = document.getElementById('intro');
  var page = document.getElementById('page');
  var introVideo = document.getElementById('intro-video');
  var heroVideo = document.getElementById('hero-video');
  var playBtn = document.getElementById('play-btn');
  var skipBtn = document.getElementById('skip-btn');
  var progressWrap = document.getElementById('intro-progress');
  var progressBar = progressWrap.querySelector('.intro__progress-bar');
  var replayBtn = document.getElementById('replay-btn');
  var calendarLink = document.getElementById('calendar-link');
  var introCaptions = document.getElementById('intro-captions');
  var captionLines = introCaptions.querySelectorAll('.intro__caption-line');

  function getEffectiveDuration() {
    if (!introVideo.duration || isNaN(introVideo.duration)) return null;
    return Math.max(introVideo.duration - VIDEO_TRIM, 1);
  }

  function buildGoogleCalendarUrl() {
    var params = new URLSearchParams({
      action: 'TEMPLATE',
      text: CALENDAR.title,
      dates: CALENDAR.start + '/' + CALENDAR.end,
      details: CALENDAR.details,
      location: CALENDAR.location
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function openCalendar(e) {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      e.preventDefault();
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding Show//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'DTSTART:' + CALENDAR.start,
        'DTEND:' + CALENDAR.end,
        'SUMMARY:' + CALENDAR.title,
        'DESCRIPTION:' + CALENDAR.details.replace(/\n/g, '\\n'),
        'LOCATION:' + CALENDAR.location,
        'URL:' + MAP_URL,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var link = document.createElement('a');
      link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      link.download = 'wedding-show.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (isAndroid) {
      e.preventDefault();
      var gParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: CALENDAR.title,
        dates: CALENDAR.start + '/' + CALENDAR.end,
        details: CALENDAR.details,
        location: CALENDAR.location
      });
      window.open('https://calendar.google.com/calendar/render?' + gParams.toString(), '_blank');
      return;
    }

    calendarLink.href = buildGoogleCalendarUrl();
  }

  calendarLink.href = buildGoogleCalendarUrl();
  calendarLink.addEventListener('click', openCalendar);

  function resetCaptions() {
    captionLines.forEach(function (line) {
      line.classList.remove('visible');
    });
    introCaptions.hidden = true;
  }

  function updateCaptions(currentTime) {
    var effective = getEffectiveDuration();
    if (!effective) return;

    var progress = currentTime / effective;
    captionLines.forEach(function (line, i) {
      if (progress >= i / CAPTION_LINES) {
        line.classList.add('visible');
      }
    });
  }

  function showPage() {
    intro.classList.add('intro--hidden');
    page.classList.add('page--visible');
    introVideo.pause();
    resetCaptions();
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
    resetCaptions();
    heroVideo.pause();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function playVideo() {
    intro.classList.add('intro--playing');
    skipBtn.hidden = false;
    progressWrap.hidden = false;
    introCaptions.hidden = false;
    captionLines.forEach(function (line) { line.classList.remove('visible'); });

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
    var effective = getEffectiveDuration();
    if (!effective) return;

    if (introVideo.currentTime >= effective) {
      showPage();
      return;
    }

    progressBar.style.width = (introVideo.currentTime / effective * 100) + '%';
    updateCaptions(introVideo.currentTime);
  });

  introVideo.addEventListener('ended', showPage);

  heroVideo.addEventListener('timeupdate', function () {
    var effective = getEffectiveDuration();
    if (effective && heroVideo.currentTime >= effective) {
      heroVideo.currentTime = 0;
    }
  });

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
