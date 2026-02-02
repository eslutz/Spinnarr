# Spinnarr

A modern web application for randomly selecting items from multiple spinners. Perfect for making decisions, creating challenges, or picking random combinations!

## Features

- 📁 **Upload JSON files** - Drag & drop or browse to upload custom spinner configurations
- 🎰 **Multiple spinners** - Navigate through multiple spinner wheels in sequence
- 🎨 **Theme support** - Light, dark, or system theme with automatic detection
- 📱 **Responsive design** - Works seamlessly on all devices
- ⌨️ **Keyboard support** - Press spacebar to spin
- 🎯 **Results tracking** - View all spinner results on a summary page
- ✨ **Accessible colors** - Dynamic color generation with WCAG AA contrast compliance
- 🔄 **Default configuration** - Loads with a pre-configured example (Minecraft House Builder)

## Quick Start

### Running Locally

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

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

See [public/minecraftSpinnerOptions.json](public/minecraftSpinnerOptions.json) for a complete example with 14 different spinners for generating random Minecraft house builds.

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
VITE_DEFAULT_SPINNER_FILE=/minecraftSpinnerOptions.json
```

## Technologies

- React 19
- Vite 7
- Modern CSS with CSS Variables
- Theme switching (Light/Dark/System)
- SVG-based wheel rendering
- Docker support with nginx
- WCAG AA accessible color generation

## Project Structure

```txt
src/
  ├── App.jsx                 # Main application component
  ├── main.jsx               # Application entry point
  ├── components/
  │   ├── FileUpload.jsx     # Drag & drop file upload
  │   ├── Header.jsx         # Header with theme toggle
  │   ├── Spinner.jsx        # Spinning wheel component
  │   └── ThemeToggle.jsx    # Theme switcher
  └── styles/
      ├── App.css            # Component styles
      └── index.css          # Global styles and theme variables
public/
  └── minecraftSpinnerOptions.json  # Example spinner configuration
schema.json                  # JSON schema for validation
```

## Browser Support

Works on all modern browsers that support:

- ES6+ JavaScript
- CSS Variables
- SVG
- CSS Grid and Flexbox
