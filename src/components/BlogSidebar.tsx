import { BlogPost, RepoConfig } from '@/App'
import { Button } from '@/components/ui/button'

  posts: BlogPost[]

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
  const totalPosts = pos
    }
    acc[category].push(post)
    return acc
  }, {} as Record<string, BlogPost[]>)

            {repoConfig.blogTi
  const categories = Object.keys(postsByCategory)
  const totalPosts = posts.length

          
    <div className="space-y-6">

      <Card>
          <CardTitle
            Categories
        </CardHeader>
          {categories.map((category) => (
              <div cla
                <h3 c
                  ({postsByCategory[categor
              </div>
                {postsByCategory[cat
                    key={post.path}
          </div>
          
                  </Button>
              </div>
          ))}
          {categories.length === 0 && (
              No po
          )}
      </Ca
  )





      </Card>










































  )
