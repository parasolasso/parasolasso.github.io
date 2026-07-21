async function loadActus() {
  const index = await fetch('data/index.json').then(r => r.json());
  const actus = await Promise.all(
    index.map(file => fetch('data/' + file).then(r => r.json()))
  );
  return actus;
}

// Page d'accueil : carrousel des 5 prochaines actualités
async function renderHomeSummary() {
  const actus = await loadActus();
  const items = actus.slice(0, 5);
  const container = document.getElementById('news-summary');
  const indicator = document.getElementById('news-indicator');
  if (!items.length || !container) return;

  let current = 0;

  function renderItem(i) {
    const a = items[i];
    container.style.opacity = 0;
    setTimeout(() => {
      container.innerHTML = `
        <p class="article-date">${a.date}</p>
        <h3>${a.title}</h3>
        <p>${a.summary}</p>
        <div class="buttons">
          <a class="btn btn-small" href="actu.html#actu-${a.date}" data-goatcounter-click="voir-plus-actu-${i}" data-goatcounter-title="Voir plus - ${a.title}">Voir plus</a>
        </div>
      `;
      container.style.opacity = 1;
      if (window.goatcounter) window.goatcounter.bind_events();
    }, 2000);
    if (indicator) indicator.textContent = `${i + 1} / ${items.length}`;
  }

  renderItem(current);

  if (items.length > 1) {
    setInterval(() => {
      current = (current + 1) % items.length;
      renderItem(current);
    }, 10000);
  }
}

// Page actu.html : liste complète des articles
async function renderActuList() {
  const actus = await loadActus();
  const container = document.getElementById('actu-list');
  if (!container) return;
  container.innerHTML = actus.map(a => `
    <article class="article" id="actu-${a.date}">
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
      <a class="event-link" href="actu.html#actu-${e.date}" data-goatcounter-click="agenda-info-${i}" data-goatcounter-title="En savoir plus - ${e.title}">
        En savoir plus
      </a>
      ${!e.ticketLink || e.ticketLink === '#' ? '' : `
      <a class="event-link" href="${e.ticketLink}" target="_blank" rel="noopener" data-goatcounter-click="agenda-event-${i}" data-goatcounter-title="Billets - ${e.title}">
        Billets
      </a>`}
    </div>
  `).join('');
}