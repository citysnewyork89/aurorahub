import React from 'react';

export default function Footer({ onTerms }) {
  return (
    <footer>
      <div className="footer-links">
        <button onClick={onTerms}>Purchase Terms</button>
        <a href="https://discord.gg/8dUzp5WGd9" target="_blank" rel="noreferrer">Discord Server</a>
      </div>
      <p className="copyright">© 2026 aurorahub. All rights reserved.</p>
    </footer>
  );
}
