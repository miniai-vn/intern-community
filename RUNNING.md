# How to Run the Intern Community Project

## System Requirements
- Node.js 20+
- pnpm
- Docker (for database)

## Setup Steps

### 1. Clone and Install
```bash
git clone https://github.com/miniai-vn/intern-community.git
cd intern-community
pnpm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local to add GitHub OAuth credentials (optional for local browsing)
```

### 3. Start Database
```bash
docker compose up -d
```

### 4. Setup Database
```bash
pnpm db:push
pnpm db:seed
```

### 5. Run Application
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Common Troubleshooting

### Port 3000 already in use
```bash
# Kill running Next.js processes
taskkill /IM node.exe /F /T

# Or run on different port
PORT=3002 pnpm dev
```

### Database Issues
```bash
# Reset database
docker compose down -v
docker compose up -d
pnpm db:push
```

### OAuth Issues
- Check `.env` has correct `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Callback URL must be: `http://localhost:3000/api/auth/callback/github`

## Useful Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run tests
pnpm db:studio    # Open Prisma Studio
```