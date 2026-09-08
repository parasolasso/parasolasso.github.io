(function () {
  const ua = navigator.userAgent || '';
  if (!/Instagram/i.test(ua)) return;

  const current = window.location.href;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  const target = isIOS
    ? current.replace(/^https:\/\//, 'x-safari-https://')
    : `intent://${current.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;

  window.location.href = target;
})();