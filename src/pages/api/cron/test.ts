import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const timestamp = new Date().toISOString();
  
  return new Response(JSON.stringify({
    success: true,
    timestamp,
    message: 'Cron test endpoint is working',
    environment: {
      hasVercelToken: !!process.env.VERCEL_TOKEN,
      hasProjectId: !!process.env.VERCEL_PROJECT_ID,
      deploymentMethod: 'vercel-api-only'
    },
    instructions: {
      setup: 'Set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables',
      test: 'Visit /api/cron/deploy to test deployment trigger'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}; 