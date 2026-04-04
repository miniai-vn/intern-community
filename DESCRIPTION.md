# feat(social): Add comments system, emoji picker, and dark mode

## 🎯 Mục tiêu bạn muốn giải quyết

Xây dựng hệ thống **Social** hoàn chỉnh để tăng tương tác cộng đồng trên Intern Community Hub, bao gồm:

1. **Comments/Discussion System**: Cho phép user thảo luận về modules với nested replies
2. **Emoji Picker**: Hỗ trợ insert emoji vào comments tại vị trí cursor
3. **Dark Mode**: Theme toggle để cải thiện trải nghiệm người dùng
4. **Social Activity Feed**: Hiển thị hoạt động mới nhất (comments, votes, submissions)

**Vấn đề trước khi thực hiện:**
- Không có cách nào để user trao đổi về modules
- Thiếu tính năng social engagement
- Giao diện chỉ có light theme
- Không có visibility về community activity

## 🛠️ Cách bạn triển khai

### 1. Database Schema (Prisma)
- Thêm `Comment` model với self-relation cho nested replies
- Relations: `User ↔ Comment`, `MiniApp ↔ Comment`, `Comment ↔ replies`
- Constraints: Single-level nesting only (no reply to reply)

### 2. Backend API
**Created files:**
- `src/app/api/comments/route.ts` - GET (list), POST (create)
- `src/app/api/comments/[id]/route.ts` - PATCH (edit), DELETE (delete)

**Validation:**
- Zod schemas: `createCommentSchema`, `updateCommentSchema`
- Max length: 1000 characters
- Authorization: Owner can edit/delete, Admin can delete any

### 3. Frontend Components

**Comments System:**
- `CommentForm`: Form với emoji picker, character counter, validation
- `CommentCard`: Display comment với avatar, actions (reply/edit/delete), TimeAgo
- `CommentList`: Container với optimistic updates
- `useComments` hook: State management với React 19 `useOptimistic`

**Emoji Picker:**
- 4 categories: Smileys (😊), Gestures (👍), Hearts (❤️), Objects (🎉)
- 48 emoji tổng cộng
- Insert tại cursor position trong textarea
- Toggle button + close button

**Dark Mode:**
- `ThemeProvider`: Context với localStorage persistence
- `ThemeToggle`: Button với moon/sun icons
- Class-based dark mode: Tailwind `@custom-variant dark`
- System preference detection
- SSR-safe: Fallback trong `useTheme()` để tránh crash

**Social Activity Feed:**
- `SocialCard`: Server component fetch activities
- `SocialActivityFeed`: UI component display feed
- Merge 3 types: comments, votes, submissions
- Show on homepage sidebar

### 4. UI/UX Improvements
- Updated ALL components với `dark:` variants:
  - Navbar, ModuleCard, VoteButton, RepoLinks
  - CommentCard, CommentList, SocialActivityFeed
  - Homepage, Module detail page
- TimeAgo component: Client-only rendering để tránh hydration mismatch
- Responsive design: Grid layout homepage (2 cols modules + 1 col social)

### 5. Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Single-level nested replies | Giữ UI đơn giản, dễ follow conversation |
| Optimistic updates | UX tốt hơn, không phải chờ server response |
| Client-side time display | Tránh hydration mismatch (Date.now() differs server/client) |
| Class-based dark mode | Tailwind v4 approach với `@custom-variant` |
| No external emoji lib | Giữ bundle size nhỏ, 48 emoji đủ dùng |
| Fallback trong useTheme | SSR-safe, không crash khi render ngoài provider |

## ✅ Cách bạn kiểm thử

### Manual Testing
1. **Comments Flow:**
   - ✅ Đăng bình luận mới trên module detail page
   - ✅ Reply vào comment (1 level)
   - ✅ Edit comment của chính mình
   - ✅ Delete comment (owner + admin)
   - ✅ Validation: max 1000 chars, trim whitespace
   - ✅ Error handling: unauthorized, not found

2. **Emoji Picker:**
   - ✅ Click 😊 button mở picker
   - ✅ Click emoji → insert tại cursor position
   - ✅ Close picker sau khi chọn/click close
   - ✅ Character count cập nhật sau khi insert

3. **Dark Mode:**
   - ✅ Toggle moon/sun icon trên navbar
   - ✅ Theme persist sau reload
   - ✅ Tất cả components hiển thị đúng dark colors
   - ✅ System preference detection (nếu chưa chọn)

4. **Social Activity Feed:**
   - ✅ Hiển thị 8 activities gần nhất
   - ✅ Sort theo thời gian
   - ✅ Link đến module detail đúng
   - ✅ TimeAgo cập nhật mỗi phút

### Automated Testing
```bash
# Unit tests cho validation (20 tests)
pnpm test __tests__/comments.test.ts

# Build check
pnpm build

# Type check
pnpm tsc --noEmit
```

