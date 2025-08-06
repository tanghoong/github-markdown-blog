# GitHub Markdown Blog

A beautiful, fast, and simple blog system that reads markdown files directly from your GitHub repository. Perfect for developers who want to write in markdown and version control their content.

## Features

- 📝 **Markdown Support** - Write your posts in markdown
- 🗂️ **Category Organization** - Organize posts in folders as categories
- 🔍 **Search Functionality** - Find posts by title or content
- 📱 **Responsive Design** - Works on all device sizes
- ⚡ **Fast Loading** - Lightweight and optimized
- 🎨 **Beautiful Typography** - Optimized for reading

## Getting Started

### 1. Set Up Your Repository

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

### 2. Configure the Blog

When you first open the blog, you'll be prompted to configure your repository:

- **Repository Owner**: Your GitHub username or organization
- **Repository Name**: The name of your blog repository
- **Branch**: Usually "main" or "master"
- **Path**: The folder containing your posts (e.g., "contents")

### 3. Write Your Posts

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