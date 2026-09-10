// Titre du moment + lecteur SoundCloud (page d'accueil), rendus depuis data/index_links.json
async function renderHotBlock() {
  const container = document.getElementById('hot-block');
  if (!container) return;

  let data;
  try {
    const res = await fetch('data/index_links.json');
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }

  container.innerHTML = `
    ${data.player_link ? `
    <div class="player-embed">
      <button class="player-placeholder" id="player-placeholder" data-goatcounter-click="player-load" data-goatcounter-title="Charger le lecteur SoundCloud">
        <img src="https://api.iconify.design/mdi/play.svg?color=%23f5f5f5" alt="">
        ${data.hotTitle}
      </button>
      <p class="player-notice">Charge le lecteur SoundCloud (cookies tiers)</p>
    </div>` : ''}
  `;

  const placeholder = document.getElementById('player-placeholder');
  if (placeholder) {
    placeholder.addEventListener('click', () => {
      const wrapper = placeholder.parentElement;
      wrapper.innerHTML = `
        <iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" 
        src=${data.player_embeded}></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;">
        <a href="https://soundcloud.com/toutlemondedeteste" title="TOUT LE MONDE DÉTESTE." target="_blank" style="color: #cccccc; text-decoration: none;">TOUT LE MONDE DÉTESTE.</a> · 
        <a href=${data.player_link} 
        title=${data.hotTitle} target="_blank" style="color: #cccccc; text-decoration: none;">${data.hotTitle}</a></div>
      `;
      if (window.goatcounter) window.goatcounter.bind_events();
    });
  }

  if (window.goatcounter) window.goatcounter.bind_events();
}

// Boutons "Écouter en streaming" (page d'accueil), rendus depuis data/index_links.json
async function renderListenButtons() {
  const container = document.getElementById('listen-buttons');
  if (!container) return;

  let data;
  try {
    const res = await fetch('data/index_links.json');
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }

  const buttons = data.listenButtons || [];
  if (!buttons.length) return;

  container.innerHTML = buttons.map((b, i) => `
    <a class="btn" href="${b.link}" target="_blank" rel="noopener"
       data-goatcounter-click="${b.label.toLowerCase().replace(/\s+/g, '-')}" data-goatcounter-title="${b.label}">
      <img src="${b.logo}" alt="">
      ${b.label}
    </a>
  `).join('');

  if (window.goatcounter) window.goatcounter.bind_events();
}

// Boutons "Réseaux sociaux" (page d'accueil), rendus depuis data/index_links.json
async function renderSocialButtons() {
  const container = document.getElementById('social-buttons');
  if (!container) return;

  let data;
  try {
    const res = await fetch('data/index_links.json');
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }

  const buttons = data.socialsButtons || [];
  if (!buttons.length) return;

  container.innerHTML = buttons.map((b) => {
  const isYoutube = b.label.toLowerCase() === 'youtube';
  const clickAttr = isYoutube
    ? `onclick="openYoutubeFromWebview('${b.link}'); return false;"`
    : '';
  return `
    <a class="btn" href="${b.link}" target="_blank" rel="noopener" ${clickAttr}
       data-goatcounter-click="${b.label.toLowerCase().replace(/\s+/g, '-')}" data-goatcounter-title="${b.label}">
      <img src="${b.logo}" alt="">
      ${b.label}
    </a>`;
}).join('');

  if (window.goatcounter) window.goatcounter.bind_events();
}