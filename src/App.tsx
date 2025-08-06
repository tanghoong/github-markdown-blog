import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { BlogHeader } from './components/BlogHeader'
import { PostList } from './components/PostList'
import { PostReader } from './components/PostReader'
import { RepoSetup } from './components/RepoSetup'
import { LoadingSpinner } from './components/LoadingSpinner'
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
}

function App() {
  const [repoConfig, setRepoConfig] = useKV<RepoConfig | null>('blog-repo-config', null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async (config: RepoConfig) => {
    setLoading(true)
    setError(null)
    
    try {
      const octokit = new Octokit()
      const allPosts: BlogPost[] = []
      
      // Function to recursively fetch markdown files from directories
      const fetchFromDirectory = async (path: string, category?: string): Promise<void> => {
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
          }
        }
      }

      // Start fetching from the configured path
      await fetchFromDirectory(config.path || '')
      
      setPosts(allPosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
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
      <PostReader 
        post={selectedPost} 
        onBack={() => setSelectedPost(null)}
        repoConfig={repoConfig}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader 
        repoConfig={repoConfig} 
        onConfigChange={() => setRepoConfig(null)}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => fetchPosts(repoConfig)}
              className="text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <PostList 
            posts={posts} 
            onPostSelect={setSelectedPost}
          />
        )}
      </main>
    </div>
  )
}

export default App