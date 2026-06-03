import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init().catch((error) => {
        console.error('Failed to start playground:', error);
        document.body.innerHTML = `
            <div style="padding:24px;font-family:Arial,sans-serif;color:#f3f4f6;background:#111827;min-height:100vh;">
                <h1 style="margin:0 0 12px;">Playground failed to start</h1>
                <pre style="white-space:pre-wrap;opacity:.85;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
            </div>
        `;
    });
});
