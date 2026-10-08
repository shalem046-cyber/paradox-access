# PARADOX//ACCESS — THE GAME

A funny mobile-first browser game where the website itself becomes the playground.

## Game flow

Start Game → Mission Select → Level 01 Login Lock → Level 02 Don't Press → Level 03 Cat Memory → Win.

The login is intentionally easy to enter for normal players, while repeated wrong attempts trigger meme reactions and reveal that the interface has hidden interactions.

## Access modes

The public login is intentionally frustrating and functions as a game mechanic.

### Creator / admin mode

Sign in directly on the same terminal with the creator identity `ARCHITECT` and the private access key configured as a SHA-256 hash in `script.js`.

The plaintext key is intentionally not stored in the repository. Keep the actual key private and rotate the hash when changing it.

Successful creator authentication opens the Architect Console, where the puzzle can be rearmed or the creator session can be ended.

> Important: this is puzzle-grade authentication, not production security. A public frontend can always be inspected or modified by a determined player. For real admin protection, move verification to a server/API with a secret environment variable.
## Features

- Responsive browser game UI
- Score / XP / lives HUD
- Three playable mini-levels
- Dog/cat reaction memes
- Original SVG meme artwork
- Optional UI sounds using Web Audio
- Local score persistence
- No backend required
- GitHub Pages compatible
