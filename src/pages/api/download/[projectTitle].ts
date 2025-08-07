import type { APIRoute } from 'astro';
import { getDownloadUrl } from '../../../utils/downloadRedirect';

export const GET: APIRoute = async ({ params }) => {
  const projectTitle = params.projectTitle;
  
  if (!projectTitle) {
    return new Response('Project title is required', { status: 400 });
  }
  
  const downloadUrl = getDownloadUrl(projectTitle);
  
  if (downloadUrl) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': downloadUrl
      }
    });
  } else {
    return new Response('Project not found', { status: 404 });
  }
};
