
# DISCLAIMER
> This app is for research purposes only

# Compound Tracker

Web app for tracking peptide, AAS, and HGH compound levels with pharmacokinetic decay modeling.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)

## Setup

```bash
git clone https://github.com/rglov/compound-tracker.git
cd compound-tracker
npm install
```

## Running (Web)

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

You can also run explicitly:

```bash
npm run web
```

## Testing

```bash
npm test
```

## Docker

Build image:

```bash
docker build -t compound-tracker-web .
```

Run container:

```bash
docker run --rm --name compound-tracker-web -p 3000:3000 -v "$(pwd)/data:/app/data" compound-tracker-web
```

Open [http://localhost:3000](http://localhost:3000).

Stop container (from another terminal):

```bash
docker stop compound-tracker-web
```

Rebuild after code changes:

```bash
docker build -t compound-tracker-web .
docker run --rm -p 3000:3000 -v "$(pwd)/data:/app/data" compound-tracker-web
```

## Data Storage

All app data is stored locally in `data/compound-tracker-data.json` (or `/app/data/compound-tracker-data.json` in Docker).  
No external server or account required.
