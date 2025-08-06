import { BlogPost, RepoConfig } from '@/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const categories = Object.keys(postsByCategory)
  const totalPosts = posts.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{repoConfig.blogTitle}</h2>
        <p className="text-sm text-muted-foreground">Total posts: {totalPosts}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.map((category) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-medium mb-2">
                {category} ({postsByCategory[category].length})
              </h3>
              <div className="space-y-1">
                {postsByCategory[category].map((post) => (
                  <Button
                    key={post.path}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-1 px-2"
                    onClick={() => onPostSelect(post)}
                  >
                    {post.title}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
