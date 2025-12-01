# TerrainGen

_Final project for CIS5650_

![Milestone 1 Demo](./docs/images/milestone_01_demo.webp)

[Link to website! ](https://thumun.github.io/TerrainGen/)

## Motivation

This is a single-page web application using WebGPU to create a real-time node-based procedural terrain generation tool.

### Milestones

1. [Milestone 1 Progress Slides](https://docs.google.com/presentation/d/1IfnNaKhCkMEOW8t8lHOAx6w-G378lC401EXVFlAbnQ0/edit?usp=sharing)
2. [Milestone 2 Progress Slides](https://docs.google.com/presentation/d/1EiJf1spHf-v6SMP9DFZE5cckQX3vl9SmCcZ-_3t7WVw/edit?usp=sharing)
3. [Milestone 3 Progress Slides](https://docs.google.com/presentation/d/1SY8XgbtOQOwFCNqlIhqCft3_o6H0uVIyBBi3s_v93jw/edit?usp=sharing)

## Project Details 

TerrainGen is a easy-to-use procedural, node-based tool that users can utilize to create terrain! Our project is entirely on WebGPU so the user does not have to worry about any setup/download issues.

### Window Layout 
<img width="900" height="945" alt="image" src="https://github.com/user-attachments/assets/3572e3e8-1551-47da-ae8d-d7ba98b7e206" />

Nodes can be added to the canvas element on the left-hand side of the screen and will be renderer on the right side window when the output nodes have the appropriate inputs. The terrain has two additional settings that can be adjusted with the terrain size and resolution sliders below the render screen.

### Import/Export 

<img width="200" height="292" alt="image" src="https://github.com/user-attachments/assets/5946e1e9-4189-46ef-a593-d0007ddfe020" />

A user can import/export their node graph.

As an example, here is a saved node graph layout [file](https://github.com/user-attachments/files/23843108/nodegraph-692ce3b8.tgen.json).
If this is imported, then the following node graph will be loaded in.

<img width="500" height="968" alt="image" src="https://github.com/user-attachments/assets/91ac03f7-4fad-4dd1-a62b-5bd242054c49" />

### Input Nodes

#### Vertex Data
This node outputs the position of the verticies. Nodes connected to this one can be used to offset these positions.
<img width="378" height="174" alt="image" src="https://github.com/user-attachments/assets/38adfa94-68c6-42cb-8bd6-b7689630da02" />

#### Geometry 
These nodes all work the same functionally. In that, they load a chosen model based on user input after connected to the **instancing (output)** node.
|<img width="379" height="241" alt="image" src="https://github.com/user-attachments/assets/aa79ad21-5101-40a2-9b4e-874bb0944ef5" /> | <img width="373" height="241" alt="image" src="https://github.com/user-attachments/assets/91e9f8f0-09c5-4d9a-9ab1-5a317ee425d2" /> | <img width="481" height="261" alt="Screenshot 2025-12-01 135707" src="https://github.com/user-attachments/assets/0a9cf638-f27d-43b0-94fb-de3d3d76534d" /> |
-------------------------- | -------------------------- | -------------------------- |
A user can add primitive geometry with this node (cube, sphere, plane) | A user can load their personal models with this node (only OBJ is supported for the time being) | A user can choose between our custom built-in geometry (ex. trees, rocks) to add to the terrain rather than upload their own |

#### Float 
This node allows for an input float variable.

<img width="320" height="197" alt="image" src="https://github.com/user-attachments/assets/27a5aca0-a385-470a-ba32-99a32d944072" />

#### Vector
This node allows for an input vec3f variable.

<img width="318" height="325" alt="image" src="https://github.com/user-attachments/assets/417311ad-3078-410a-93ca-5e866f0d6d0f" />

#### Unsigned Int
This node allows for an input unsigned int variable.

<img width="321" height="208" alt="image" src="https://github.com/user-attachments/assets/1109f959-3dec-4e72-911f-de0c8c3880cc" />

### Utility Nodes

| Separate XYZ | Combine XYZ |
-------------------------- | -------------------------- |
<img width="340" height="306" alt="image" src="https://github.com/user-attachments/assets/d1d2e9f2-9d14-4c8e-8d8f-07c4b0350d6b" /> | <img width="330" height="300" alt="image" src="https://github.com/user-attachments/assets/cd8947c4-a7f5-4eb5-80b0-b31d0ce896c1" /> |
| This node separates an input of type vec3f to three floats (x, y, z) | This node combines three float inputs into one vec3f |

### Geometry Nodes 

-- Will be added --

### Operator Nodes 

### Math 

| Math | Trig Math | Mix |
-------------------------- | -------------------------- | -------------------------- |
<img width="352" height="325" alt="image" src="https://github.com/user-attachments/assets/56f5bf4e-05ad-45fc-996b-010a88bfa42c" /> | <img width="396" height="317" alt="image" src="https://github.com/user-attachments/assets/4da26921-8eb5-4b22-ab87-7a5bfe9fdff3" /> | <img width="370" height="334" alt="image" src="https://github.com/user-attachments/assets/c23e180c-956c-4230-b1f8-0e3f4d65aba2" /> |
| This node can be used to apply one of the following operations (add, subtract, multiply, divide) to two inputs (float or vec3f) and returns a value of the same type | This node applies a trig function to an input value and returns a float output | This node linearly interporaltes between the two input values based on the mix value |

### Noise 
-- Will be added --

### Output Nodes

| Terrain | Instancing |
-------------------------- | -------------------------- |
<img width="340" height="306" alt="image" src="https://github.com/user-attachments/assets/d1d2e9f2-9d14-4c8e-8d8f-07c4b0350d6b" /> | <img width="330" height="300" alt="image" src="https://github.com/user-attachments/assets/cd8947c4-a7f5-4eb5-80b0-b31d0ce896c1" /> |
| This node triggers the terrain pipeline if the height float input is connected to a valid node. | This node triggers the instancing pipeline. The pipeline is only run/rerun if both the scatter and geometry inputs are connected to valid nodes. |

### Feature checklist

- [x] 🔌 Node-based description system for procedural terrain
- [x] 🏭 Just-in-time WebGPU shader code generation
- [x] 🏔️ Real-time terrain rendering
  - [x] Adjustable tesselation and terrain size
  - [ ] Varied terrain type rendering (grass, rock, snow, etc)
- [ ] 🔎 Real-time in-editor node previews
- [x] 🌲 Mesh instancing across terrain
  - [x] Mesh import for instancing
- [ ] 💾 Export to glTF or similar format

#### Node types:

- General-purpose
  - [x] Basic math (add, sub, mult, div)
  - [x] Trig math (sin, cos, tan)
  - [ ] Masking/graphics util (mix, lt, gt, min, max)
- Terrain source
  - [ ] Perlin noise
  - [ ] Custom image texture
- Terrain input
  - [x] Vertex XYZ position
- Terrain output
  - [x] Height
  - [ ] Terrain type
- Scattering source
  - [x] Terrain height
  - [ ] Voronoi scattering
- Scattering geometry
  - [x] Built-in objects: trees, rocks, bushes
  - [x] Primitive geometry: sphere, cube, plane, line
  - Custom models
    - [x] OBJ import
    - [ ] glTF import
  - [ ] Vegetation → like Unreal’s PCG

## Development

To run this application:

```bash
npm install
npm run dev
```

### Building For Production

To build this application for production:

```bash
npm run build
```

The resulting static content will be in the `dist` folder. You can preview these with `npm run preview`.

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