**Test results:**
- ✅ Comment validation tests: PASS (20/20)
- ✅ TypeScript compilation: No errors
- ✅ No console errors in browser
- ✅ No hydration mismatches

### Browser Testing
- ✅ Chrome, Firefox, Edge (latest)
- ✅ Responsive: Desktop (1920px), Tablet (768px), Mobile (375px)
- ✅ Dark/Light mode on all screen sizes

## 🤖 Bạn đã dùng AI như thế nào trong quá trình thực hiện

### 1. Planning & Design
- **GitHub Copilot Chat**: Đề xuất architecture cho comments system
- **Prompt**: "Design a comments system with nested replies for Next.js 15 App Router"
- **Output**: Schema design, API structure, component hierarchy
- **Review**: Chỉnh lại single-level nesting thay vì unlimited depth

### 2. Code Generation
**AI-assisted components:**
- `CommentForm` với emoji picker logic (80% AI-generated, 20% manual tuning)
- `ThemeProvider` với localStorage + SSR handling (70% AI, 30% fix hydration issues)
- Tailwind dark mode classes (90% AI suggestions, copy-paste và test)

**Process:**
1. Viết prompt mô tả chi tiết component cần
2. AI generate code skeleton
3. Review + test trong browser
4. Fix bugs + refine UX
5. Add type safety + validation

### 3. Problem Solving
**Issue**: Hydration mismatch với Date.now() và theme toggle
- **AI suggestion**: Client-only rendering với useEffect
- **Result**: Created TimeAgo component, ThemeToggle với mounted check

**Issue**: useTheme crash khi Navbar render trước ThemeProvider
- **AI suggestion**: Add fallback trong useTheme hook
- **Result**: Return safe default thay vì throw error

### 4. Testing & Documentation
- AI tạo test cases cho validation schemas
- AI suggest edge cases (reply to reply, empty content, max length)
- Generate PR description structure (sau đó tôi điền chi tiết)

### 5. Tỷ lệ AI vs Manual
- **AI-generated code**: ~60%
- **Manual review & fixes**: ~30%
- **Manual testing & refinement**: ~10%

**Kinh nghiệm rút ra:**
- ✅ AI giúp bootstrap nhanh components, schemas, types
- ✅ Cần review kỹ AI code, đặc biệt async/SSR logic
- ✅ Manual testing vẫn quan trọng nhất để catch edge cases
- ⚠️ AI đôi khi suggest deprecated patterns → cần check docs

---

## 📦 Files Changed

### New Files (12)
```
src/components/theme-provider.tsx       # ThemeProvider + ThemeToggle
src/components/comment-form.tsx         # Form với emoji picker
src/components/comment-card.tsx         # Display comment
src/components/comment-list.tsx         # Container
src/components/social-activity-feed.tsx # Activity feed UI
src/components/social-card.tsx          # Server component
src/components/repo-links.tsx           # GitHub/Demo links
src/hooks/use-comments.ts               # State management
src/app/api/comments/route.ts           # GET/POST
src/app/api/comments/[id]/route.ts      # PATCH/DELETE
__tests__/comments.test.ts              # Validation tests
PR_DESCRIPTION.md                       # This file
```

### Modified Files (11)
```
prisma/schema.prisma                    # Added Comment model
src/lib/validations.ts                  # Comment schemas
src/types/index.ts                      # Comment types
src/app/layout.tsx                      # ThemeProvider wrapper
src/app/globals.css                     # Dark mode CSS
src/app/page.tsx                        # Social sidebar + dark mode
src/app/modules/[slug]/page.tsx         # Redesign + comments + dark
src/components/navbar.tsx               # ThemeToggle + dark
src/components/module-card.tsx          # Dark mode
src/components/vote-button.tsx          # Dark mode
next.config.ts                          # GitHub avatars domain
```

## 🎨 Screenshots

### Light Mode
- Homepage với Social Activity Feed
- Module detail với Comments section
- Emoji Picker opened

### Dark Mode
- Toàn bộ UI với dark theme
- Comment form với emoji picker
- Activity feed trong dark mode

## 🐛 Known Issues & Workarounds

### EPERM on Windows
**Issue**: `Error: EPERM: operation not permitted, rename .next/...`
**Cause**: Antivirus hoặc process khác giữ file lock
**Workaround**:
```bash
# Stop dev server
# Delete .next folder
Remove-Item -Recurse -Force .next
# Restart dev
pnpm dev
```

### Theme flash on first load
**Issue**: Brief light theme flash before dark loads
**Status**: Acceptable - localStorage load async
**Future**: Add script tag in <head> để load theme trước

---

## 🚀 Ready to Review

- ✅ Code complete và tested
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ All tests passing
- ✅ Responsive design checked
- ✅ Dark mode fully supported
- ✅ PR description complete

**Estimated difficulty**: 🔴 Hard (1-3 days)  
**Actual time**: ~6-8 hours (với AI assistance)

**Tag**: `difficulty: hard`, `intern-challenge`
