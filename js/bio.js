// Page biographie : chargement et rendu depuis data/bio.json
async function loadBio() {
  const res = await fetch('data/bio.json');
  return res.json();
}

// Secours : mesure une image si ses dimensions manquent dans le JSON
function getImageSize(src) {
  return new Promise(resolve => {
    const probe = new Image();
    probe.onload = () => resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
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

function renderImage(block, size) {
  const isPortrait = size && size.height > size.width;
  const dims = size ? ` width="${size.width}" height="${size.height}"` : '';
  return `
    <div class="bio-image ${isPortrait ? 'bio-portrait' : 'bio-landscape'}">
      <img src="${block.src}" alt="${block.alt || ''}"${dims} decoding="async">
      ${block.caption ? `<p class="bio-caption">${block.caption}</p>` : ''}
    </div>`;
}

async function renderBio() {
  const container = document.getElementById('bio_content');
  if (!container) return;
  const sections = await loadBio();

  // 1. Dimensions : depuis le JSON, sinon mesurées (en parallèle)
  const imageBlocks = sections.flatMap(s => s.blocks.filter(b => b.type === 'image'));
  await Promise.all(imageBlocks.map(async block => {
    block._size = (block.width && block.height)
      ? { width: block.width, height: block.height }
      : await getImageSize(block.src);
  }));

  // 2. HTML final construit en une seule passe
  let portraitIndex = 0;
  container.innerHTML = sections.map(section => {
    const blocks = section.blocks;
    let html = '';

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (block.type === 'text') {
        html += `<p class="bio-text">${block.content}</p>`;
        continue;
      }

      if (block.type === 'image') {
        const size = block._size;
        const isPortrait = size && size.height > size.width;
        const next = blocks[i + 1];

        if (isPortrait && next && next.type === 'text') {
          const reverse = portraitIndex % 2 === 1 ? ' bio-row-reverse' : '';
          html += `
            <div class="bio-portrait-row${reverse}">
              ${renderImage(block, size)}
              <p class="bio-text">${next.content}</p>
            </div>`;
          portraitIndex++;
          i++; // le paragraphe suivant est déjà placé
        } else {
          html += renderImage(block, size);
        }
      }
    }

    return `
      <section class="bio-section">
        <h2 class="bio-title">${section.title}</h2>
        ${html}
      </section>`;
  }).join('');

  container.classList.add('ready');

  // 3. Lightbox : un seul écouteur pour toutes les images
  container.addEventListener('click', (e) => {
    const img = e.target.closest('.bio-image img');
    if (!img) return;
    const overlay = ensureLightbox();
    const lightboxImg = document.getElementById('bio-lightbox-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    overlay.classList.add('open');
  });
}