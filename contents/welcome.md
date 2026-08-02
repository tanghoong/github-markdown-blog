---
title: Why this blog is a folder of markdown files
date: 2026-07-29
excerpt: No database, no CMS, no admin panel, no server. Not because those things are bad, but because every one of them is a cost I would keep paying long after the novelty of setting it up wore off.
---

This blog is a folder of markdown files in a git repository. There is no admin panel, no database, and no CMS. Writing a post means creating a file; publishing it means pushing a commit.

That is a deliberate choice, and it is worth explaining, because the obvious question is why anyone would give up a nice editor and a publish button in 2026.

## Complexity is a running cost, not a one-off

The reason is not that databases or content management systems are bad. It is that every piece of infrastructure you add is a cost you keep paying — long after the afternoon you enjoyed setting it up.

A CMS needs upgrading. A database needs backing up, and the backups need testing. A server needs patching, monitoring, and a plan for when it falls over at 2am. Plugins go unmaintained. Themes break on a major version. None of that is dramatic on any given day; it just quietly accumulates until the platform needs more attention than the writing does.

I have watched that happen to enough side projects to recognise the pattern. The blog stops being a place to write and becomes a thing to maintain, and then it stops being either.

So I removed the parts that require ongoing attention, and kept only the ones that do not.

## What is left

The whole system is three things: markdown files, git, and a build step.

Every push triggers a build that compiles the files into plain HTML. By the time you load a page, nothing is left to fetch or render — no API calls, no client-side markdown parsing, no JavaScript framework. That is why pages appear instantly, and why the site works fine with JavaScript switched off.

There is nothing running between deploys. Nothing to break at 2am, because there is nothing on.

## What that buys

**Version control for free.** Every edit has a diff, an author, and a timestamp. I can see what a post looked like a year ago without having installed a revision plugin.

**Portability.** Plain markdown moves to any other system. If I abandon this site tomorrow, the posts are still posts.

**No lock-in.** The files are readable without this site existing — in an editor, on GitHub, in a terminal. The content outlives the tooling, which is the only property I actually care about long-term.

**My own editor.** I write where I already write, with the keybindings I already know. No web textarea, no autosave firing mid-sentence.

**A security surface close to zero.** No login page, no upload handler, no database to inject into. The attack surface of a static file is a static file.

## What it costs

It would be dishonest to only list the wins.

There is no scheduled publishing — a post goes live when I push it, so "publish this tomorrow" means either pushing tomorrow or marking it a draft and pushing again. Every change triggers a full rebuild rather than updating one row. There is no rich editor, no drag-and-drop image upload, and no preview button that is not just running the site locally.

For a blog, all of that is fine. If I needed multiple authors with different permissions, or scheduled campaigns, or a hundred editors, I would want a real CMS and I would go and get one. The trade is only good because the requirements are small — and being honest about that is the point. Choosing simple infrastructure is a virtue only when the problem is genuinely simple.

## How it actually works

A bare markdown file is a complete post. Everything else is inferred:

- The first `# Heading` becomes the title
- The first paragraph becomes the excerpt in the feed
- The parent folder becomes the category
- The date comes from the file's first commit

Frontmatter exists, but only for overriding those defaults — setting an explicit date, adding tags, pinning a post, or marking a draft.

Subfolders become categories automatically, so organising the archive is just moving files around:

```
contents/
├── engineering/
│   └── a-post-about-systems.md   → category "engineering"
├── notes/
│   └── something-shorter.md      → category "notes"
└── welcome.md                    → no category
```

Search works the same way. The box above the feed queries an index built at compile time and runs entirely in your browser against a static file — which is why there is no search server to go down.

## The actual test

The measure of this setup is not how clever it is. It is whether I am still posting in a year.

Every piece of infrastructure I did not add is a reason the answer might be yes.
