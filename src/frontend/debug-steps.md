# Debug Steps - UI Not Updating

## Current Issue
- Code in `page.tsx` has toggle buttons for comparison mode
- Browser shows simple single-form UI (old version)
- This is a build/cache issue

## Fix Steps

### 1. Stop Development Server
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### 2. Clear Next.js Build Cache
```bash
cd src/frontend
rm -rf .next
rm -rf node_modules/.cache
```

### 3. Clear Browser Cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or open browser in Incognito/Private mode

### 4. Check for TypeScript Errors
```bash
cd src/frontend
npm run build
```

### 5. Restart Development Server
```bash
cd src/frontend
npm run dev
```

### 6. Test in Browser
- Go to http://localhost:3000
- You should now see toggle buttons above the form
- Click "Localization Comparison" to switch modes

## If Still Not Working

### Option A: Force Component Update
Add this debug line to `src/app/page.tsx` at the top of the component:

```typescript
export default function HomePage() {
  console.log('HomePage component loaded - v2.0'); // Add this line
  const router = useRouter();
  // ... rest of code
```

### Option B: Check Port Conflicts
Make sure nothing else is running on port 3000:
```bash
lsof -ti:3000
# If something is running, kill it:
kill -9 $(lsof -ti:3000)
```

### Option C: Try Different Port
```bash
cd src/frontend
npm run dev -- -p 3001
# Then visit http://localhost:3001
