# PARADOX//ACCESS — THE GAME

A funny mobile-first browser game where the website itself becomes the playground.

## Game flow

Start Game → Mission Select → Level 01 Login Lock → Level 02 Don't Press → Level 03 Cat Memory → Win.

The login is intentionally easy to enter for normal players, while repeated wrong attempts trigger meme reactions and reveal that the interface has hidden interactions.

## Access modes

The public login is the player experience. After repeated failed attempts, a recovery option provides the demo credentials so the experience remains frustrating without becoming unfair.

### Player demo access

Access ID: `GUEST`  
Passcode: `PARADOX`

### Creator / admin access

Admin access is deliberately separated from the player login.

Use the small **ADMIN** control in the footer:

- Admin ID: `ARCHITECT`
- Admin key: private creator key
- Successful authentication opens the **Architect Console**

The plaintext admin key is not stored in the repository; only a SHA-256 hash is used by the demo frontend.

> Important: this is puzzle/game authentication, not production security. For real admin protection, verification should happen on a backend/API using a secret environment variable.

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
