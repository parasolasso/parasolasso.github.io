fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-footer').innerHTML = html;
    if (window.goatcounter) window.goatcounter.bind_events();
  });