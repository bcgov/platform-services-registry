# Chart.js in Node.js

To render charts with Chart.js on Node.js, you’ll need the [`canvas`](https://www.npmjs.com/package/canvas) package, which requires several system libraries to build.

## Install system dependencies

### Debian/Ubuntu

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  libpng-dev \
  librsvg2-dev
```

### macOS

> **Requires**: [Homebrew](https://brew.sh)

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

## Dependency overview

| Library                                  | Purpose                        |
| ---------------------------------------- | ------------------------------ |
| cairo                                    | 2D graphics rendering          |
| pango                                    | Text rendering                 |
| libpng                                   | PNG support                    |
| jpeg                                     | JPEG support                   |
| giflib                                   | GIF support                    |
| librsvg                                  | SVG support (optional)         |
| build tools (build-essential/pkg-config) | Compilers and flags management |

## Managing the `canvas` package

-   **Rebuild `canvas`** if you encounter runtime errors, especially after dependency or environment changes.

```bash
cd node_modules/.pnpm/canvas@3.1.0/node_modules/canvas
pnpm exec node-gyp rebuild
```
