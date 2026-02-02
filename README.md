# Spinnarr

A modern web application for randomly selecting items from a JSON file. Perfect for making decisions, picking winners, or choosing what to watch/play/do next!

## Features

- 📁 **Upload JSON files** - Drag & drop or browse to upload
- 🎰 **Animated spinner** - Engaging spinning animation
- 🎨 **Theme support** - Light, dark, or system theme
- 📱 **Responsive design** - Works on all devices
- ✨ **Simple & intuitive** - No configuration needed

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
- Each spinner must have:
  - `name` (string) - Display name of the spinner
  - `items` (array) - Array of string items to spin through
- At least 1 spinner required
- At least 1 item per spinner required
- All items must be strings (no objects)

### Example

See `minecraftSpinnerOptions.json` for a complete example with 14 different spinners.

## Technologies

- React 18
- Vite
- Modern CSS with CSS Variables
- Theme switching (Light/Dark/System)
