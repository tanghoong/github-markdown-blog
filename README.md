# GitHub Markdown Blog

A beautiful, fast, and simple blog system that reads markdown files from **GitHub repositories** or your **local file system**. Perfect for developers who want to write in markdown and version control their content, or work with local files directly.

## Features

- 📝 **Markdown Support** - Write your posts in markdown
- 🔄 **Dual Content Sources** - Use GitHub repositories OR local files
- 🗂️ **Category Organization** - Organize posts in folders as categories
- 🔍 **Search Functionality** - Find posts by title or content
- 📱 **Responsive Design** - Works on all device sizes
- ⚡ **Fast Loading** - Lightweight and optimized
- 🎨 **Beautiful Typography** - Optimized for reading
- 🔐 **Privacy-Focused** - Local files stay on your device (never uploaded)

## Getting Started

You can use this blog with either GitHub repositories or local files on your computer.

### Option 1: Using a GitHub Repository

#### 1. Set Up Your Repository

Create a GitHub repository with the following structure:

```
your-blog-repo/
├── contents/
│   ├── tech/
│   │   ├── getting-started-with-react.md
│   │   └── building-apis-with-typescript.md
│   ├── personal/
│   │   ├── my-journey-into-open-source.md
│   │   └── learning-in-public.md
│   └── welcome.md
```

#### 2. Configure the Blog

When you first open the blog, select the **GitHub** tab and configure:

- **Repository Owner**: Your GitHub username or organization
- **Repository Name**: The name of your blog repository
- **Branch**: Usually "main" or "master"
- **Path**: The folder containing your posts (e.g., "contents")
- **GitHub Token** (optional but recommended): Personal access token to avoid rate limits

#### 3. Write Your Posts

Create markdown files in your repository. The blog will:

- Use the first `# Heading` as the post title
- Generate excerpts from the first paragraph
- Treat folder names as categories
- Support all standard markdown features

### Option 2: Using Local Files

#### 1. Organize Your Files

Create a folder on your computer with markdown files:

```
my-blog/
├── tech/
│   ├── react-tips.md
│   └── web-performance.md
├── personal/
│   ├── career-journey.md
│   └── work-life-balance.md
└── welcome.md
```

#### 2. Configure the Blog

When you first open the blog, select the **Local Files** tab:

- Configure your blog title and description
- Click "Select Folder" to choose your markdown folder
- Your browser will prompt you to select a directory
- The blog will read your files directly (they stay on your device!)

#### 3. Benefits of Local Files

- ✅ **Privacy**: Files never leave your computer
- ✅ **No Setup**: No need for a GitHub account or repository
- ✅ **Instant**: Read files directly from your file system
- ✅ **Offline**: Works without internet connection
- ⚠️ **Browser Support**: Requires Chrome, Edge, or Opera (browsers with File System Access API)

### 3. Write Your Posts (Both Methods)

Create markdown files in your repository. The blog will:

- Use the first `# Heading` as the post title
- Generate excerpts from the first paragraph
- Treat folder names as categories
- Support all standard markdown features

## Repository Structure

### Recommended Structure

```
contents/
├── tech/                 # Category: Technology posts
│   ├── react-tips.md
│   └── web-performance.md
├── personal/             # Category: Personal posts
│   ├── career-journey.md
│   └── work-life-balance.md
└── tutorials/            # Category: Tutorial posts
    ├── git-basics.md
    └── deployment-guide.md
```

### Example Post Format

```markdown
# Your Post Title

This is the excerpt that will appear in the post list. Keep it concise and engaging.

## Section Heading

Your post content goes here. You can use all markdown features:

- Lists
- **Bold text**
- *Italic text*
- `Code snippets`
- Links and images

### Code Blocks

```javascript
function hello() {
  console.log("Hello, world!");
}
```

## Tips

- Use descriptive file names
- Include clear headings for better structure
- Keep excerpts under 150 characters
- Organize related posts in category folders
```

## Features

### Dual Content Sources

The blog now supports two ways to access your markdown content:

1. **GitHub Repositories** - Perfect for:
   - Version-controlled content
   - Collaboration via pull requests
   - Cloud backup
   - Sharing with teams
   - Public blogs

2. **Local Files** - Perfect for:
   - Private, personal content
   - Offline writing
   - No GitHub account needed
   - Instant access to local notes
   - Privacy-focused workflows

### Search

The blog includes powerful search functionality:
- Search by post title
- Search within post content
- Real-time search as you type
- Search result highlighting

### Categories

Organize your posts using folders:
- Each subfolder becomes a category
- Filter posts by category
- Category names are automatically formatted

### Responsive Design

The blog works perfectly on:
- Desktop computers
- Tablets
- Mobile phones
- E-readers

## Customization

The blog uses a clean, modern design that focuses on readability. The color scheme and typography are optimized for long-form reading.

### Browser Compatibility

- **GitHub Mode**: Works in all modern browsers
- **Local Files Mode**: Requires browsers with File System Access API support:
  - ✅ Google Chrome (86+)
  - ✅ Microsoft Edge (86+)
  - ✅ Opera (72+)
  - ❌ Firefox (not yet supported)
  - ❌ Safari (not yet supported)

For local file access in unsupported browsers, please use GitHub mode.

## Deployment

This blog can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Surge.sh**

Simply connect your repository and deploy!

## Contributing

If you find issues or want to suggest improvements, please:

1. Check the existing issues
2. Create a new issue with details
3. Submit a pull request if you have a fix

## License

This project is open source and available under the MIT License.

---

Happy blogging! 📝