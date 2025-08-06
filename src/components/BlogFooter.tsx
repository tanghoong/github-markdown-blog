import { RepoConfig } from '@/App'
import { GithubLogo, Code } from '@phosphor-icons/react'

interface BlogFooterProps {
  repoConfig: RepoConfig
}

export function BlogFooter({ repoConfig }: BlogFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {repoConfig.blogTitle || `${repoConfig.owner}/${repoConfig.repo}`}
            </p>
            {repoConfig.blogDescription && (
              <p className="text-xs text-muted-foreground mt-1">
                {repoConfig.blogDescription}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href={`https://github.com/${repoConfig.owner}/${repoConfig.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubLogo className="w-4 h-4" />
              View on GitHub
            </a>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Code className="w-3 h-3" />
              <span>Powered by GitHub Spark</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}