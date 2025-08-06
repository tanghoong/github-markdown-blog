import { RepoConfig } from '../App'
import { BookOpen, Settings } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface BlogHeaderProps {
  repoConfig: RepoConfig
  onConfigChange: () => void
}

export function BlogHeader({ repoConfig, onConfigChange }: BlogHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={32} className="text-primary" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Blog
              </h1>
              <p className="text-sm text-muted-foreground">
                {repoConfig.owner}/{repoConfig.repo}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onConfigChange}
            className="gap-2"
          >
            <Settings size={16} />
            Change Repository
          </Button>
        </div>
      </div>
    </header>
  )
}