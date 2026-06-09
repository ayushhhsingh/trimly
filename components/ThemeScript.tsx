"use client";

import Script from "next/script";

const THEME_INIT = `
  (function() {
    try {
      var stored = localStorage.getItem('videohub-theme');
      var theme = (stored === 'nord') ? 'nord' : 'black';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === 'black' ? 'dark' : 'light';
    } catch (e) {}
  })();
`;

export default function ThemeScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  );
}
