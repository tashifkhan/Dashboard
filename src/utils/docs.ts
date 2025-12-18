import fs from 'fs';
import path from 'path';
import { formatTitle } from './formatTitle';

const DOCS_DIR = path.join(process.cwd(), 'src/data/docs');

// Helper to resolve project directory case-insensitively
function resolveProjectDir(projectSlug: string): string | null {
  if (!fs.existsSync(DOCS_DIR)) return null;
  const entries = fs.readdirSync(DOCS_DIR);
  // Try exact match first
  if (entries.includes(projectSlug)) return projectSlug;
  // Try case-insensitive match
  const match = entries.find(e => e.toLowerCase() === projectSlug.toLowerCase());
  return match || null;
}

export interface DocPage {
  params: {
    project: string;
    slug: string | undefined;
  };
  props: {
    project: string;
    slug: string;
    content: string;
    title: string;
    headings: any[]; // we can parse headings if needed, or let MarkdownRenderer handle it
  };
}

export interface SidebarItem {
  title: string;
  slug: string; // full slug including project/subdirectory
  path: string; // relative path for matching
  order: number;
  children?: SidebarItem[];
  depth: number;
}

// Helper to get all projects (directories in src/data/docs)
export function getProjects(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs.readdirSync(DOCS_DIR).filter(file => {
    return fs.statSync(path.join(DOCS_DIR, file)).isDirectory() && file !== 'images';
  });
}

// Recursive function to get all markdown files
function getMarkdownFiles(dir: string, baseDir: string = ''): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.join(baseDir, file);
    
    if (stat && stat.isDirectory()) {
       results = results.concat(getMarkdownFiles(filePath, relativePath));
    } else if (file.endsWith('.md')) {
      results.push(relativePath);
    }
  }
  return results;
}

export function getAllDocs(): DocPage[] {
  const projects = getProjects();
  const pages: DocPage[] = [];

  for (const project of projects) {
    const projectDir = path.join(DOCS_DIR, project);
    const files = getMarkdownFiles(projectDir);

    for (const file of files) {
      const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
      // Create slug from file path, remove extension
      const slug = file.replace(/\.md$/, '');
      const title = formatTitle(path.basename(slug)); // Simple title extraction implementation

      pages.push({
        params: {
          project: project.toLowerCase(), // Normalize URL to lowercase
          slug, 
        },
        props: {
          project, // Keep original directory name for internal use
          slug,
          content,
          title,
          headings: [],
        }
      });
    }
  }
  return pages;
}

// Helper to parse filename ordering "1.2.3-title" -> [1, 2, 3]
function parseOrder(filename: string): number[] {
  const match = filename.match(/^(\d+(\.\d+)*)/);
  if (!match) return [999];
  return match[0].split('.').map(Number);
}

// Helper to compare two order arrays
function compareOrders(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const valA = a[i] ?? -1;
    const valB = b[i] ?? -1; 
    // If one is shorter (parent), it comes first? 
    // e.g. [1] vs [1, 1]. valA=1, valB=1. Next: valA=-1, valB=1.
    // -1 means "end of segments". Parent [1] should come before child [1, 1].
    if (valA !== valB) {
        if (valA === -1) return -1; // a is shorter, goes first
        if (valB === -1) return 1;  // b is shorter, goes first
        return valA - valB;
    }
  }
  return 0;
}

