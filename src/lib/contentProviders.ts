import { BlogPost, RepoConfig } from '../App'
import { Octokit } from 'octokit'

export interface ContentProvider {
  fetchPosts(config: RepoConfig): Promise<BlogPost[]>
  name: string
  description: string
}

// Simple in-memory cache for posts
interface CacheEntry {
  posts: BlogPost[]
  timestamp: number
  key: string
}

const postCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCacheKey(config: RepoConfig): string {
  if (config.contentSource === 'local') {
    return 'local-files'
  }
  return `github-${config.owner}-${config.repo}-${config.branch || 'main'}-${config.path || ''}`
}

function getCachedPosts(config: RepoConfig): BlogPost[] | null {
  const key = getCacheKey(config)
  const entry = postCache.get(key)
  
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    console.log('Using cached posts')
    return entry.posts
  }
  
  return null
}

function setCachedPosts(config: RepoConfig, posts: BlogPost[]): void {
  const key = getCacheKey(config)
  postCache.set(key, {
    posts,
    timestamp: Date.now(),
    key
  })
}

export function clearCache(): void {
  postCache.clear()
}

// Helper functions for both providers
export function extractTitle(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1].trim() : null
}

export function extractExcerpt(content: string): string {
  // Remove title and get first paragraph
  const withoutTitle = content.replace(/^#\s+.+$/m, '').trim()
  const firstPara = withoutTitle.split('\n\n')[0]
  return firstPara.length > 150 ? firstPara.substring(0, 150) + '...' : firstPara
}

// GitHub Content Provider - existing implementation
export class GitHubContentProvider implements ContentProvider {
  name = 'GitHub Repository'
  description = 'Fetch markdown files from a GitHub repository'

  async fetchPosts(config: RepoConfig): Promise<BlogPost[]> {
    // Check cache first
    const cached = getCachedPosts(config)
    if (cached) {
      return cached
    }

    const allPosts: BlogPost[] = []
    
    // Create Octokit instance with optional authentication
    const octokitOptions: any = {}
    if (config.githubToken) {
      octokitOptions.auth = config.githubToken
    }
    
    const octokit = new Octokit(octokitOptions)
    
    // First, verify the repository exists and is accessible
    try {
      await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo
      })
    } catch (repoError: any) {
      if (repoError.status === 403 && repoError.message?.includes('rate limit')) {
        throw new Error(`GitHub API rate limit exceeded. Please add a GitHub token in your configuration to get higher rate limits (5,000 requests/hour vs 60).`)
      }
      throw new Error(`Repository "${config.owner}/${config.repo}" not found or not accessible. Please check the repository name and ensure it's public.`)
    }
    
    // Function to recursively fetch markdown files from directories
    const fetchFromDirectory = async (path: string, category?: string): Promise<void> => {
      try {
        const { data: contents } = await octokit.rest.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path: path,
          ref: config.branch || 'main'
        })

        if (!Array.isArray(contents)) return

        // Process directories (categories) and files
        for (const item of contents) {
          if (item.type === 'dir') {
            // Recursively fetch from subdirectory
            await fetchFromDirectory(item.path, item.name)
          } else if (item.type === 'file' && 
                     (item.name.endsWith('.md') || item.name.endsWith('.markdown'))) {
            try {
              // Fetch markdown file content
              const { data: fileData } = await octokit.rest.repos.getContent({
                owner: config.owner,
                repo: config.repo,
                path: item.path,
                ref: config.branch || 'main'
              })

              if ('content' in fileData) {
                const content = atob(fileData.content)
                const title = extractTitle(content) || item.name.replace(/\.(md|markdown)$/, '')
                const excerpt = extractExcerpt(content)
                
                allPosts.push({
                  title,
                  content,
                  path: item.path,
                  sha: fileData.sha,
                  excerpt,
                  category
                })
              }
            } catch (fileError: any) {
              if (fileError.status === 403 && fileError.message?.includes('rate limit')) {
                throw new Error(`GitHub API rate limit exceeded while fetching files. Please add a GitHub token to your configuration.`)
              }
              console.warn(`Failed to fetch file ${item.path}:`, fileError)
              // Continue processing other files
            }
          }
        }
      } catch (dirError: any) {
        if (dirError.status === 403 && dirError.message?.includes('rate limit')) {
          throw new Error(`GitHub API rate limit exceeded. Please add a GitHub token to your configuration.`)
        }
        if (path === (config.path || '')) {
          // If the main directory doesn't exist, throw a helpful error
          throw new Error(`Directory "${path || 'root'}" not found in repository. Please check the path configuration.`)
        } else {
          console.warn(`Failed to fetch directory ${path}:`, dirError)
          // Continue processing other directories
        }
      }
    }

    // Start fetching from the configured path
    await fetchFromDirectory(config.path || '')
    
    if (allPosts.length === 0) {
      throw new Error(`No markdown files found in "${config.path || 'root'}" directory. Please check your repository structure.`)
    }
    
    // Cache the results
    setCachedPosts(config, allPosts)
    
    return allPosts
  }
}

// Local File System Content Provider - new implementation
export class LocalFileSystemProvider implements ContentProvider {
  name = 'Local Files'
  description = 'Read markdown files from your local file system'

  async fetchPosts(config: RepoConfig): Promise<BlogPost[]> {
    // Note: Local files shouldn't be cached as they might change frequently
    // and we want to always show the latest content
    
    // Check if File System Access API is available
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API is not supported in your browser. Please use a modern browser like Chrome, Edge, or Opera.')
    }

    try {
      // Request directory access from the user
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'documents'
      })

      const allPosts: BlogPost[] = []

      // Recursively read markdown files from the directory
      await this.readDirectory(dirHandle, allPosts, '')

      if (allPosts.length === 0) {
        throw new Error('No markdown files found in the selected directory.')
      }

      return allPosts
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Directory selection was cancelled. Please select a directory to continue.')
      }
      throw error
    }
  }

  private async readDirectory(
    dirHandle: any,
    posts: BlogPost[],
    parentPath: string,
    category?: string
  ): Promise<void> {
    for await (const entry of dirHandle.values()) {
      const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name

      if (entry.kind === 'directory') {
        // Recursively read subdirectories (as categories)
        await this.readDirectory(entry, posts, fullPath, entry.name)
      } else if (entry.kind === 'file' && 
                 (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
        try {
          const file = await entry.getFile()
          const content = await file.text()
          
          const title = extractTitle(content) || entry.name.replace(/\.(md|markdown)$/, '')
          const excerpt = extractExcerpt(content)
          
          posts.push({
            title,
            content,
            path: fullPath,
            sha: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
            excerpt,
            category,
            date: new Date(file.lastModified).toISOString()
          })
        } catch (error) {
          console.warn(`Failed to read file ${fullPath}:`, error)
          // Continue processing other files
        }
      }
    }
  }
}

// Factory to get the appropriate content provider
export function getContentProvider(type: 'github' | 'local'): ContentProvider {
  switch (type) {
    case 'github':
      return new GitHubContentProvider()
    case 'local':
      return new LocalFileSystemProvider()
    default:
      return new GitHubContentProvider()
  }
}
