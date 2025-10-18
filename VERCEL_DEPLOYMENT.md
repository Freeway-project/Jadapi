# Vercel Deployment Guide for JadAPI

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- Required environment variables

## Step 1: Project Setup

### 1.1 Install Vercel CLI (Optional)
```bash
pnpm add -g vercel
```

### 1.2 Login to Vercel
```bash
vercel login
```

## Step 2: Configure Environment Variables

In your Vercel project dashboard, add the following environment variables:

### Required Variables
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Optional Variables
```
NEXT_PUBLIC_APP_NAME=JadAPI
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

## Step 3: Vercel Dashboard Configuration

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Configure the following:

### Build & Development Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `.` (project root) |
| Build Command | `cd apps/web && pnpm build` |
| Output Directory | `apps/web/.next` |
| Install Command | `pnpm install` |
| Development Command | `cd apps/web && pnpm dev` |

### Node.js Version
- Set to **20.x** (matches your project requirement)

## Step 4: Deploy via GitHub (Recommended)

### 4.1 Connect Repository
1. Go to Vercel Dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select the repository containing JadAPI

### 4.2 Configure Project
1. Project Name: `jadapi-web` (or your preferred name)
2. Framework Preset: Next.js
3. Root Directory: Leave as `.` (project root)
4. Build settings: Use the configuration from Step 3

### 4.3 Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add all variables from Step 2
3. Select environments: Production, Preview, Development

### 4.4 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Visit your deployment URL

## Step 5: Deploy via CLI

```bash
# Navigate to project root
cd /path/to/Jadapi

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Select your team/personal account
# - Link to existing project: N (first time) or Y (subsequent)
# - Project name: jadapi-web
# - In which directory is your code located: ./
```

## Step 6: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Issue: Build fails with webpack errors

**Solution:**
- Ensure all environment variables are set correctly
- Check that `turbo.json` includes all required env vars
- Verify `pnpm-lock.yaml` is committed to git

### Issue: "Cannot find package" errors

**Solution:**
- Ensure build command is correct: `cd apps/web && pnpm build`
- Clear Vercel build cache:
  1. Go to **Settings** → **General**
  2. Scroll to **Build & Development Settings**
  3. Click "Clear Cache and Redeploy"

### Issue: Environment variables not available

**Solution:**
- Ensure variables are added in Vercel dashboard
- Check that variable names match exactly (case-sensitive)
- Verify `turbo.json` lists all NEXT_PUBLIC_* variables in the `env` array

### Issue: Monorepo workspace dependencies not found

**Solution:**
- Ensure `vercel.json` is in project root
- Verify build command: `pnpm build --filter=web`
- Check that workspace dependencies are properly configured in `package.json`

## Automatic Deployments

### Production Deployments
- Push to `main` branch triggers production deployment
- Deployment URL: your-project.vercel.app

### Preview Deployments
- Push to any other branch triggers preview deployment
- Each PR gets unique preview URL
- Perfect for testing before merge

## Monitoring

### Build Logs
- View in Vercel Dashboard → Deployments → [Your Deployment] → Build Logs

### Runtime Logs
- View in Vercel Dashboard → Deployments → [Your Deployment] → Functions

### Analytics
- Enable Vercel Analytics in Project Settings
- View traffic and performance metrics

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click **...** → **Promote to Production**

## Environment-Specific Configurations

### Production
- `NODE_ENV=production`
- Enable caching
- Disable debug mode

### Preview
- Test new features
- Same as production but with preview URL

### Development
- Local development only
- Use `.env.local` for local variables

## Security Best Practices

1. Never commit `.env` files to git
2. Use Vercel's environment variable encryption
3. Rotate API keys regularly
4. Use different API keys for production/preview/development
5. Enable Vercel's DDoS protection
6. Set up custom security headers in `next.config.mjs`

## Performance Optimization

1. Enable Vercel Analytics
2. Use Image Optimization (Next.js automatic)
3. Enable Edge Functions for API routes
4. Configure caching headers
5. Monitor Core Web Vitals

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Quick Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Pull environment variables
vercel env pull

# Link local project to Vercel
vercel link
```

## Support

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel Dashboard
3. Contact Vercel Support (Pro/Enterprise plans)
4. Check community discussions on GitHub
