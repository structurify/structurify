<p align="center">
  <a href="https://github.com/structurify/structurify" target="blank">
    <img src="./structurify.svg" width="300" alt="Nest Logo" />
  </a>
</p>

<div align="center">
  <strong>Developer-centric headless API platform on a modern stack</strong>
</div>

<div align="center">
  A headless, GraphQL devtool platform delivering ultra-fast, new platform starter.<br/>Start your car, pet or environmental dev api quickly.
</div>

<br>

<div align="center">
  Join community: <br>
   <a href="https://github.com/structurify/structurify/discussions">GitHub Discussions</a>
  <span> | </span>
  <a href="https://discord.gg/XXY97KXdG8">Discord</a>
</div>

<br>

<div align="center">
  <a href="https://discord.gg/XXY97KXdG8" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Requirements](#requirements)
- [Run Locally](#run-locally)
- [ALPHA Roadmap](#alpha-roadmap)
- [Contributing](#contributing)
- [License](#license)
    - [Crafted with ❤️ by Marcin Mrotek](#crafted-with-️-by-marcin-mrotek)

## Description

Structurify is an open-source devtool platform that serves a starter of your future developer api platform. It's designed to serve any of your ideas for future devtools that would alow us as a community to quickly build awesome stuff.

## Requirements

- Docker
- Node 18

## Run Locally

1. Install dependencies
```bash
yarn
```

2. Set up environment variables
```bash
cp .env.example .env
```

3. Setup docker containers
```bash
# linux/mac
yarn docker:linux

# windows wsl
yarn docker:windows
```

4. Run db migrations
```bash
yarn db:generate
yarn db:migrate:dev
```

5. Run dev
```bash
yarn start:dev
```

## ALPHA Roadmap

- [x] Data Lake - Bronze tier
- [x] Search Engine
- [x] Mailing
- [ ] i18n
  - [ ] Errors
  - [x] Mailing
- [x] Open Telemetry
- [x] Event Emitter
- [x] Permissions
- [ ] GraphQL API
  - [x] auth
  - [x] organization
  - [x] project
  - [x] invite
  - [x] member
  - [ ] webhooks
  - [ ] api keys
- [ ] Tests
  - [ ] Unit

## Contributing

I would love your contributions to create best tool for a platform starter

## License

Disclaimer: Everything you see here is open and free to use as long as you comply with the [license](https://github.com/structurify/structurify/blob/main/LICENSE). I promise to do my best to fix bugs and improve the code.

#### Crafted with ❤️ by Marcin Mrotek

kontakt@marcinmrotek.pl
