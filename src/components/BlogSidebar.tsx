import { BlogPost, RepoConfig } from '@/App'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Hash, Book, Folder } from '@phosphor-icons/react'

interface BlogSidebarProps {
  posts: BlogPost[]
  onPostSelect: (post: BlogPost) => void
  repoConfig: RepoConfig
}

export function BlogSidebar({ posts, onPostSelect, repoConfig }: BlogSidebarProps) {
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
  const categories = Object.keys(postsByCategory)
  const totalPosts = posts.length

  return (
    <div className="space-y-6">
      {/* Blog Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Book className="w-5 h-5" />
            {repoConfig.blogTitle || `${repoConfig.owner}'s Blog`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total Posts</span>
            <span className="font-medium">{totalPosts}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Categories</span>
            <span className="font-medium">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>
          
          {repoConfig.blogDescription && (
            <p className="text-sm text-muted-foreground">
              {repoConfig.blogDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Categories and Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Folder className="w-4 h-4" />
                <h3 className="capitalize">{category}</h3>
                <span className="text-xs text-muted-foreground">
                  ({postsByCategory[category].length})
                </span>
              </div>
              <div className="ml-6 space-y-1">
                {postsByCategory[category].map((post) => (
                  <Button
                    key={post.path}
                    variant="ghost"
                    className="w-full justify-start text-left text-sm h-auto py-2 px-2"
                    onClick={() => onPostSelect(post)}
                  >
                    <span className="truncate">{post.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No posts found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}