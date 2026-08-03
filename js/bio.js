// Page biographie : chargement et rendu depuis data/bio.json
async function loadBio() {
  const res = await fetch('data/bio.json');
  return res.json();
}

async function renderBio() {
  const sections = await loadBio();
  const container = document.getElementById('bio_content');
  if (!container) return;

  container.innerHTML = sections.map(section => `
    <section class="bio-section">
      <h2 class="bio-title">${section.title}</h2>
      ${section.blocks.map(block => {
        if (block.type === 'text') {
          return `<p class="bio-text">${block.content}</p>`;
        }
        if (block.type === 'image') {
          return `
            <div class="bio-image">
              <img src="${block.src}" alt="${block.alt || ''}">
              ${block.caption ? `<p class="bio-caption">${block.caption}</p>` : ''}
            </div>
          `;
        }
        return '';
      }).join('')}
    </section>
  `).join('');

  // Détection automatique de l'orientation de chaque image, une fois chargée.
  // Si l'image est en portrait, on la regroupe avec le paragraphe qui la suit
  // directement pour l'afficher à côté (la légende, elle, reste sous la photo).
  container.querySelectorAll('.bio-image').forEach(wrapper => {
    const img = wrapper.querySelector('img');

    const finalize = () => {
      const isPortrait = img.naturalHeight > img.naturalWidth;
      wrapper.classList.add(isPortrait ? 'bio-portrait' : 'bio-landscape');

      if (isPortrait) {
        const next = wrapper.nextElementSibling;
        if (next && next.classList.contains('bio-text')) {
          const row = document.createElement('div');
          row.className = 'bio-portrait-row';
          wrapper.parentNode.insertBefore(row, wrapper);
          row.appendChild(wrapper);
          row.appendChild(next);
        }
      }
    };

    if (img.complete && img.naturalWidth) {
      finalize();
    } else {
      img.addEventListener('load', finalize);
    }
  });
}