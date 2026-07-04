(function () {
  'use strict';

  const MAP_URL = 'https://yandex.by/maps/?text=Event+Hall+Olshevski+Гродно';
  const WEDDING = {
    title: 'Свадьба Роберта и Веры',
    date: '20260906T133000Z',
    endDate: '20260906T200000Z',
    location: 'Event Hall Olshevski',
    description: 'Wedding Show — самое важное шоу в нашей жизни!'
  };

  const intro = document.getElementById('intro');
  const invitation = document.getElementById('invitation');
  const video = document.getElementById('intro-video');
  const playBtn = document.getElementById('play-btn');
  const skipBtn = document.getElementById('skip-btn');
  const progressWrap = document.getElementById('intro-progress');
  const progressBar = progressWrap.querySelector('.intro__progress-bar');
  const replayBtn = document.getElementById('replay-btn');
  const calendarBtn = document.getElementById('calendar-btn');
  const guestNameEl = document.getElementById('guest-name');
  const mapLink = document.getElementById('map-link');

  mapLink.href = MAP_URL;

  function getGuestName() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('guest') || params.get('name') || params.get('g');
    if (name) {
      guestNameEl.textContent = decodeURIComponent(name);
    }
  }

  function generateQR() {
    const canvas = document.getElementById('qr-code');
    if (typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvas, MAP_URL, {
        width: 120,
        margin: 1,
        color: { dark: '#1a1a1a', light: '#fafafa' }
      });
    }
  }

  function showInvitation() {
    intro.classList.add('intro--hidden');
    intro.setAttribute('aria-hidden', 'true');
    invitation.classList.add('invitation--visible');
    invitation.setAttribute('aria-hidden', 'false');
    video.pause();
    sessionStorage.setItem('wedding-intro-seen', '1');
  }

  function showIntro() {
    intro.classList.remove('intro--hidden', 'intro--playing');
    intro.setAttribute('aria-hidden', 'false');
    invitation.classList.remove('invitation--visible');
    invitation.setAttribute('aria-hidden', 'true');
    video.currentTime = 0;
    playBtn.parentElement.style.opacity = '';
    playBtn.parentElement.style.pointerEvents = '';
    skipBtn.hidden = true;
    progressWrap.hidden = true;
    progressBar.style.width = '0%';
  }

  function playVideo() {
    intro.classList.add('intro--playing');
    skipBtn.hidden = false;
    progressWrap.hidden = false;

    video.muted = false;
    video.play().catch(function () {
      video.muted = true;
      video.play();
    });
  }

  playBtn.addEventListener('click', playVideo);

  skipBtn.addEventListener('click', showInvitation);

  video.addEventListener('timeupdate', function () {
    if (video.duration) {
      progressBar.style.width = (video.currentTime / video.duration * 100) + '%';
    }
  });

  video.addEventListener('ended', showInvitation);

  replayBtn.addEventListener('click', function () {
    showIntro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  calendarBtn.addEventListener('click', function () {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Show//RU',
      'BEGIN:VEVENT',
      'DTSTART:' + WEDDING.date,
      'DTEND:' + WEDDING.endDate,
      'SUMMARY:' + WEDDING.title,
      'DESCRIPTION:' + WEDDING.description,
      'LOCATION:' + WEDDING.location,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-show.ics';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !intro.classList.contains('intro--hidden')) {
      showInvitation();
    }
  });

  getGuestName();
  generateQR();

  if (sessionStorage.getItem('wedding-intro-seen')) {
    showInvitation();
  }
})();
