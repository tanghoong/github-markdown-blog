import { RepoConfig } from '../App'
import { BookOpen, Gear, ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface BlogHeaderProps {
  repoConfig: RepoConfig
  onConfigChange: () => void
  onRefresh?: () => void
}

export function BlogHeader({ repoConfig, onConfigChange, onRefresh }: BlogHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={32} className="text-primary" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {repoConfig.blogTitle || `${repoConfig.owner}'s Blog`}
              </h1>
              {repoConfig.blogDescription ? (
                <p className="text-sm text-muted-foreground">
                  {repoConfig.blogDescription}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {repoConfig.owner}/{repoConfig.repo}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="gap-2"
              >
                <ArrowClockwise size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onConfigChange}
              className="gap-2"
            >
              <Gear size={16} />
              <span className="hidden sm:inline">Change Repository</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}