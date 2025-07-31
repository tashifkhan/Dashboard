# Daily Deployment Cron Job

This setup configures automatic daily deployments at 8am IST (2:30am UTC) using Vercel's cron jobs feature with Vercel API integration.

1. **Cron Job API Route**: `src/pages/api/cron/deploy.ts`
2. **Vercel Configuration**: `vercel.json` with cron schedule
3. **Vercel API Integration**: Direct deployment triggering via Vercel API

## Cron Schedule

- **Time**: 8:00 AM IST (2:30 AM UTC)
- **Schedule**: `0 2 * * *` (daily at 2:30 AM UTC)
- **Path**: `/api/cron/deploy`

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Vercel project:

```bash
# Required: Vercel API Token
VERCEL_TOKEN=your_vercel_token_here

# Required: Vercel Project ID
VERCEL_PROJECT_ID=your_project_id_here
```

### 2. Get Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with deployment permissions
3. Add it as `VERCEL_TOKEN` environment variable

### 3. Get Project ID

1. Go to your Vercel project dashboard
2. Check the URL: `https://vercel.com/your-team/your-project`
3. The project ID is in the project settings
4. Add it as `VERCEL_PROJECT_ID` environment variable

### 4. Deploy to Vercel

```bash
# Deploy your project
vercel --prod
```

## How It Works

The cron job runs daily at 8am IST and:

1. **Verifies the request** is from Vercel's cron service
2. **Checks environment variables** for Vercel API credentials
3. **Triggers deployment** via Vercel API with force flag
4. **Logs the execution** for monitoring
5. **Returns deployment details** including deployment ID and URL

## Monitoring

- Check Vercel function logs in your dashboard
- Monitor deployment history in Vercel
- Set up alerts for failed deployments
- Test endpoint: `/api/cron/test`

## Troubleshooting

### Cron Job Not Running

- Verify `vercel.json` is deployed
- Check Vercel project settings
- Ensure function timeout is sufficient

### Deployment Not Triggering

- Verify `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are set
- Check Vercel token permissions
- Review function logs for errors
- Test manually: `GET /api/cron/deploy`

### Time Zone Issues

- Cron runs in UTC (2:30 AM UTC = 8:00 AM IST)
- Adjust schedule in `vercel.json` if needed

## Customization

### Change Schedule

Edit `vercel.json`:

```json
{
	"crons": [
		{
			"path": "/api/cron/deploy",
			"schedule": "0 2 * * *" // Change this
		}
	]
}
```

### Add More Cron Jobs

```json
{
	"crons": [
		{
			"path": "/api/cron/deploy",
			"schedule": "0 2 * * *"
		},
		{
			"path": "/api/cron/backup",
			"schedule": "0 3 * * *"
		}
	]
}
```

## Testing

1. **Test endpoint**: Visit `/api/cron/test` to check configuration
2. **Manual trigger**: Visit `/api/cron/deploy` to test deployment
3. **Check logs**: Monitor Vercel function logs for execution details
