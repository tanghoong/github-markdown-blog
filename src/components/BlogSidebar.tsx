import { BlogPost, RepoConfig } from '@/App'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Folder, FileText, Hash } from '@phosphor-icons/react'

interface BlogSidebarProps {
  posts: BlogPost[]
  onPostSelect: (post: BlogPost) => void
  repoConfig: RepoConfig
  className?: string
}

export function BlogSidebar({ posts, onPostSelect, repoConfig, className }: BlogSidebarProps) {
  // Group posts by category
  const postsByCategory = posts.reduce((acc, post) => {
    const category = post.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(post)
    return acc
  }, {} as Record<string, BlogPost[]>)

  // Get all unique categories
  const categories = Object.keys(postsByCategory).sort()
  
  // Count total posts
  const totalPosts = posts.length

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Blog Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Blog Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" />
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
            </div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Repository: {repoConfig.owner}/{repoConfig.repo}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="font-medium text-sm mb-2 text-primary">
                  {category}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({postsByCategory[category].length})
                  </span>
                </h3>
                <div className="space-y-1 ml-2">
                  {postsByCategory[category].map(post => (
                    <button
                      key={post.path}
                      onClick={() => onPostSelect(post)}
                      className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-1 rounded px-2 hover:bg-muted/50"
                    >
                      {post.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}