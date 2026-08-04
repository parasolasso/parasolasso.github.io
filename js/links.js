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

  container.innerHTML = buttons.map((b, i) => `
    <a class="btn" href="${b.link}" target="_blank" rel="noopener"
       data-goatcounter-click="${b.label.toLowerCase().replace(/\s+/g, '-')}" data-goatcounter-title="${b.label}">
      <img src="${b.logo}" alt="">
      ${b.label}
    </a>
  `).join('');

  if (window.goatcounter) window.goatcounter.bind_events();
}

// Titre du moment (page d'accueil), rendu depuis data/index_links.json
async function renderHotTitle() {
  const container = document.getElementById('hot-title');
  if (!container) return;
 
  let data;
  try {
    const res = await fetch('data/index_links.json');
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }
 
  if (!data.hotTitle) return;
  container.textContent = data.hotTitle;
}
