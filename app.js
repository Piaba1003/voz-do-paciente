'use strict';
(() => {
  const messages = {
    comfortable: 'Estou sem dor. Pode continuar.',
    discomfort: 'Estou sentindo dor, mas pode continuar.',
    stop: 'Estou com dor. Pare, por favor!',
    test: 'Olá. Esta é a voz do paciente. Você consegue me ouvir bem?'
  };
  const panel = document.getElementById('feedback');
  const title = document.getElementById('status-title');
  const detail = document.getElementById('status-detail');
  const stateLabel = document.getElementById('state-label');
  const screenNotice = document.getElementById('screen-notice');
  const buttons = [...document.querySelectorAll('[data-message]')];
  const volume = document.getElementById('volume');
  const speed = document.getElementById('speed');
  const volumeValue = document.getElementById('volume-value');
  const synth = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
  let voices = [];
  let sequence = 0;
  let activeAudio = null;
  let currentUtterance = null;
  let watchdog;
  const clips = Object.fromEntries(Object.keys(messages).map(key => {
    const audio = new Audio(new URL(`audio/${key}.mp3`, document.baseURI).href);
    audio.preload = 'auto';
    return [key, audio];
  }));
  try {
    const saved = JSON.parse(localStorage.getItem('patient-voice-sound') || 'null');
    if (saved && Number.isFinite(saved.volume)) volume.value = Math.max(30, Math.min(100, saved.volume));
    if (saved && ['1', '0.9'].includes(saved.speed)) speed.value = saved.speed;
  } catch { /* Os controles funcionam mesmo sem armazenamento local. */ }
  function saveSettings() {
    volumeValue.textContent = `${volume.value}%`;
    if (activeAudio) {
      activeAudio.volume = Number(volume.value) / 100;
      activeAudio.playbackRate = Number(speed.value);
    }
    try { localStorage.setItem('patient-voice-sound', JSON.stringify({volume: Number(volume.value), speed: speed.value})); } catch { /* opcional */ }
  }
  saveSettings();
  volume.addEventListener('input', saveSettings);
  speed.addEventListener('change', saveSettings);
  function status(heading, description, state, tone = '') {
    title.textContent = heading;
    detail.textContent = description;
    panel.dataset.state = state;
    panel.dataset.tone = tone;
    const labels = {idle: 'Pronto para ouvir', waiting: 'Preparando a voz', speaking: 'Falando agora', done: 'Mensagem concluída', error: 'Não foi possível falar'};
    stateLabel.textContent = labels[state] || labels.idle;
  }
  function refreshVoices() { voices = synth.getVoices(); }
  if (synth) {
    refreshVoices();
    synth.addEventListener('voiceschanged', refreshVoices);
  }
  function stopPlayback() {
    clearTimeout(watchdog);
    if (activeAudio) {
      activeAudio.onplaying = activeAudio.onended = activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    if (synth) synth.cancel();
    currentUtterance = null;
  }
  function fail(key, id) {
    if (id !== sequence) return;
    ++sequence;
    stopPlayback();
    status(messages[key], 'Não foi possível reproduzir o som. Mostre esta mensagem ao dentista e teste o áudio novamente.', 'error', key);
  }
  function fallback(key, id) {
    if (id !== sequence) return;
    stopPlayback();
    if (!synth) { fail(key, id); return; }
    const utterance = new SpeechSynthesisUtterance(messages[key]);
    currentUtterance = utterance;
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92 * Number(speed.value);
    utterance.pitch = 1;
    utterance.volume = Number(volume.value) / 100;
    const portuguese = voices.filter(voice => /^pt[-_]/i.test(voice.lang));
    const voice = portuguese.find(v => /francisca|thalita|luciana|natural|neural|google/i.test(v.name))
      || portuguese.find(v => !v.localService) || portuguese[0];
    if (voice) utterance.voice = voice;
    status(messages[key], 'Tentando a voz alternativa do aparelho…', 'waiting', key);
    utterance.onstart = () => {
      if (id !== sequence) return;
      clearTimeout(watchdog);
      status(messages[key], 'Falando com a voz alternativa do aparelho…', 'speaking', key);
    };
    utterance.onend = () => {
      if (id !== sequence) return;
      clearTimeout(watchdog);
      currentUtterance = null;
      status(messages[key], 'Mensagem falada com a voz alternativa do aparelho.', 'done', key);
    };
    utterance.onerror = () => fail(key, id);
    watchdog = setTimeout(() => fail(key, id), 8000);
    try { synth.speak(utterance); } catch { fail(key, id); }
  }
  function speak(key) {
    const id = ++sequence;
    stopPlayback();
    buttons.forEach(button => {
      const selected = button.dataset.message === key;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const audio = clips[key];
    audio.currentTime = 0;
    activeAudio = audio;
    audio.volume = Number(volume.value) / 100;
    audio.playbackRate = Number(speed.value);
    let fallbackStarted = false;
    const tryFallback = () => {
      if (id !== sequence || fallbackStarted) return;
      fallbackStarted = true;
      fallback(key, id);
    };
    audio.onplaying = () => {
      if (id !== sequence) return;
      clearTimeout(watchdog);
      status(messages[key], 'Falando por você…', 'speaking', key);
    };
    audio.onended = () => {
      if (id !== sequence) return;
      clearTimeout(watchdog);
      activeAudio = null;
      status(messages[key], 'Mensagem falada. Toque em qualquer opção para falar de novo.', 'done', key);
    };
    audio.onerror = tryFallback;
    status(messages[key], 'Preparando sua mensagem…', 'waiting', key);
    watchdog = setTimeout(tryFallback, 6000);
    try {
      const playing = audio.play();
      if (playing && typeof playing.catch === 'function') playing.catch(tryFallback);
    } catch { tryFallback(); }
  }
  buttons.forEach(button => button.addEventListener('click', () => speak(button.dataset.message)));
  document.getElementById('test-sound').addEventListener('click', () => speak('test'));
  const doctorSettings = document.getElementById('doctor-settings');
  function closeSettings(returnFocus = false) {
    doctorSettings.open = false;
    if (returnFocus) doctorSettings.querySelector('summary').focus();
  }
  document.getElementById('settings-close').addEventListener('click', () => closeSettings(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && doctorSettings.open) {
      event.preventDefault();
      closeSettings(true);
    }
  });
  document.addEventListener('click', event => {
    if (doctorSettings.open && !doctorSettings.contains(event.target)) closeSettings();
  });
  const fullscreen = document.getElementById('fullscreen');
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  else fullscreen.addEventListener('click', async () => {
    try {
      screenNotice.textContent = '';
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      screenNotice.textContent = 'Tela cheia indisponível. Você pode continuar usando os três botões nesta tela.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
    fullscreen.querySelector('span').textContent = label;
    fullscreen.setAttribute('aria-label', label);
  });
  window.addEventListener('pagehide', () => { ++sequence; stopPlayback(); });
})();
