# Spinnarr

A modern web application for randomly selecting items from multiple spinners. Perfect for making decisions, creating challenges, or picking random combinations!

## Features

- 📁 **Upload JSON files** - Drag & drop or browse to upload custom spinner configurations
- 🎰 **Multiple spinners** - Navigate through multiple spinner wheels in sequence
- 🎨 **Theme support** - Light, dark, or system theme with automatic detection
- 📱 **Responsive design** - Works seamlessly on all devices
- ⌨️ **Keyboard support** - Press spacebar to spin
- 🔊 **Realistic Audio** - Procedurally generated "physical click" sounds with perfect video/audio sync
- 📳 **Haptics** - Tactile vibration feedback for ticks and interactions (Android)
- 🎯 **Results tracking** - View all spinner results on a summary page
- ✨ **Accessible colors** - Dynamic color generation with WCAG AA contrast compliance
- 🔄 **Default configuration** - Loads with a pre-configured example (Minecraft House Builder)

## Quick Start

### Running Locally

1. Clone the repository
2. Use Node.js `22.12.0` (or newer v22):

   ```bash
   nvm use
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Running with Docker

1. Build the Docker image:

   ```bash
   docker build -t spinnarr .
   ```

2. Run the container:

   ```bash
   docker run -p 8080:80 spinnarr
   ```

3. Open your browser to `http://localhost:8080`

## Build

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm run test
```

## Linting & Type Safety

Run TypeScript + ESLint checks:

```bash
npm run lint
```

Auto-fix lint issues where possible:

```bash
npm run lint:fix
```

## JSON File Format

Your JSON file must follow this structure:

### Multi-Spinner Format (Required)

```json
{
  "title": "My Spinner Collection",
  "spinners": [
    {
      "name": "Spinner Name",
      "items": ["Option 1", "Option 2", "Option 3"]
    },
    {
      "name": "Another Spinner",
      "items": ["Choice A", "Choice B", "Choice C"]
    }
  ]
}
```

### Requirements

- Root object must have a `spinners` array
- Optional `title` field for the collection name
- Each spinner must have:
  - `name` (string) - Display name of the spinner
  - `items` (array) - Array of string items to spin through
- At least 1 spinner required
- At least 1 item per spinner required
- All items must be strings (no objects)

### Validation

The app validates uploaded JSON files against [schema.json](schema.json). Invalid files will show an error message.

### Example

See [public/Minecraft-House-Builder.json](public/Minecraft-House-Builder.json) for a complete example with 14 different spinners for generating random Minecraft house builds.

## How It Works

1. **Upload or Use Default**: Start with the pre-loaded Minecraft example or upload your own JSON file
2. **Spin Each Wheel**: Click "SPIN" or press spacebar to spin the current wheel
3. **Navigate**: Use "Previous" and "Next" buttons to move between spinners
4. **View Results**: After spinning all wheels, click "View Results" to see all your selections
5. **Start Over**: Reset and try again with "Start Over" or "Upload New File"

## Configuration

### Environment Variables

Set `VITE_DEFAULT_SPINNER_FILE` in [.env](.env) to specify a default JSON file to load on startup:

```env
VITE_DEFAULT_SPINNER_FILE=/Minecraft-House-Builder.json
```

## Audio & Haptics

### Audio Engine

Spinnarr uses the **Web Audio API** to generate sound effects procedurally in real-time, requiring no external assets.

- **Physical Modeling**: Instead of a simple beep, the audio engine generates a burst of white noise with a sharp exponential decay (5ms) to simulate a physical plastic card hitting a spoke.
- **Micro-Latency**: Sounds are buffered on load and triggered via `AudioBufferSourceNode` directly in the animation loop, ensuring zero latency between the visual wedge crossing and the audible click.
- **Organic Pitch**: Each click has a slight randomized pitch variation to prevent "robotic" repetition.

### Haptic Feedback

The app uses the `navigator.vibrate()` API to provide tactile feedback.

- **Events**: Vibrations trigger on every wedge tick, button press, and UI toggle.
- **Compatibility**:
  - **Android**: Fully supported (Chrome/Firefox).
  - **iOS (iPhone/iPad)**: Not supported (Apple blocks the vibration API in Safari/WebViews). The feature gracefully degrades (no errors, just no vibration).

## Technologies

- React 19
- TypeScript
- Vite 7
- ESLint 9 + `typescript-eslint`
- Modern CSS with CSS Variables
- Theme switching (Light/Dark/System)
- SVG-based wheel rendering
- Docker support with nginx
- WCAG AA accessible color generation

## Project Structure

```txt
src/
  ├── App.tsx                # Main application component
  ├── main.tsx               # Application entry point
  ├── components/
  │   ├── FileUpload.tsx     # Drag & drop file upload
  │   ├── Header.tsx         # Header with theme toggle
  │   ├── Spinner.tsx        # Spinning wheel component
  │   └── ThemeToggle.tsx    # Theme switcher
  ├── types.ts               # Shared application types
  └── styles/
      ├── App.css            # Component styles
      └── index.css          # Global styles and theme variables
public/
  └── Minecraft-House-Builder.json  # Example spinner configuration
schema.json                  # JSON schema for validation

## Contributing

Contributions are welcome! Please follow these guidelines when submitting changes.

### Building from Source

```bash
# Clone the repository
git clone https://github.com/eslutz/spinnarr.git
cd spinnarr

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
# Run tests
npm run test

# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Run locally with Node.js 22.12.0+
nvm use
npm run dev
```

Before submitting a pull request:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linters and tests
6. Submit a pull request

See our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) for more details.

## Security

Security is a top priority for this project. If you discover a security vulnerability, please follow responsible disclosure practices.

**Reporting Vulnerabilities:**

Please report security vulnerabilities through GitHub Security Advisories:
<https://github.com/eslutz/spinnarr/security/advisories/new>

Alternatively, you can view our [Security Policy](.github/SECURITY.md) for additional contact methods and guidelines.

**Security Best Practices:**

- Keep your installation up to date with the latest releases
- Be cautious when uploading JSON files from untrusted sources
- Review JSON file contents before loading
- Use HTTPS for production deployments
- Regularly monitor logs for suspicious activity

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software under the terms of the MIT License.

## Related Projects

Other tools in the ecosystem:

- **[Torarr](https://github.com/eslutz/torarr)** - Tor SOCKS proxy container for the *arr stack with health monitoring
- **[Forwardarr](https://github.com/eslutz/forwardarr)** - Automatic port forwarding sync from Gluetun VPN to qBittorrent
- **[Unpackarr](https://github.com/eslutz/unpackarr)** - Container-native archive extraction service for Sonarr, Radarr, and more
