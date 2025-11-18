# Usage Guide - GitHub Markdown Blog

This guide will help you get started with the GitHub Markdown Blog, whether you want to use GitHub repositories or local files.

## Quick Start

### For GitHub Users

1. **Prepare Your Repository**
   - Create a public GitHub repository
   - Add a `contents` folder (or any folder name you prefer)
   - Organize posts in subfolders (e.g., `tech`, `personal`, `guides`)
   - Write markdown files (.md or .markdown)

2. **Configure the Blog**
   - Open the blog application
   - Select the **GitHub** tab
   - Enter your repository details:
     - Owner: Your GitHub username (e.g., `johndoe`)
     - Repository: Your repo name (e.g., `my-blog`)
     - Branch: `main` (or `master`)
     - Path: `contents` (or your folder name)
   - *Optional*: Add a GitHub Personal Access Token to avoid rate limits

3. **Start Blogging**
   - Your posts will be automatically loaded
   - Use the search bar to find posts
   - Click on any post to read it
   - Use the refresh button to load new posts

### For Local File Users

1. **Organize Your Files**
   ```
   my-blog-folder/
   ├── tech/
   │   ├── react-tutorial.md
   │   └── css-tips.md
   ├── personal/
   │   └── my-story.md
   └── welcome.md
   ```

2. **Configure the Blog**
   - Open the blog application
   - Select the **Local Files** tab
   - Add blog title and description (optional)
   - Click **Select Folder**
   - Choose your markdown folder when prompted

3. **Start Blogging**
   - Your local files will be displayed
   - Edit files in your favorite editor
   - Click refresh to see updates
   - Your files stay on your computer (never uploaded)

## Writing Posts

### Basic Structure

```markdown
# Your Post Title

This is the first paragraph - it becomes the excerpt in the post list.
Keep it engaging and under 150 characters for best results.

## Introduction

Start your content here...

## Main Content

Add your main content with headings, lists, code blocks, etc.

### Subheading

More detailed content...

## Conclusion

Wrap up your post here.
```

### Best Practices

1. **Use Clear Titles**
   - The first `# Heading` becomes the post title
   - Make it descriptive and engaging

2. **Write Good Excerpts**
   - The first paragraph is your excerpt
   - Keep it under 150 characters
   - Make it compelling to encourage reading

3. **Organize with Categories**
   - Use subfolders for categories
   - Categories appear as filters in the blog
   - Examples: `tech`, `personal`, `tutorials`, `guides`

4. **Use Proper Markdown**
   ```markdown
   # Heading 1
   ## Heading 2
   ### Heading 3
   
   **Bold text**
   *Italic text*
   `inline code`
   
   ```javascript
   // Code block
   const hello = "world";
   ```
   
   - Bullet list
   - Another item
   
   1. Numbered list
   2. Second item
   
   [Link text](https://example.com)
   ```

## Features

### Search
- Type in the search bar to find posts
- Searches titles, excerpts, and content
- Results are highlighted
- Clear search to show all posts

### Categories
- Click category buttons to filter posts
- "All Categories" shows everything
- Categories based on folder structure

### Refresh
- Click the refresh button to reload posts
- Clears cache and fetches latest content
- Useful after adding new posts

### Post Reading
- Click any post card to read
- Back button returns to post list
- GitHub link shows source file (GitHub mode only)

## Tips & Tricks

### For GitHub Mode

1. **Avoid Rate Limits**
   - Add a Personal Access Token
   - Get 5,000 requests/hour instead of 60
   - Create token at: https://github.com/settings/tokens
   - Only needs `public_repo` permission

2. **Private Repositories**
   - Create a token with `repo` permission
   - Add it in the configuration
   - Access private repos safely

3. **Collaboration**
   - Others can suggest edits via Pull Requests
   - Track changes with Git history
   - Version control all content

### For Local Files Mode

1. **Browser Compatibility**
   - Use Chrome, Edge, or Opera
   - File System Access API required
   - Firefox/Safari: use GitHub mode instead

2. **Privacy**
   - Files never leave your computer
   - No internet connection needed
   - Perfect for private notes

3. **Quick Updates**
   - Edit files in your editor
   - Click refresh in the blog
   - See changes instantly

4. **Organization**
   - Create folders for categories
   - Use descriptive file names
   - Keep related posts together

## Troubleshooting

### "Repository not found"
- Check repository is public (or add token for private)
- Verify owner and repo names are correct
- Ensure repository exists

### "Rate limit exceeded"
- Add a GitHub Personal Access Token
- Wait 1 hour for rate limit reset
- Token increases limit to 5,000/hour

### "No markdown files found"
- Check the path is correct
- Ensure folder contains .md or .markdown files
- Verify folder exists in repository

### "Browser not supported" (Local Files)
- Use Chrome, Edge, or Opera
- Update browser to latest version
- Or switch to GitHub mode

### "Directory selection cancelled"
- Click "Select Folder" again
- Choose a folder with markdown files
- Grant permission when prompted

## Advanced Usage

### Multiple Blogs
- Use different configurations
- Switch between repositories
- Or switch between local and GitHub mode

### Custom Styling
- Fork the repository
- Modify CSS in `src/main.css`
- Customize colors in `src/styles/theme.css`

### Adding Features
- The code is open source
- Submit issues for features
- Contribute via Pull Requests

## Support

- Check the README for basic info
- Review this guide for detailed help
- Open an issue on GitHub for bugs
- Contribute improvements via PR

## Examples

### Example Repository Structure
```
my-blog/
├── contents/
│   ├── tech/
│   │   ├── web-development.md
│   │   ├── react-hooks.md
│   │   └── typescript-tips.md
│   ├── personal/
│   │   ├── my-journey.md
│   │   └── work-life-balance.md
│   ├── tutorials/
│   │   ├── git-basics.md
│   │   └── docker-intro.md
│   └── welcome.md
└── README.md
```

### Example Post
```markdown
# Getting Started with React Hooks

React Hooks revolutionized how we write React components. Learn the basics and best practices in this comprehensive guide.

## What are Hooks?

Hooks are functions that let you "hook into" React features from function components...

## useState Hook

The most basic hook is `useState`...

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## useEffect Hook

For side effects...

## Conclusion

Hooks make React development more intuitive...
```

---

Happy blogging! 🚀
