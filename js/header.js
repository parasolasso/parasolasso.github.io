
renderHomeSummary();

    fetch('header.html')
      .then(res => res.text())
      .then(html => {
        document.getElementById('site-header').innerHTML = html;
        if (window.goatcounter) window.goatcounter.bind_events();
      });