import { useState } from 'react'
import { RepoConfig } from '../App'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GitBranch, BookOpen } from '@phosphor-icons/react'

interface RepoSetupProps {
  onConfigSubmit: (config: RepoConfig) => void
}

export function RepoSetup({ onConfigSubmit }: RepoSetupProps) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [path, setPath] = useState('contents')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!owner.trim() || !repo.trim()) {
      return
    }

    setIsSubmitting(true)
    
    const config: RepoConfig = {
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      path: path.trim()
    }
    
    onConfigSubmit(config)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen size={48} className="text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2">GitHub Markdown Blog</h1>
          <p className="text-muted-foreground">
            Connect your GitHub repository to start blogging with markdown files.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="owner">Repository Owner</Label>
            <Input
              id="owner"
              type="text"
              placeholder="username or organization"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repo">Repository Name</Label>
            <Input
              id="repo"
              type="text"
              placeholder="my-blog"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch (optional)</Label>
            <Input
              id="branch"
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path to Posts (optional)</Label>
            <Input
              id="path"
              type="text"
              placeholder="contents/"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Folder containing your blog posts. Subfolders will be treated as categories.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isSubmitting || !owner.trim() || !repo.trim()}
          >
            <GitBranch size={16} />
            {isSubmitting ? 'Connecting...' : 'Connect Repository'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This will access public repositories only. 
              Organize your markdown files in the "contents" folder with subfolders as categories 
              (e.g., contents/tech/, contents/personal/).
            </p>
          </div>
          
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-md">
            <p className="text-sm text-foreground">
              <strong>Example:</strong> For repository "johndoe/my-blog" with posts in "contents/", use:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• Owner: johndoe</li>
              <li>• Repository: my-blog</li>
              <li>• Path: contents</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}