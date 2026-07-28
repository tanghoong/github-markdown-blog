/**
 * Removes the first top-level `# Heading` from a markdown body.
 *
 * The heading is promoted to the post title by `src/lib/posts.ts`, so leaving it
 * in the body would render it twice. Only the first h1 is removed, and only when
 * no explicit `title` was set in frontmatter.
 */
export function remarkStripLeadingHeading() {
  return (tree, file) => {
    if (file?.data?.astro?.frontmatter?.title) return

    const index = tree.children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1
    )
    if (index !== -1) tree.children.splice(index, 1)
  }
}
