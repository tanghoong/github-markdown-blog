# Welcome to My Blog

This blog is a folder of markdown files in a git repository. There is no admin panel, no database, and no CMS — writing a post means creating a file, and publishing it means pushing a commit.

## How it works

Every push triggers a build that compiles these markdown files into plain HTML. By the time you load a page, nothing is left to fetch or render: no API calls, no client-side markdown parsing, and no JavaScript framework.

That is why pages appear instantly, and why the whole site works fine with JavaScript switched off.

## Zero configuration

A bare markdown file is a complete post. Everything else is inferred:

- The first `# Heading` becomes the title
- The first paragraph becomes the excerpt you see in the feed
- The parent folder becomes the category
- The date comes from the file's first commit

Frontmatter exists, but only for overriding those defaults — pinning a post, adding tags, or marking a draft.

## Organised by folders

Subfolders become categories automatically:

```
contents/
├── tech/
│   └── getting-started-with-react.md
├── personal/
│   └── my-journey-into-open-source.md
├── guides/
│   └── mastering-git-workflows.md
└── welcome.md
```

This post sits at the root, so it has no category. The others are filed under the folder they live in.

## Search

The search box above the feed queries an index built at compile time. It runs entirely in your browser against a static file, which is why there is no search server to go down.

## Why write this way

Keeping posts as files in git means the content outlives the tooling:

- **Version control** — every edit has a diff and a timestamp
- **Portability** — plain markdown moves to any other system
- **No lock-in** — the posts are readable without this site existing
- **Your editor** — write wherever you already write

## Ready to start?

Delete this post and add your own. Drop a `.md` file into `contents/`, push, and it will be live once the build finishes.
