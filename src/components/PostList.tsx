import { useState } from 'react'
import { BlogPost } from '../App'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchBar } from './SearchBar'
import { FileText, Folder, FolderOpen, MagnifyingGlass } from '@phosphor-icons/react'

interface PostListProps {
  posts: BlogPost[]
  onPostSelect: (post: BlogPost) => void
}

export function PostList({ posts, onPostSelect }: PostListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique categories
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
  
  // Filter posts by search query
  const searchFilteredPosts = searchQuery 
    ? posts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
        const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase())
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
        return titleMatch || contentMatch || excerptMatch
      })
    : posts
  
  // Filter posts by category
  const filteredPosts = selectedCategory 
    ? searchFilteredPosts.filter(post => post.category === selectedCategory)
    : searchFilteredPosts

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Reset category filter when searching
    if (query && selectedCategory) {
      setSelectedCategory(null)
    }
  }

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent/20 text-accent-foreground rounded px-0.5">
          {part}
        </mark>
      ) : part
    )
  }

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
        <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2">Latest Posts</h2>
        <p className="text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg mx-auto mb-8">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search posts by title or content..."
        />
        {searchQuery && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && !searchQuery && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="mb-2 text-xs sm:text-sm"
          >
            <FolderOpen size={14} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">All Categories</span>
            <span className="sm:hidden">All</span>
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="mb-2 capitalize text-xs sm:text-sm"
            >
              <Folder size={14} className="mr-1 sm:mr-2" />
              {category}
            </Button>
          ))}
        </div>
      )}
      
      <div className="grid gap-4 lg:gap-6">
        {filteredPosts.map((post) => (
          <Card 
            key={post.sha}
            className="p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onPostSelect(post)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground hover:text-accent transition-colors truncate">
                    {searchQuery ? highlightSearchTerm(post.title, searchQuery) : post.title}
                  </h3>
                  {post.category && (
                    <Badge variant="outline" className="text-xs capitalize self-start">
                      {post.category}
                    </Badge>
                  )}
                </div>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-3 leading-relaxed text-sm sm:text-base line-clamp-3">
                    {searchQuery ? highlightSearchTerm(post.excerpt, searchQuery) : post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs truncate max-w-[200px]">
                    {post.path.split('/').pop()}
                  </Badge>
                </div>
              </div>
              <FileText size={20} className="text-muted-foreground flex-shrink-0 mt-1 sm:w-6 sm:h-6" />
            </div>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && selectedCategory && !searchQuery && (
        <div className="text-center py-16">
          <Folder size={48} className="text-muted-foreground mx-auto mb-4 sm:w-16 sm:h-16" />
          <h3 className="text-lg font-serif font-semibold mb-2">No posts in this category</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            The "{selectedCategory}" category doesn't contain any posts yet.
          </p>
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            Show All Posts
          </Button>
        </div>
      )}

      {filteredPosts.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <MagnifyingGlass size={48} className="text-muted-foreground mx-auto mb-4 sm:w-16 sm:h-16" />
          <h3 className="text-lg font-serif font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
            No posts match your search for "{searchQuery}". Try different keywords or check your spelling.
          </p>
          <Button variant="outline" onClick={() => handleSearch('')}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  )
}