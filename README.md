# Participatie-ontwerptool openbare ruimte (MVP)

Een werkende MVP waarmee ontwerpers een referentiemodel kunnen uploaden, bewoners varianten kunnen ontwerpen via sliders en het ontwerpteam inzichten + kostenraming kan analyseren.

## Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express (TypeScript)
- **Database**: SQLite met Prisma ORM

## Structuur
- `client/` – React app met publieke en admin routes
- `server/` – Express API + Prisma schema

## Installeren

```bash
npm install
npm run install:all
```

## Database instellen

```bash
cd server
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

## Starten

### Client + Server

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000

## Routes

### Admin
- `/admin/projects/new` – nieuw project aanmaken
- `/admin/projects/:id` – referentiemodel en preview
- `/admin/projects/:id/analysis` – analyse dashboard (admin token vereist)

### Publiek (QR)
- `/p/:projectId` – publieke participatiepagina

## Admin token

Alle admin endpoints vragen om `x-admin-token` header. Zet de waarde in `server/.env`.

## QR link

De QR-link moet verwijzen naar:

```
http://localhost:5173/p/<projectId>
```

## Seed data

De seed script maakt één project met layout, zones, kruispunten en kostenconfiguratie.
