function contactMail() {
  var p = ["rf.dmlt", "tcatnoc"];
  return p[1].split("").reverse().join("") + "@" + p[0].split("").reverse().join("");
}

fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-footer').innerHTML = html;
    renderFooterLinks();
    if (window.goatcounter) window.goatcounter.bind_events();
  });

async function renderFooterLinks() {
  const container = document.getElementById('footer-links');
  if (!container) return;

  let items;
  try {
    const res = await fetch('data/index_footer.json');
    if (!res.ok) return;
    items = await res.json();
  } catch {
    return;
  }

  container.innerHTML = items.map((item, i) => {
    const link = item.link === '#contact-mail' ? 'mailto:' + contactMail() : item.link;
    const isMailto = link.startsWith('mailto:');
    return `
      <a class="footer-icon" href="${link}" ${isMailto ? '' : 'target="_blank" rel="noopener"'}
         data-goatcounter-click="footer-${i}" data-goatcounter-title="${item.alt}">
        <img src="${item.logo}" alt="${item.alt}">
      </a>
    `;
  }).join('');

  if (window.goatcounter) window.goatcounter.bind_events();
}