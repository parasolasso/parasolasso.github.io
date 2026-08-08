/**
 * TicTacToes Mini — métronome web autonome
 * Copyright (C) 2026 Suhtra
 *
 * Ce programme est un logiciel libre : vous pouvez le redistribuer et/ou
 * le modifier selon les termes de la GNU General Public License telle
 * que publiée par la Free Software Foundation, soit la version 3 de
 * la licence, soit (à votre choix) toute version ultérieure.
 *
 * Ce programme est distribué dans l'espoir qu'il sera utile, mais
 * SANS AUCUNE GARANTIE ; sans même la garantie implicite de
 * COMMERCIALISABILITÉ ou d'ADÉQUATION À UN USAGE PARTICULIER.
 * Consultez la GNU General Public License pour plus de détails.
 *
 * Vous devriez avoir reçu une copie de la GNU General Public License
 * avec ce programme. Si ce n'est pas le cas, consultez
 * <https://www.gnu.org/licenses/>.
 *
 * Ce fichier utilise les bibliothèques tierces suivantes, distribuées
 * sous licence BSD 3-Clause (voir NOTICE.md à la racine du dépôt) :
 * @soundworks/core, @ircam/sc-components, @ircam/sc-loader,
 * @ircam/sc-scheduling, lit.
 */

import { html, render } from 'lit';

import { AudioBufferLoader } from '@ircam/sc-loader';
import { Scheduler } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-transport.js';
import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-tap-tempo.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-select.js';

async function main($container) {
  // --- SERVICE WORKER (fonctionnement hors-ligne) ---
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker enregistré');
    } catch (err) {
      console.warn('Échec de l\'enregistrement du Service Worker :', err.message);
    }
  }

  // --- PWA setup ---
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/manifest.webmanifest';
  document.head.appendChild(manifestLink);

  const appleCapable = document.createElement('meta');
  appleCapable.name = 'apple-mobile-web-app-capable';
  appleCapable.content = 'yes';
  document.head.appendChild(appleCapable);

  const appleStatusBar = document.createElement('meta');
  appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
  appleStatusBar.content = 'black-translucent';
  document.head.appendChild(appleStatusBar);

  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/icons/icon-192.png';
  document.head.appendChild(appleTouchIcon);
  // --- fin PWA setup ---

  // --- LOCK SCREEN ---
  let locked = false;
  let pressTimer = null;
  const LONG_PRESS_DURATION = 600; // ms

  function startPress() {
    pressTimer = setTimeout(() => {
      locked = !locked;
      pressTimer = null;
      renderApp();
    }, LONG_PRESS_DURATION);
  }

  function cancelPress() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  // --- WAKE LOCK ---
  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake lock impossible :', err.message);
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && running) {
      requestWakeLock();
    }
  });

  function checkAudioContextHealth() {
  if (audioContext.state !== 'running') {
    running = false;
    if (scheduler.has(processor)) {
      scheduler.remove(processor);
    }
    renderResumeScreen();
  }
}

