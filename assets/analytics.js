/**
 * eastsea.monster — Unified Analytics Loader
 * GA4 + Microsoft Clarity
 * 
 * To activate:
 *   1. Replace GA_ID with your GA4 Measurement ID (G-XXXXXXXXXX)
 *   2. Replace CLARITY_ID with your Clarity Project ID
 */
(function () {
  'use strict';

  // ── GA4 ──────────────────────────────────────────────
  var GA_ID = 'G-XXXXXXXXXX';
  if (GA_ID !== 'G-XXXXXXXXXX') {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gs);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // ── Microsoft Clarity ────────────────────────────────
  var CLARITY_ID = 'vmms1upl1l';
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
})();
