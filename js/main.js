(function () {
  'use strict';

  var MAP_URL = 'https://yandex.ru/maps/org/event_hall_olshevski/219124670247?si=4tu68ethwba6ja7tab4hdrnug0';
  var WEDDING_DATE = new Date('2026-09-06T15:00:00+03:00');

  var CALENDAR = {
    title: 'Свадьба Роберта и Веры — Wedding Show',
    start: '20260906T120000Z',
    end: '20260906T160000Z',
    location: 'Event Hall Olshevski',
    details: 'Wedding Show — самое яркое шоу в нашей жизни! Подтвердите присутствие до 6 августа. ' + MAP_URL
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
  var calendarBtn = document.getElementById('calendar-btn');

  function escapeICS(value) {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  function buildICS() {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Show//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:wedding-show-2026@robert-vera',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + CALENDAR.start,
      'DTEND:' + CALENDAR.end,
      'SUMMARY:' + escapeICS(CALENDAR.title),
      'DESCRIPTION:' + escapeICS(CALENDAR.details),
      'LOCATION:' + escapeICS(CALENDAR.location),
      'URL:' + MAP_URL,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function buildGoogleCalendarUrl() {
    var params = new URLSearchParams({
      action: 'TEMPLATE',
      text: CALENDAR.title,
      dates: CALENDAR.start + '/' + CALENDAR.end,
      details: CALENDAR.details,
      location: CALENDAR.location,
      ctz: 'Europe/Minsk'
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function downloadICS() {
    var blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-show.ics';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function openCalendar() {
    var ua = navigator.userAgent;
    var isIOS = /iPad|iPhone|iPod/.test(ua);
    var isAndroid = /Android/.test(ua);

    if (isIOS) {
      downloadICS();
      return;
    }

    if (isAndroid) {
      window.open(buildGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(buildGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
  }

  calendarBtn.addEventListener('click', openCalendar);

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