function renderResumeScreen() {
  render(html`
    <div class="start-layout">
      <button
        class="start-button"
        @click=${async () => {
          await unlockAudioContext();
          renderApp();
        }}
      >
        Reprendre le métronome
      </button>
    </div>
  `, $container);
}

  // --- ETAT LOCAL (remplace les shared states soundworks) ---
  let BPM = 120;
  let bar = 4;
  let division = 4;
  let running = false;
  let subdivision = 'Noire';
  let mute = false;
  let volume = 1;

  const audioContext = new AudioContext();

  const volumeNode = audioContext.createGain();
  volumeNode.gain.value = volume;
  volumeNode.connect(audioContext.destination);

  console.log('Loading audio assets...');
  const audioFiles = [
    'assets/hh.wav',
    'assets/rimshot.wav',
  ];

  const loader = new AudioBufferLoader(audioContext);
  const audioBuffers = await loader.load(audioFiles);

  function triggerSoundFile(time, sndidx) {
    const outputLatency = 0;
    const compensatedTime = time - outputLatency;

    // ne jouer que les steps dans le futur
    if (compensatedTime < audioContext.currentTime) {
      console.warn('missed step : ', audioContext.currentTime - compensatedTime, 's');
      return;
    }

    const src = audioContext.createBufferSource();
    src.buffer = audioBuffers[sndidx];
    const bufferLength = src.buffer.duration;
    src.connect(volumeNode);
    src.start(compensatedTime);
    src.stop(compensatedTime + bufferLength);
  }

  // --- SCHEDULER (temps local) ---
  const scheduler = new Scheduler(() => audioContext.currentTime, {
    lookahead: 0.2,
  });

  let currentStep;
  let subfactor = 1;

  function subdivisionToFactor(label) {
    switch (label) {
      case 'Noire': return 1;
      case 'Croche': return 2;
      case 'Triolet': return 3;
      case 'Double-Croche': return 4;
      default: return 1;
    }
  }
  
  function isMobileDevice() {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

  // tentatie de mimer platform ini
  async function unlockAudioContext() {
    await audioContext.resume();

      if ('audioSession' in navigator) {
        navigator.audioSession.type = 'playback';
      }
    
    if (isMobileDevice()) {
      const g = audioContext.createGain();
      g.connect(audioContext.destination);
      g.gain.value = 0.000000001; // -180dB, inaudible

      const o = audioContext.createOscillator();
      o.connect(g);
      o.frequency.value = 20;
      o.start(0);

      if (!/Android/i.test(navigator.userAgent)) {
        o.stop(audioContext.currentTime + 0.01);
      }

      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        if (audioContext.sampleRate < 40000) {
          window.location.reload();
        }
      }
    } else {
      console.log('notAmobile');
    }
  }

  function processor(currentTime, processorTime) {
    subfactor = subdivisionToFactor(subdivision);

    const stepTimeSec = 60 / (BPM * (division / 4) * subfactor);

    if (currentStep === 0) {
      triggerSoundFile(processorTime, 0);
    } else {
      triggerSoundFile(processorTime, 1);
    }

    currentStep = (currentStep + 1) % (bar * subfactor);

    return currentTime + stepTimeSec;
  }

  async function startMetronome() {
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    currentStep = 0;
    running = true;
    const startTime = audioContext.currentTime + 0.1;
    scheduler.add(processor, startTime);
    requestWakeLock();
    renderApp();
  }

  function stopMetronome() {
    running = false;
    if (scheduler.has(processor)) {
      scheduler.remove(processor);
    }
    releaseWakeLock();
    renderApp();
  }

  // --- ECRAN DE DEMARRAGE (remplace le platform init) ---
  function renderStartScreen() {
    render(html`
      <div class="start-layout">
        <button
          class="start-button"
          @click=${async () => {
            await unlockAudioContext();
            renderApp();
          }}
        >
          Démarrer le métronome
        </button>
      </div>
    `, $container);
  }

  // -- Main App --
  function renderApp() {
    render(html`
      <div class="player-layout">
        <header>
          <h1>TicTacToes Mini</h1>
            <sc-icon
            style="margin-right: 12px; border-color: transparent; background-color: transparent;"
            type="question"
            @release=${() => window.open('https://soundworks.dev/', '_blank')}
          ></sc-icon>
        </header>

        <section>
          <div class="box">
            <sc-icon class="box-logo" type="waveform" disabled="true"></sc-icon>
            <div class="separator"></div>

            <div class="box-row">
              <sc-transport
                style="width: auto; height: 60px;"
                .buttons=${['play', 'stop']}
                value=${running ? 'play' : 'stop'}
                @change=${async e => {
                  if (e.detail.value === 'stop') {
                    stopMetronome();
                  } else {
                    await startMetronome();
                  }
                }}
              ></sc-transport>

              <sc-tap-tempo
                style="width: 100px; height: 60px; font-size: 20px"
                @change=${e => {
                  BPM = Math.floor(e.detail.value);
                  renderApp();
                }}
              >TAP</sc-tap-tempo>
            </div>

            <div class="box-row" style="justify-content: center; gap: 12px;">
              <div>
                <span id="bigBPM">${BPM}</span>
                <span>BPM</span>
              </div>
            </div>

            <sc-slider
              min="50"
              max="240"
              step="1"
              value=${BPM}
              number-box="true"
              @change=${e => {
                BPM = e.detail.value;
                renderApp();
              }}
            ></sc-slider>

            <div class="box-row">
              <div class="time-signature-group">
                <sc-number
                  min="1"
                  max="32"
                  step="1"
                  value=${bar}
                  @change=${e => {
                    bar = e.detail.value;
                    renderApp();
                  }}
                ></sc-number>
                <a style="font-size: 26px">/</a>
                <sc-number
                  min="1"
                  max="16"
                  step="1"
                  value=${division}
                  @change=${e => {
                    division = e.detail.value;
                    renderApp();
                  }}
                ></sc-number>
              </div>
            </div>

            <div class="box-row">
              <span style="font-size: small;">Subdivision:</span>
              <sc-select
                options="${JSON.stringify(['Noire', 'Croche', 'Triolet', 'Double-Croche'])}"
                value=${subdivision}
                @change=${e => {
                  subdivision = e.detail.value;
                  renderApp();
                }}
              ></sc-select>
            </div>

            <div class="box-row" style="justify-content: start; gap: 12px">
              <sc-icon
                id="mute-icon"
                .type=${mute === false ? 'speaker' : 'muted'}
                @release=${e => {
                  mute = !mute;
                  if (mute) {
                    volumeNode.gain.value = 0;
                  } else if (volume === 0) {
                    volume = 0.8;
                    volumeNode.gain.value = 0.8;
                  } else {
                    volumeNode.gain.value = volume;
                  }
                  renderApp();
                }}
              ></sc-icon>

              <sc-slider
                min="0"
                max="1"
                step="0.01"
                number-box="true"
                value=${volumeNode.gain.value}
                @input=${e => {
                  const value = e.detail.value;
                  volume = value;
                  volumeNode.gain.value = value;
                  mute = value === 0;
                  renderApp();
                }}
              ></sc-slider>
            </div>
          </div>

          <div class="box-row" style="align-items: right">
            <p style="font-size=6px;margin-left: auto;">Appui long !</p>
            <sc-icon
              class="lock-button"
              value=${locked}
              @pointerdown=${startPress}
              @pointerup=${cancelPress}
              @pointerleave=${cancelPress}
              @pointercancel=${cancelPress}
            >
              ${locked
                ? html`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M6.616 21q-.672 0-1.144-.472T5 19.385v-8.77q0-.67.472-1.143Q5.944 9 6.616 9H8V7q0-1.671 1.165-2.835Q10.329 3 12 3t2.836 1.165T16 7v2h1.385q.67 0 1.143.472q.472.472.472 1.144v8.769q0 .67-.472 1.143q-.472.472-1.143.472zm0-1h10.769q.269 0 .442-.173t.173-.442v-8.77q0-.269-.173-.442T17.385 10H6.615q-.269 0-.442.173T6 10.616v8.769q0 .269.173.442t.443.173m6.45-3.934q.434-.433.434-1.066t-.434-1.066T12 13.5t-1.066.434Q10.5 14.367 10.5 15t.434 1.066q.433.434 1.066.434t1.066-.434M9 9h6V7q0-1.25-.875-2.125T12 4t-2.125.875T9 7zM6 20V10z" />
                  </svg>`
                : html`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path d="M6.616 9H15V7q0-1.25-.875-2.125T12 4t-2.125.875T9 7H8q0-1.671 1.165-2.835Q10.329 3 12 3t2.836 1.165T16 7v2h1.385q.67 0 1.143.472q.472.472.472 1.144v8.769q0 .67-.472 1.143q-.472.472-1.143.472H6.615q-.67 0-1.143-.472Q5 20.056 5 19.385v-8.77q0-.67.472-1.143Q5.944 9 6.616 9m0 11h10.769q.269 0 .442-.173t.173-.442v-8.77q0-.269-.173-.442T17.385 10H6.615q-.269 0-.442.173T6 10.616v8.769q0 .269.173.442t.443.173m6.45-3.934q.434-.433.434-1.066t-.434-1.066T12 13.5t-1.066.434Q10.5 14.367 10.5 15t.434 1.066q.433.434 1.066.434t1.066-.434M6 20V10z" />
                  </svg>`}
            </sc-icon>
          </div>
        </section>

        ${locked ? html`<div class="lock-overlay"></div>` : ''}
      </div>
    `, $container);
  }

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      checkAudioContextHealth();
    }
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAudioContextHealth();
    }
  });

  renderStartScreen();
}

main(document.getElementById('tictactoes-app'));
