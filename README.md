# Compound Tracker

Desktop app for tracking peptide, AAS, and HGH compound levels with pharmacokinetic decay modeling. Built with Electron.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)

## Setup

```bash
git clone https://github.com/rglov/compound-tracker.git
cd compound-tracker
npm install
```

## Running

```bash
npm start
```

This launches the Electron desktop app via `electron-forge`.

## Building

To package the app as a distributable:

```bash
npm run package
```

To create platform-specific installers (zip for macOS, Linux, Windows):

```bash
npm run make
```

Build output goes to the `out/` directory.

## Data Storage

All data (doses, cycles, bloodwork, inventory, custom compounds) is stored locally via `electron-store`. No external server or account required.
