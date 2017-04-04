# Faces

See all players by their avatar image. Names are hard.


## Development

### If you have `idm` and `game` running locally

Your `.env` file should look something like this

```sh
PORT=3000
IDM_BASE_URL=http://idm.learnersguild.dev
GAME_BASE_URL=http://game.learnersguild.dev
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMg3eJ…IDAQAB\n-----END PUBLIC KEY-----"
```
#### If you don't want to or cannot setup `idm` and `game`

Your `.env` file should look like this

```sh
PORT=3000
USE_FIXTURES=1
```

### Start the app

```sh
npm run start:dev
```
