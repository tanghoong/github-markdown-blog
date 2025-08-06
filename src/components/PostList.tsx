import { BlogPost } from '../App'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from '@phosphor-icons/react'

interface PostListProps {
  posts: BlogPost[]
  onPostSelect: (post: BlogPost) => void
}

export function PostList({ posts, onPostSelect }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText size={64} className="text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-serif font-semibold mb-2">No posts found</h2>
        <p className="text-muted-foreground">
          Add some markdown files to your repository to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Latest Posts</h2>
        <p className="text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''} available
        </p>
      </div>
      
      <div className="grid gap-6">
        {posts.map((post) => (
          <Card 
            key={post.sha}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onPostSelect(post)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-serif font-semibold mb-2 text-foreground hover:text-accent transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.path}
                  </Badge>
                </div>
              </div>
              <FileText size={24} className="text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}