# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
# backend
This app is created with FASTAPI
Include routes for api auth and profile yet
Commands to Run are:
1. python -m venv .venv
2. activate python environment
3. pip install -r requirements.txt
4. uvicorn app.main:app --reload
5. It will rin on 0.0.0.0 --host: 8000

deactivate && source venv/Scripts/activate && cd backend

'docker swarm join-token manager'
docker swarm join --token SWMTKN-1-4r76nas4y4lialz0w7oneupyit5329t8fxp9spthmpi59n33ty-edho7x0abwx8m63a63qx4z4fc 31.220.22.221:2377