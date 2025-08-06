import { useState } from 'react'
import { BlogPost } from '../App'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Folder, FolderOpen } from '@phosphor-icons/react'

interface PostListProps {
  posts: BlogPost[]
  onPostSelect: (post: BlogPost) => void
}

export function PostList({ posts, onPostSelect }: PostListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
  
  // Filter posts by category
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory)
    : posts

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

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="mb-2"
          >
            <FolderOpen size={16} className="mr-2" />
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="mb-2 capitalize"
            >
              <Folder size={16} className="mr-2" />
              {category}
            </Button>
          ))}
        </div>
      )}
      
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card 
            key={post.sha}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onPostSelect(post)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-serif font-semibold text-foreground hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  {post.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {post.category}
                    </Badge>
                  )}
                </div>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.path.split('/').pop()}
                  </Badge>
                </div>
              </div>
              <FileText size={24} className="text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && selectedCategory && (
        <div className="text-center py-16">
          <Folder size={64} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-serif font-semibold mb-2">No posts in this category</h3>
          <p className="text-muted-foreground mb-4">
            The "{selectedCategory}" category doesn't contain any posts yet.
          </p>
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            Show All Posts
          </Button>
        </div>
      )}
    </div>
  )
}