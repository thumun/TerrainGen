# TerrainGen

_Final project for CIS5650_

## Motivation

This is a single-page web application using WebGPU to create a real-time node-based procedural terrain generation tool.

### Feature checklist

- [ ] 🔌 Node-based description system for procedural terrain
- [ ] 🏭 Just-in-time WebGPU shader code generation
- [ ] 🏔️ Real-time terrain rendering
  - [ ] Adjustable tesselation and terrain size
  - [ ] Varied terrain type rendering (grass, rock, snow, etc)
- [ ] 🔎 Real-time in-editor node previews
- [ ] 🌲 Mesh instancing across terrain
  - [ ] Mesh import for instancing
- [ ] 💾 Export to glTF or similar format

#### Node types:

- General-purpose
  - [ ] Basic math (add, sub, mult, div, min, max)
  - [ ] Masking/graphics util (mix, lt, gt)
- Terrain source
  - [ ] Perlin noise
  - [ ] Custom image texture
- Terrain output
  - [ ] Height
  - [ ] Terrain type
- Scattering source
  - [ ] Terrain height
  - [ ] Voronoi scattering
- Scattering geometry
  - [ ] Built-in objects: trees, rocks, bushes
  - [ ] Primitive geometry: sphere, cube, plane, line
  - [ ] Custom OBJ or glTF imports
  - [ ] Vegetation → like Unreal’s PCG

## Development

To run this application:

```bash
npm install
npm run start
```

### Building For Production

To build this application for production:

```bash
npm run build
```

The resulting static content will be in the `dist` folder.

We have created a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically deploy static content to GitHub Pages.

### Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

### Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
npm run typecheck  # just runs tsc
npm run lint
npm run lint:fix  # automatically fix issues
npm run format
npm run format:check  # don't write to any files, just report issues
```

## Third-party libraries

- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [React](https://react.dev/) for DOM manipulation
- [TanStack Router](https://tanstack.com/router). The initial setup is a code based router. Which means that the routes are defined in code (in the `./src/main.tsx` file). If you like you can also use a file based routing setup by following the [File Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing) guide.
- [React Flow](https://reactflow.dev/) for node editor functionality
- [loaders.gl](https://loaders.gl/) for reading/writing of external files
