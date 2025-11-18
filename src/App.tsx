import { useState, useEffect } from 'react'
import { useKV } from './hooks/useKV'
import { BlogHeader } from './components/BlogHeader'
import { PostList } from './components/PostList'
import { PostReader } from './components/PostReader'
import { RepoSetup } from './components/RepoSetup'
import { LoadingSpinner } from './components/LoadingSpinner'
import { BlogSidebar } from './components/BlogSidebar'
import { BlogFooter } from './components/BlogFooter'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'
import { getContentProvider } from './lib/contentProviders'

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
  contentSource?: 'github' | 'local' // New field to specify content source
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
      const contentSource = config.contentSource || 'github'
      const provider = getContentProvider(contentSource)
      
      const allPosts = await provider.fetchPosts(config)
      setPosts(allPosts)
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (err.status === 403 && err.message?.includes('rate limit')) {
        setError('GitHub API rate limit exceeded. Please add a GitHub token to your configuration to get higher rate limits.')
      } else {
        setError('Failed to fetch posts. Please check your configuration.')
      }
    } finally {
      setLoading(false)
    }
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
              <List className="w-4 h-4" />
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