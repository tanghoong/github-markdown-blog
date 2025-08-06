# GitHub Markdown Blog

A clean, elegant blog platform that transforms markdown files stored in your GitHub repository into a beautiful reading experience.

**Experience Qualities**: 
1. **Effortless** - Reading and navigation should feel natural and unobtrusive
2. **Focused** - Content takes center stage with minimal distractions
3. **Professional** - Clean typography and layout that respects the written word

**Complexity Level**: Light Application (multiple features with basic state)
- Fetches content from GitHub API, renders markdown, manages reading state

## Essential Features

**Markdown Post Rendering**
- Functionality: Fetches and renders markdown files from GitHub repo as blog posts
- Purpose: Transform static markdown into a dynamic reading experience
- Trigger: App loads or user navigates to specific post
- Progression: Load app → Fetch repo files → Display post list → Select post → Render content
- Success criteria: Markdown renders properly with syntax highlighting and proper formatting

**Post Navigation**
- Functionality: Browse between different markdown posts
- Purpose: Allow readers to discover and navigate content easily
- Trigger: User clicks on post in list or uses navigation controls
- Progression: View post list → Click post title → Read content → Return to list or navigate to next
- Success criteria: Smooth transitions between posts, clear navigation paths

**Repository Configuration**
- Functionality: Allow user to specify which GitHub repo contains their blog posts
- Purpose: Make the blog flexible to work with any GitHub repository
- Trigger: First time setup or when changing blog source
- Progression: Enter repo details → Validate access → Fetch content → Display posts
- Success criteria: Successfully connects to specified repository and loads markdown files

## Edge Case Handling

- **Network Failures**: Graceful fallback with retry mechanism and offline indicators
- **Invalid Markdown**: Error boundaries with helpful messages for malformed content
- **Empty Repository**: Welcoming empty state with setup instructions
- **Large Files**: Loading states and potential truncation for very large markdown files
- **Rate Limiting**: GitHub API rate limit handling with user feedback

## Design Direction

The design should feel like a premium reading experience - think Medium or Ghost - with clean typography, generous whitespace, and focus on readability over flashy interactions.

## Color Selection

Analogous (adjacent colors on color wheel) - Using warm grays and blues to create a calming, readable environment that doesn't compete with content.

- **Primary Color**: Deep charcoal `oklch(0.2 0.01 240)` - Communicates sophistication and readability
- **Secondary Colors**: Warm gray `oklch(0.85 0.005 60)` for backgrounds and subtle elements
- **Accent Color**: Soft blue `oklch(0.6 0.15 220)` for links and interactive elements
- **Foreground/Background Pairings**: 
  - Background (Cream White `oklch(0.98 0.01 60)`): Charcoal text `oklch(0.2 0.01 240)` - Ratio 15.8:1 ✓
  - Card (Pure White `oklch(1 0 0)`): Charcoal text `oklch(0.2 0.01 240)` - Ratio 17.9:1 ✓
  - Primary (Deep Charcoal `oklch(0.2 0.01 240)`): White text `oklch(1 0 0)` - Ratio 17.9:1 ✓
  - Accent (Soft Blue `oklch(0.6 0.15 220)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓

## Font Selection

Typography should convey literary sophistication with excellent readability - using a serif for headings to add character and sans-serif for body text for digital clarity.

- **Typographic Hierarchy**: 
  - H1 (Blog Title): Playfair Display Bold/32px/tight letter spacing
  - H2 (Post Titles): Playfair Display SemiBold/24px/normal spacing  
  - H3-H6 (Content Headers): Playfair Display Medium/18-14px/normal spacing
  - Body (Post Content): Inter Regular/16px/1.6 line height
  - Meta (Dates, Tags): Inter Medium/14px/normal spacing

## Animations

Subtle, purposeful animations that enhance the reading flow without drawing attention - gentle fades for content loading and smooth transitions between posts.

- **Purposeful Meaning**: Motion should feel like turning pages in a well-crafted book
- **Hierarchy of Movement**: Post transitions get primary animation focus, UI elements use minimal motion

## Component Selection

- **Components**: Card for post previews, Button for navigation, Skeleton for loading states, Badge for tags, Separator for content sections
- **Customizations**: Custom markdown renderer component, post preview cards with typography focus
- **States**: Buttons show subtle hover states, cards lift slightly on hover, loading skeletons match content structure
- **Icon Selection**: BookOpen for reading, ArrowLeft/Right for navigation, GitBranch for repo connection
- **Spacing**: Generous padding (p-8, p-6) for reading comfort, consistent gaps (gap-6, gap-4)
- **Mobile**: Single column layout, larger touch targets, optimized reading width on all screens