# PVP NFT UI Proof of Concept

## Running locally

```
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Directory structure

```
├── nodemon.json
├── package.json
├── src
│   ├── client
│   │   ├── Application.ts
│   │   ├── index.html
│   │   └── index.ts
│   └── server
│       ├── index.ts
│       └── rooms
│           ├── ArenaRoom.ts
│           ├── Entity.ts
│           └── State.ts
├── tsconfig-client.json
├── tsconfig.json
└── webpack.config.js
```

- All frontend dependencies should be included as `devDependencies` on `package.json`.
- All backend dependencies should be included as `dependencies` on `package.json`.

## License

MIT
