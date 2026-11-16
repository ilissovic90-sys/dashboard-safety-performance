# SCG Safety Performance 360

A responsive HSE performance dashboard prototype for the Gabès cement plant.

## Features
- Executive safety KPIs: LTI, days without LTI, WLD, near misses, first aid and property damage
- Direct / indirect man-hours and monthly frequency / severity trends
- Safety moments, equipment inspection, induction and PTW charts
- Safety Walks, SALAMA Cards and observations target gauges
- Incident register and corrective / preventive action register
- Add actions, change action status, search and export the action register to CSV
- Browser localStorage persistence

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Publish on GitHub Pages
1. Open repository Settings > Pages.
2. Under Build and deployment, select GitHub Actions as the source.
3. Push to the main branch. The workflow builds and deploys the site.

## Important data note
The initial dashboard is a demonstration dataset based on the July 2025 reference screenshot. Some additional categories and distributions are illustrative placeholders because the screenshot does not identify their full source records. Replace them with validated SCG records before official HSE reporting.

Edits are currently stored in the browser used to access the app. There is no multi-user synchronization, authentication, central database, or automatic Excel import yet.
