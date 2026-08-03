fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-header').innerHTML = html;
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