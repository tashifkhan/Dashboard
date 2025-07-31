import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the current timestamp for logging
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Daily deployment cron job triggered`);

    // Check if Vercel API credentials are configured
    if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
      console.error('Missing Vercel API credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing VERCEL_TOKEN or VERCEL_PROJECT_ID environment variables'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger deployment via Vercel API
    const deploymentResponse = await fetch('https://api.vercel.com/v1/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'dashboard-daily-deploy',
        target: 'production',
        projectId: process.env.VERCEL_PROJECT_ID,
        force: true,
        // Optional: Add metadata to identify this as a cron-triggered deployment
        meta: {
          trigger: 'cron-job',
          timestamp: timestamp
        }
      }),
    });

    if (!deploymentResponse.ok) {
      const errorText = await deploymentResponse.text();
      console.error('Deployment failed:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Deployment failed: ${errorText}`,
        statusCode: deploymentResponse.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deployment = await deploymentResponse.json();
    console.log('Deployment triggered successfully:', deployment.id);
    
    return new Response(JSON.stringify({
      success: true,
      deploymentId: deployment.id,
      deploymentUrl: deployment.url,
      method: 'vercel-api',
      message: 'Daily deployment triggered successfully via Vercel API',
      timestamp: timestamp
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: `Internal server error: ${error}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 