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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="gap-2 hover:bg-secondary"
            >
              <ArrowLeft size={16} />
              Back to Posts
            </Button>
            
            <a 
              href={getGitHubUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1"
            >
              View on GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <article>
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
              {post.title}
            </h1>
            <div className="flex justify-center">
              <Badge variant="outline">
                {post.path}
              </Badge>
            </div>
          </header>

          <Card className="p-8">
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-em:text-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-blockquote:border-l-accent prose-blockquote:border-l-4 prose-blockquote:pl-4
                prose-blockquote:italic prose-blockquote:text-muted-foreground
                prose-ul:text-foreground prose-ol:text-foreground
                prose-li:text-foreground prose-li:leading-relaxed"
              dangerouslySetInnerHTML={renderMarkdown(post.content)}
            />
          </Card>
        </article>
      </main>
    </div>
  )
}