// Generate sidebar structure for a project
export function getSidebar(projectSlug: string): SidebarItem[] {
  const realProjectDirName = resolveProjectDir(projectSlug);
  if (!realProjectDirName) return [];

  const projectDir = path.join(DOCS_DIR, realProjectDirName);
  if (!fs.existsSync(projectDir)) return [];

  const files = getMarkdownFiles(projectDir);
  
  // 1. Map files to nodes with parsed order details
  interface Node extends SidebarItem {
    orderPath: number[];
  }
  
  const nodes: Node[] = files.map(file => {
    const filename = path.basename(file, '.md');
    // If file is in subdirectory, handle that? 
    // For now assuming the numbering "3.1.2-..." is globally unique or relative to flat list
    // The previous listing showed flattened numbered files. 
    // We'll use the filename itself for numbering/hierarchy.
    
    const orderPath = parseOrder(filename);
    const title = formatTitle(filename.replace(/^(\d+(\.\d+)*)-?/, '')); // Remove numbering from title

    return {
      title: title || formatTitle(filename),
      slug: `${projectSlug.toLowerCase()}/${file.replace(/\.md$/, '')}`,
      path: file,
      order: orderPath[0], // Top level order for basic sorting
      orderPath: orderPath,
      children: [],
      depth: orderPath.length - 1
    };
  });

  // 2. Sort nodes logic
  nodes.sort((a, b) => compareOrders(a.orderPath, b.orderPath));

  // 3. Build Tree
  // We can rebuild tree by iterating sorted list and finding parents
  const root: SidebarItem[] = [];
  const stack: Node[] = []; // Stack to keep track of potential parents

  for (const node of nodes) {
    if (stack.length === 0) {
      if (node.orderPath.length > 1) {
          // It's a child but we haven't seen parent? 
          // Just put at root or find best fit?
          // If strict hierarchy [1] -> [1,1], then [1,1] shouldn't be root.
          // flexible: put at root if no parent found.
          root.push(node);
          stack.push(node);
      } else {
          root.push(node);
          stack.push(node);
      }
      continue;
    }

    // Check if stack top is parent
    // Parent [1] is parent of [1, 1], [1, 2]
    // Parent [1, 1] is parent of [1, 1, 1]
    
    // Check if 'node' is a direct child of 'last'
    // A direct child must extend the parent's path by 1 segment, 
    // AND match the parent's path prefix.
    
    // Pop from stack until we find a parent or stack empty
    while (stack.length > 0) {
      const parent = stack[stack.length - 1];
      
      const isPrefix = parent.orderPath.every((val, i) => val === node.orderPath[i]);
      const isDirectChild = isPrefix && node.orderPath.length === parent.orderPath.length + 1;
      
      if (isDirectChild) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        // This node might be a parent to subsequent nodes
        stack.push(node); 
        break;
      } else {
        // Current stack top is not parent.
        // It could be a sibling ([1, 1] vs [1, 2]) -> pop [1, 1] to see [1].
        // Or completely unrelated ([1] vs [2]) -> pop [1]
        stack.pop();
        if (stack.length === 0) {
          // No parent found in stack, add to root
          root.push(node);
          stack.push(node); // Track this new root
          break;
        }
      }
    }
  }

  return root;
}

export function getProjectEntry(project: string): string | null {
    const sidebar = getSidebar(project);
    if (sidebar.length === 0) return null;
    
    // Find first leaf
    function findFirstLeaf(items: SidebarItem[]): string | null {
        for (const item of items) {
            if (item.slug !== '#') return item.slug;
            if (item.children) {
                const childSlug = findFirstLeaf(item.children);
                if (childSlug) return childSlug;
            }
        }
        return null;
    }
    
    return findFirstLeaf(sidebar);
}

export function getDocPagination(project: string, currentSlug: string): { prev: SidebarItem | null, next: SidebarItem | null } {
    const sidebar = getSidebar(project);
    
    // Flatten the sidebar to get linear order
    const flat: SidebarItem[] = [];
    function traverse(items: SidebarItem[]) {
        for (const item of items) {
            if (item.slug !== '#') flat.push(item);
            if (item.children) traverse(item.children);
        }
    }
    traverse(sidebar);
    
    // Match logic:
    // currentSlug from params might be "1-overview" (partial) or full "project/1-overview"
    // The sidebar slugs are "project/1-overview".
    // Let's normalize by checking suffix or exact match.
    
    const currentIndex = flat.findIndex(item => {
        // Ensure robust matching. item.slug is "project/path". currentSlug is usually just "path" from Astro params?
        // Wait, currentSlug from Astro `[...slug]` param matches the path *inside* the project.
        // But our sidebar item.slug includes the project prefix?
        // Let's check getSidebar impl above: 
        // slug: `${projectSlug.toLowerCase()}/${file.replace(/\.md$/, '')}`
        // So item.slug is "project/folder/file".
        // currentSlug passed from page is likely "folder/file" or "file".
        // Let's try to match strict if possible, or contains.
        
        // Actually best is to construct full slug from project + currentSlug
        const fullFn = `${project.toLowerCase()}/${currentSlug}`;
        return item.slug === fullFn;
    });
    
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
        prev: currentIndex > 0 ? flat[currentIndex - 1] : null,
        next: currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null
    };
}
