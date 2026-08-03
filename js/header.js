fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-header').innerHTML = html;
    renderMenu();
    renderBanner();
    if (window.goatcounter) window.goatcounter.bind_events();
  });

// Bandeau billetterie/réseaux : rempli depuis banner.json si présent
async function renderBanner() {
  const container = document.getElementById('banner-container');
  if (!container) return;

  let b;
  try {
    const res = await fetch('data/banner.json');
    if (!res.ok) return; // pas de fichier -> rien n'est affiché
    b = await res.json();
  } catch {
    return; // erreur réseau/parsing -> rien n'est affiché
  }

  container.innerHTML = `
    <div class="ticket-banner">
      <a class="ticket-btn" href="${b.link}" target="_blank" rel="noopener"
         data-goatcounter-click="banner-click" data-goatcounter-title="${b.label} - ${b.text}">
        <img src="${b.icon}" alt="${b.alt}">
        ${b.label}
      </a>
      <p class="ticket-text">${b.text}</p>
    </div>
  `;

  if (window.goatcounter) window.goatcounter.bind_events();
}

async function renderMenu() {
  const linksContainer = document.getElementById('menu-links');
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('menu-panel');
  if (!linksContainer || !toggle || !panel) return;

  let items;
  try {
    const res = await fetch('data/index_menu.json');
    if (!res.ok) return;
    items = await res.json();
  } catch {
    return;
  }

  linksContainer.innerHTML = items.map((item, i) => `
    <a class="menu-link" href="${item.link}"
       data-goatcounter-click="menu-${i}" data-goatcounter-title="Menu - ${item.title}">
      ${item.title}
    </a>
  `).join('');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('open')) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    panel.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
  });

  if (window.goatcounter) window.goatcounter.bind_events();
}