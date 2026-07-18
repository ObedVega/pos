# Chiquita Catering POS

A modern desktop Point of Sale (POS) application built specifically for **Chiquita Catering**.

The system is designed to provide a fast and reliable checkout experience, even in environments with limited or unstable internet connectivity.

## Features

- Sales management
- Customer management
- Product management
- Daily notices
- Local SQLite database
- Invoice generation
- Thermal printer support
- Keyboard shortcuts
- Desktop application built with Electron

## Tech Stack

- Electron
- React
- SQLite
- Electron Forge
- Webpack

## Project Structure

```
src/
 ├── components/
 ├── services/
 ├── repositories/
 ├── database/
 ├── preload/
 ├── ipc/
 └── assets/
```

## Development

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

Create a distributable package:

```bash
npm run make
```

## Architecture

The application follows a layered architecture:

```
React UI
    ↓
Services
    ↓
Electron Preload
    ↓
IPC
    ↓
Repositories
    ↓
SQLite
```

This separation keeps the UI independent from the data layer and simplifies future maintenance.

## License

Private software developed exclusively for **Chiquita Catering**.

© 2026 Obed Vega. All rights reserved.