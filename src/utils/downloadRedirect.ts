import downloadsData from '../data/downloads.json';

export interface DownloadProject {
  title: string;
  download_url: string;
}

export function getDownloadUrl(projectTitle: string): string | null {
  const normalizedTitle = projectTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  const project = downloadsData.projects.find(
    (p: DownloadProject) => p.title.toLowerCase() === normalizedTitle
  );
  
  return project ? project.download_url : null;
}

export function getAllDownloadProjects(): DownloadProject[] {
  return downloadsData.projects;
}
