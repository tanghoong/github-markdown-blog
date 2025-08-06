import { BlogPost, RepoConfig } from '../App'
import { ArrowLeft, ExternalLink } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { marked } from 'marked'

interface PostReaderProps {
  post: BlogPost
  onBack: () => void
  repoConfig: RepoConfig
}

export function PostReader({ post, onBack, repoConfig }: PostReaderProps) {
  const getGitHubUrl = () => {
    return `https://github.com/${repoConfig.owner}/${repoConfig.repo}/blob/${repoConfig.branch || 'main'}/${post.path}`
  }

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="gap-2 hover:bg-secondary"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Posts</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <a 
              href={getGitHubUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1"
            >
              <span className="hidden sm:inline">View on GitHub</span>
              <span className="sm:hidden">GitHub</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <article>
          <header className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4 text-foreground leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              {post.category && (
                <Badge variant="secondary">
                  {post.category}
                </Badge>
              )}
              <Badge variant="outline">
                {post.path}
              </Badge>
            </div>
          </header>

          <Card className="p-4 sm:p-6 lg:p-8">
            <div 
              className="prose prose-sm sm:prose lg:prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-em:text-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto
                prose-blockquote:border-l-accent prose-blockquote:border-l-4 prose-blockquote:pl-4
                prose-blockquote:italic prose-blockquote:text-muted-foreground
                prose-ul:text-foreground prose-ol:text-foreground
                prose-li:text-foreground prose-li:leading-relaxed
                prose-img:rounded-lg prose-img:shadow-sm"
              dangerouslySetInnerHTML={renderMarkdown(post.content)}
            />
          </Card>
        </article>
      </main>
    </div>
  )
}