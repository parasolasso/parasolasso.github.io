async function loadActus() {
  const index = await fetch('data/index.json').then(r => r.json());
  const actus = await Promise.all(
    index.map(file => fetch('data/' + file).then(r => r.json()))
  );
  return actus;
}

// Page d'accueil : résumé de la dernière actu
async function renderHomeSummary() {
  const actus = await loadActus();
  const latest = actus[0];
  const container = document.getElementById('news-summary');
  if (!latest || !container) return;
  container.innerHTML = `
    <p class="article-date">${latest.date}</p>
    <h3>${latest.title}</h3>
    <p>${latest.summary}</p>
  `;
}

// Page actu.html : liste complète des articles
async function renderActuList() {
  const actus = await loadActus();
  const container = document.getElementById('actu-list');
  if (!container) return;
  container.innerHTML = actus.map(a => `
    <article class="article">
      <img src="${a.image}" alt="${a.title}">
      <p class="article-date">${a.date}</p>
      <h2>${a.title}</h2>
      ${a.text.map(p => `<p>${p}</p>`).join('')}
    </article>
  `).join('');
}

// Page agenda.html : uniquement les actus marquées comme événement
async function renderAgenda() {
  const actus = await loadActus();
  const events = actus.filter(a => a.isEvent);
  const container = document.getElementById('agenda-list');
  if (!container) return;
  container.innerHTML = events.map((e, i) => `
    <div class="event-item">
      <div class="event-date">
        <span class="day">${e.day}</span>
        <span class="month">${e.month}</span>
      </div>
      <div class="event-info">
        <h3>${e.title}</h3>
        <p>${e.venue}</p>
      </div>
      <a class="event-link" href="${e.ticketLink}" target="_blank" rel="noopener" data-goatcounter-click="agenda-event-${i}" data-goatcounter-title="Billets - ${e.title}">
        Billets
      </a>
    </div>
  `).join('');
}