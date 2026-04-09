# Fix Slow GET /login (Infinite Redirect Loop)

## Steps:
- [ ] 1. Create TODO.md (done)
- [x] 2. Read signup/page.tsx & analyzed (already uses requireUnauth(), good)
- [x] 3. Edit login/page.tsx: Replace requireAuth() with requireUnauth()
- [x] 4. Edit signup/page.tsx similarly if needed (no change required, already correct)
- [x] 5. Test: npm run dev, visit /login (expect fast 200, no 307 loop) - Fixed! No more infinite redirects/DB loops.
- [ ] 6. Update TODO.md completed
- [ ] 7. attempt_completion
