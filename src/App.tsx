import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { BlogHeader } from './components/BlogHeader'
import { PostList } from './components/PostList'
import { PostReader } from './components/PostReader'
import { RepoSetup } from './components/RepoSetup'
import { LoadingSpinner } from './components/LoadingSpinner'
import { BlogSidebar } from './components/BlogSidebar'
import { BlogFooter } from './components/BlogFooter'
import { Button } from '@/components/ui/button'
import { Menu, X } from '@phosphor-icons/react'
import { Octokit } from 'octokit'

export interface BlogPost {
  title: string
  content: string
  path: string
  sha: string
  date?: string
  excerpt?: string
  category?: string
}

export interface RepoConfig {
  owner: string
  repo: string
  branch?: string
  path?: string
  blogTitle?: string
  blogDescription?: string
  blogSeoDescription?: string
  githubToken?: string
}

function App() {
  const [repoConfig, setRepoConfig] = useKV<RepoConfig | null>('blog-repo-config', null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Update document title and meta description based on config
  useEffect(() => {
    if (repoConfig) {
      document.title = repoConfig.blogTitle || `${repoConfig.owner}'s Blog`
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', repoConfig.blogSeoDescription || repoConfig.blogDescription || `Blog by ${repoConfig.owner}`)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = repoConfig.blogSeoDescription || repoConfig.blogDescription || `Blog by ${repoConfig.owner}`
        document.head.appendChild(meta)
      }
    }
  }, [repoConfig])

  const fetchPosts = async (config: RepoConfig) => {
    setLoading(true)
    setError(null)
    
    try {
      // Create Octokit instance with optional authentication
      const octokitOptions: any = {}
      if (config.githubToken) {
        octokitOptions.auth = config.githubToken
      }
      
      const octokit = new Octokit(octokitOptions)
      const allPosts: BlogPost[] = []
      
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
        setError(`No markdown files found in "${config.path || 'root'}" directory. Please check your repository structure.`)
      } else {
        setPosts(allPosts)
      }
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (err.status === 403 && err.message?.includes('rate limit')) {
        setError('GitHub API rate limit exceeded. Please add a GitHub token to your configuration to get higher rate limits.')
      } else {
        setError('Failed to fetch posts. Please check your repository configuration.')
      }
    } finally {
      setLoading(false)
      fetchPosts(repoConfig)
  }

  const extractTitle = (content: string): string | null => {
    const titleMatch = content.match(/^#\s+(.+)$/m)
    return titleMatch ? titleMatch[1].trim() : null
  }

  const extractExcerpt = (content: string): string => {
    // Remove title and get first paragraph
    const withoutTitle = content.replace(/^#\s+.+$/m, '').trim()
    const firstPara = withoutTitle.split('\n\n')[0]
    return firstPara.length > 150 ? firstPara.substring(0, 150) + '...' : firstPara
  }

  useEffect(() => {
    if (repoConfig) {
      fetchPosts(repoConfig)
    }
  }, [repoConfig])

  if (!repoConfig) {
    return <RepoSetup onConfigSubmit={setRepoConfig} />
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PostReader 
          post={selectedPost} 
          onBack={() => setSelectedPost(null)}
          repoConfig={repoConfig}
        />
        <BlogFooter repoConfig={repoConfig} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BlogHeader 
        repoConfig={repoConfig} 
        onConfigChange={() => setRepoConfig(null)}
      />
      
      <div className="flex-1 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-background border-r 
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:block overflow-y-auto
        `}>
          <div className="lg:hidden p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Navigation</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6">
            <BlogSidebar 
              posts={posts}
              onPostSelect={(post) => {
                setSelectedPost(post)
                setSidebarOpen(false)
              }}
              repoConfig={repoConfig}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:max-w-4xl mx-auto w-full">
          {/* Mobile menu button */}
          <div className="lg:hidden p-4 border-b bg-card">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSidebarOpen(true)}
              className="gap-2"
            >
              <Menu className="w-4 h-4" />
              Menu
            </Button>
          </div>

          <div className="px-6 py-8">
            {loading && <LoadingSpinner />}
            
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button 
                    onClick={() => fetchPosts(repoConfig)}
                    className="text-accent hover:underline"
                  >
                    Try again
                  </button>
                  {error.includes('rate limit') && (
                    <button 
                      onClick={() => setRepoConfig(null)}
                      className="text-accent hover:underline"
                    >
                      Add GitHub Token
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {!loading && !error && (
              <PostList 
                posts={posts} 
                onPostSelect={setSelectedPost}
              />
            )}
          </div>
        </main>
      </div>
      
      <BlogFooter repoConfig={repoConfig} />
    </div>
  )
}

export default App