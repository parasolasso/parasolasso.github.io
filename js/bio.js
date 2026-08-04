// Page biographie : chargement et rendu depuis data/bio.json
async function loadBio() {
  const res = await fetch('data/bio.json');
  return res.json();
}

function ensureLightbox() {
  let overlay = document.getElementById('bio-lightbox');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'bio-lightbox';
  overlay.className = 'modal-overlay lightbox';
  overlay.innerHTML = `
    <img id="bio-lightbox-img" src="" alt="">
    <button class="modal-close" id="bio-lightbox-close">×</button>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'bio-lightbox-close') {
      overlay.classList.remove('open');
    }
  });
  document.body.appendChild(overlay);
  return overlay;
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
  let portraitIndex = 0;

  container.querySelectorAll('.bio-image').forEach(wrapper => {
    const img = wrapper.querySelector('img');

    const finalize = () => {
      const isPortrait = img.naturalHeight > img.naturalWidth;
      wrapper.classList.add(isPortrait ? 'bio-portrait' : 'bio-landscape');

      if (isPortrait) {
        const next = wrapper.nextElementSibling;
        if (next && next.classList.contains('bio-text')) {
          const row = document.createElement('div');
          row.className = 'bio-portrait-row' + (portraitIndex % 2 === 1 ? ' bio-row-reverse' : '');
          wrapper.parentNode.insertBefore(row, wrapper);
          row.appendChild(wrapper);
          row.appendChild(next);
          portraitIndex++;
        }
      }
    };

    if (img.complete && img.naturalWidth) {
      finalize();
    } else {
      img.addEventListener('load', finalize);
    }

  });
  container.querySelectorAll('.bio-image img').forEach(img => {
  img.addEventListener('click', () => {
    const overlay = ensureLightbox();
    const lightboxImg = document.getElementById('bio-lightbox-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    overlay.classList.add('open');
  });
});
}

