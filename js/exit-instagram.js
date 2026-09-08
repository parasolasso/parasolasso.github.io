function openYoutubeFromWebview(youtubeUrl) {
  const handle = youtubeUrl.match(/@([^/?]+)/)?.[1];
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const deepLink = isIOS
    ? `youtube://www.youtube.com/@${handle}`
    : `intent://www.youtube.com/@${handle}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent(youtubeUrl)};end`;

  window.location.href = deepLink;
  setTimeout(() => { window.location.href = youtubeUrl; }, 1500);
}