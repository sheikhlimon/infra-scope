# RULES - Strictly Follow These

## Original Instructions
"Teach me while we build. Explain: architecture, why we choose each tool, folder structure, how frontend connects to backend, common mistakes, how this scales in production. Don't just give code — explain the thinking."

## Core Rules (NEVER BREAK THESE)

1. **ONE FILE AT A TIME** - Never implement multiple files in one response
2. **EXPLAIN FIRST** - Before writing code, explain WHAT we're doing and WHY
3. **COMMIT AFTER EACH FEATURE** - A feature = logical unit of work (1-3 related files)
4. **HUSKY HANDLES CHECKS** - Pre-commit hook runs lint+typecheck automatically
5. **READ PROGRESS BEFORE ACTING** - Always check `.claude/progress.md` first
6. **UPDATE PROGRESS AFTER ACTION** - Mark what's done, what's next
7. **ANSWER QUESTIONS** - Pause and explain when user asks
8. **TEACH MISTAKES** - Explain common pitfalls for each concept

## Comment Rules (IMPORTANT)
- **NO comments on self-explanatory code** - If code speaks for itself, no comment needed
- **Only comment WHY, not WHAT** - Don't comment obvious things
- **Comment complex logic only** - Tricky algorithms, business rules, non-obvious behavior
- **NO JSDoc** - No @param, @returns, @throws blocks unless it's a public API

### Examples:
❌ Bad: `const id = parseInt(req.params.id); // Parse id from params`
✅ Good: `// Admins see all systems, users only see their own` (explains WHY)
✅ Good: No comment on obvious code

## Before ANY Implementation

1. Read `.claude/progress.md` → What have we done?
2. Read relevant feature plan → What's the next step?
3. Explain the concept → What are we about to do?
4. Write ONE file → Just one
5. Explain the code → Walk through what we wrote
6. Complete the feature → Finish all related files
7. Git commit → Husky runs lint+typecheck automatically
8. Update progress → Mark it done

## Git Commit Format

```
feat: one liner description
```

No grammar worries. Short and descriptive.

## Forbidden

- ❌ Multiple files in one response
- ❌ Skipping explanation
- ❌ Implementing without teaching
- ❌ Moving ahead without user understanding

## Frontend UI Rules (MUST FOLLOW)

When building frontend components:

1. **Use shadcn components** - Button, Card, Input, Label, Badge, Table, Dialog, Toast
2. **Follow the color palette** - Use CSS variables, not arbitrary colors
3. **Use spacing scale** - 4, 6, 8, 12, 16, 24, 32 only
4. **Use typography scale** - xs, sm, base, lg, xl, 2xl, 3xl
5. **No arbitrary values** - `p-[13px]` is forbidden, use `p-4`
6. **No inline styles** - Use Tailwind classes
7. **Use cn() utility** - For conditional class merging
8. **Consistent patterns** - Use Card for containers, not div+border

### Anti-Patterns (AVOID - Looks AI-Generated):
❌ Generic blue/indigo everywhere - customize colors
❌ Perfectly centered hero with "Get Started" - be original
❌ Same border radius on everything - mix it up
❌ Default shadows on all cards - use sparingly
❌ Template nav bars (logo left, links right) - vary layouts
❌ Bland "Welcome to..." headings - show personality
❌ Gradient backgrounds everywhere - subtle or none
❌ Rounded corners on every element - sharp edges exist too
✅ Asymmetric layouts, mixed border radii, dark mode, micro-interactions, skeleton loaders, data density

See plan file for full UI Style Rules section.
