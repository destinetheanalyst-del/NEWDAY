# 🔧 Deployment Troubleshooting Guide

If you're still getting errors, follow this step-by-step troubleshooting guide.

---

## 🎯 Quick Diagnosis

### Run this command to check if files exist:
```bash
ls -la index.html src/main.tsx tsconfig.json
```

**Expected output:**
```
-rw-r--r-- 1 user user  XXX index.html
-rw-r--r-- 1 user user  XXX src/main.tsx
-rw-r--r-- 1 user user  XXX tsconfig.json
```

If any file shows "No such file or directory", that's the problem!

---

## 🚨 Error: "Failed to resolve /src/main.tsx"

### Solution 1: Verify Files Exist

1. **Check index.html exists at root:**
   ```bash
   cat index.html
   ```
   Should show the HTML with `<script type="module" src="/src/main.tsx"></script>`

2. **Check main.tsx exists:**
   ```bash
   cat src/main.tsx
   ```
   Should show the React bootstrap code.

### Solution 2: Force Recreate Files

If files are missing, copy these exactly:

**`/index.html`:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NEWDAY - Goods Tracking System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`/src/main.tsx`:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Solution 3: Check Vite Config

Your `vite.config.ts` should have:
```typescript
export default defineConfig({
  root: '.',  // This line is CRITICAL
  // ... rest of config
})
```

---

## 🚨 Error: "Cannot find module 'react'"

### Solution: Update package.json

Your `package.json` MUST have React in dependencies (not just peerDependencies):

```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    // ... other deps
  }
}
```

Then run:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🚨 Error: TypeScript errors

### Solution: Create tsconfig.json

**`/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`/tsconfig.node.json`:**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 🚨 Vercel: "Error: Command npm run build exited with 1"

### Solution: Clear Cache & Redeploy

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings"
   - Go to "General"
   - Scroll to "Build & Development Settings"
   - Verify:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Clear Cache:**
   - Settings → Data Cache → Clear All Cache

3. **Redeploy:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"
   - **IMPORTANT:** Select "Use existing Build Cache: NO"

---

## 🚨 Build works locally but fails on Vercel

### Possible Causes:

1. **Node version mismatch**
   - Add `"engines": { "node": ">=18.0.0" }` to package.json

2. **Environment variables**
   - Check if you need any env vars
   - Add them in Vercel Settings → Environment Variables

3. **Git not updated**
   - Make sure all files are committed:
   ```bash
   git status
   git add .
   git commit -m "Fix deployment config"
   git push
   ```

---

## 🧪 Nuclear Option: Start Fresh

If nothing works, try this complete reset:

```bash
# 1. Delete everything
rm -rf node_modules dist .vite package-lock.json

# 2. Verify files exist
ls index.html src/main.tsx tsconfig.json

# 3. If any missing, recreate them (see above)

# 4. Clean install
npm install

# 5. Test build
npm run build

# 6. If successful, commit and push
git add .
git commit -m "Complete deployment fix"
git push
```

---

## 📋 Deployment Checklist

Copy this and check each item:

```
Configuration Files:
[ ] /index.html exists
[ ] /src/main.tsx exists
[ ] /tsconfig.json exists
[ ] /tsconfig.node.json exists
[ ] /vite.config.ts has root: '.'
[ ] /.gitignore exists

Package.json:
[ ] react in dependencies
[ ] react-dom in dependencies
[ ] typescript in devDependencies
[ ] @types/react in devDependencies
[ ] scripts.build = "vite build"

Git:
[ ] All files committed
[ ] All files pushed to remote

Platform (Vercel/Netlify):
[ ] Build command: npm run build
[ ] Output directory: dist
[ ] Node version: 18 or higher
[ ] Build cache cleared

Local Test:
[ ] npm install works
[ ] npm run build works
[ ] npm run preview works
```

---

## 🔍 Debug Mode: Verbose Build

To see detailed build information:

```bash
# Add this temporarily to package.json scripts:
"build": "vite build --debug"

# Then run:
npm run build
```

This will show exactly what Vite is doing and where it fails.

---

## 📞 Still Having Issues?

### Collect This Information:

1. **Complete error message:**
   ```
   (Copy the FULL error from console/logs)
   ```

2. **File verification:**
   ```bash
   ls -la index.html
   ls -la src/main.tsx
   ls -la tsconfig.json
   cat package.json | grep "react"
   ```

3. **Build output:**
   ```bash
   npm run build 2>&1 | tee build.log
   ```

4. **Environment:**
   - Platform: Vercel / Netlify / Other
   - Node version: `node --version`
   - npm version: `npm --version`

---

## ✅ Success Indicators

You'll know it's working when you see:

### During Build:
```
vite v6.3.5 building for production...
✓ 547 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.css     84.23 kB
dist/assets/index-xyz789.js     723.45 kB
✓ built in 3.42s
```

### During Deploy:
```
Build completed successfully
Deployment completed
```

### In Browser:
- App loads without errors
- All features work
- No console errors

---

## 🎯 Most Common Fixes

90% of deployment issues are solved by:

1. ✅ Creating `/index.html` at root
2. ✅ Creating `/src/main.tsx`
3. ✅ Adding `react` to dependencies in package.json
4. ✅ Creating `tsconfig.json`
5. ✅ Clearing platform cache and redeploying

**If you did all 5, it SHOULD work!**

---

*Last updated: February 25, 2026*  
*For: GTS (NEWDAY) Goods Tracking System*
