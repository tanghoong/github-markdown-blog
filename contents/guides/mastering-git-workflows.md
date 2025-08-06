# Mastering Git Workflows

Git is the backbone of modern software development, but many developers only scratch the surface of its capabilities. Understanding advanced Git workflows can dramatically improve your productivity and collaboration effectiveness.

## Understanding Git Fundamentals

Before diving into workflows, ensure you understand these core concepts:

### The Three States

Git files exist in three states:
- **Working Directory**: Your local file system
- **Staging Area**: Files prepared for commit
- **Repository**: Committed changes in your Git history

### Branches Are Cheap

Git branches are lightweight pointers to commits:
- Creating branches is fast and uses minimal disk space
- Switching between branches is nearly instantaneous
- Merging branches combines their histories

### Commits Are Snapshots

Each commit is a complete snapshot of your project:
- Git doesn't store diffs between versions
- This enables powerful operations like cherry-picking and rebasing
- Understanding this helps with advanced Git operations

## Popular Git Workflows

### Git Flow

A structured approach with specific branch types:

```
main (production-ready)
├── develop (integration branch)
│   ├── feature/user-authentication
│   ├── feature/payment-processing
│   └── feature/dashboard-redesign
├── release/v2.1.0
└── hotfix/critical-security-patch
```

**Branch Types:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `release/*`: Preparing releases
- `hotfix/*`: Critical fixes to production

**When to Use:**
- Large teams with regular releases
- Applications with long-lived feature branches
- Projects requiring strict release management

### GitHub Flow

A simpler workflow for continuous deployment:

```
main (always deployable)
├── feature/add-search-functionality
├── feature/update-user-profile
└── bugfix/fix-login-redirect
```

**Process:**
1. Create feature branch from `main`
2. Develop and commit changes
3. Open pull request
4. Review and discuss
5. Merge to `main` and deploy

**When to Use:**
- Continuous deployment environments
- Smaller teams or projects
- Web applications with frequent releases

### GitLab Flow

Combines elements of Git Flow and GitHub Flow:

```
main (development)
├── pre-production (staging)
├── production (live)
└── feature/new-checkout-flow
```

**Key Features:**
- Environment-specific branches
- Upstream merging strategy
- Release tags for versioning

### Forking Workflow

Common for open source projects:

```
Original Repository (upstream)
├── Your Fork (origin)
│   └── feature/improve-documentation
└── Pull Request back to upstream
```

**Process:**
1. Fork the repository
2. Clone your fork
3. Create feature branch
4. Push to your fork
5. Create pull request to original repo

## Advanced Git Techniques

### Interactive Rebase

Rewrite commit history for clarity:

```bash
git rebase -i HEAD~3
```

Options during interactive rebase:
- `pick`: Keep commit as-is
- `reword`: Change commit message
- `edit`: Modify commit content
- `squash`: Combine with previous commit
- `drop`: Remove commit entirely

### Cherry-Picking

Apply specific commits to different branches:

```bash
git cherry-pick abc123def456
```

Useful for:
- Applying hotfixes to multiple branches
- Moving commits between branches
- Creating release branches from selected features

### Bisect for Bug Hunting

Find the commit that introduced a bug:

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
# Git will check out commits to test
git bisect good  # or 'git bisect bad'
# Repeat until Git identifies the problematic commit
git bisect reset
```

### Stashing Work in Progress

Save uncommitted changes temporarily:

```bash
git stash push -m "Work in progress on login feature"
git stash list
git stash apply stash@{0}
git stash drop stash@{0}
```

## Collaboration Best Practices

### Commit Message Standards

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tooling changes

Example:
```
feat(auth): add two-factor authentication

Implement TOTP-based 2FA using speakeasy library.
Users can now enable 2FA in their profile settings.

Closes #123
```

### Branch Naming Conventions

Establish clear naming patterns:

```
feature/TICKET-123-user-authentication
bugfix/TICKET-456-fix-payment-processing
hotfix/critical-security-vulnerability
release/v2.1.0
```

### Code Review Guidelines

**For Authors:**
- Keep pull requests small and focused
- Write descriptive titles and descriptions
- Test your changes thoroughly
- Address feedback promptly

**For Reviewers:**
- Review promptly (within 24 hours)
- Be constructive and specific
- Test the changes locally when possible
- Approve when satisfied with quality

### Merge Strategies

Choose the right merge strategy:

**Merge Commit:**
```bash
git merge feature-branch
```
- Preserves branch history
- Shows when features were integrated
- Can create cluttered history

**Squash and Merge:**
```bash
git merge --squash feature-branch
git commit
```
- Clean linear history
- Loses individual commit details
- Good for feature branches

**Rebase and Merge:**
```bash
git rebase main
git checkout main
git merge feature-branch
```
- Linear history without merge commits
- Preserves individual commits
- Requires careful handling of conflicts

## Handling Common Scenarios

### Fixing Mistakes

**Undo last commit (keep changes):**
```bash
git reset --soft HEAD~1
```

**Undo last commit (discard changes):**
```bash
git reset --hard HEAD~1
```

**Fix commit message:**
```bash
git commit --amend -m "Corrected commit message"
```

**Remove file from staging:**
```bash
git reset HEAD filename
```

### Resolving Conflicts

When merge conflicts occur:

1. **Identify conflicted files:**
   ```bash
   git status
   ```

2. **Edit files to resolve conflicts:**
   Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)

3. **Mark as resolved:**
   ```bash
   git add conflicted-file.js
   ```

4. **Complete the merge:**
   ```bash
   git commit
   ```

### Working with Remote Repositories

**Add remote:**
```bash
git remote add upstream https://github.com/original/repo.git
```

**Sync fork with upstream:**
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

**Push to different remote:**
```bash
git push origin feature-branch
git push upstream main
```

## Git Hooks and Automation

### Pre-commit Hooks

Automate code quality checks:

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linter
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix errors before committing."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix before committing."
  exit 1
fi
```

### Commit Message Hooks

Enforce commit message standards:

```bash
#!/bin/sh
# .git/hooks/commit-msg

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Use: type(scope): description"
    exit 1
fi
```

## Performance and Troubleshooting

### Large Repository Performance

**Use shallow clones:**
```bash
git clone --depth 1 https://github.com/user/repo.git
```

**Sparse checkout for large repos:**
```bash
git config core.sparseCheckout true
echo "src/*" > .git/info/sparse-checkout
git read-tree -m -u HEAD
```

**Git LFS for large files:**
```bash
git lfs track "*.psd"
git add .gitattributes
git add design.psd
git commit -m "Add design file with LFS"
```

### Troubleshooting Common Issues

**Detached HEAD state:**
```bash
git checkout -b new-branch-name
git checkout main
git merge new-branch-name
```

**Corrupted repository:**
```bash
git fsck --full
git gc --aggressive
```

**Remove sensitive data:**
```bash
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch sensitive-file.txt' \
  --prune-empty --tag-name-filter cat -- --all
```

## Conclusion

Mastering Git workflows goes beyond knowing basic commands. It's about understanding how to structure collaboration, maintain clean history, and leverage Git's powerful features to enhance your development process.

Choose workflows that match your team size, deployment strategy, and project complexity. Start with simpler workflows and evolve them as your team and project grow.

Remember that Git is a tool to serve your development process, not the other way around. The best workflow is the one that helps your team collaborate effectively while maintaining code quality and project history.