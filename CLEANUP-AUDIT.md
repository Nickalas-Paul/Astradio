# 🧹 ASTRADIO CODESPACE CLEANUP AUDIT

## 📊 **Current State Analysis**

### **✅ KEEP (Essential Scripts)**
```
Root package.json scripts:
├── build          # Builds all packages
├── dev            # Runs all dev servers in parallel  
├── lint           # Lints all packages
├── typecheck      # Type checks all packages
├── guard:deps     # Dependency guard
└── verify         # Runs lint + typecheck + guard:deps

API package.json scripts:
├── dev            # Development server with hot reload
├── build          # TypeScript compilation
├── start          # Production server
├── lint           # ESLint with max-warnings=0
├── typecheck      # TypeScript type checking
├── test           # Jest tests
└── test:watch     # Jest tests in watch mode

Web package.json scripts:
├── dev            # Next.js dev server
├── build          # Next.js build
├── start          # Next.js production server
├── lint           # ESLint with Next.js config
└── typecheck      # TypeScript type checking
```

### **❌ REMOVE (87+ files to clean up)**

#### **Root Level Test Files (40+ files)**
```
test-backend-health.ps1
test-audio-pipeline.ps1
test-performance-optimizations.js
test-landing-pipeline.html
test-deployment-success.html
test-audio-client-fix.html
test-backend-connection.js
test-cors-fix.html
test-audio-fix.ps1
audio-debug-test.html
debug-audio-simple.ps1
debug-audio-immediate.ps1
test-production-readiness.ps1
test-file-storage-clean.ps1
test-file-storage.ps1
test-music-generator-clean.ps1
test-music-generator.ps1
test-complete-user-ecosystem.ps1
test-narration.ps1
test-phase2.ps1
test-phase5-melodic.ps1
test-phase5-simple.ps1
test-phase6-export.ps1
test-core.js
```

#### **Duplicate/Conflicting Files**
```
.eslintrc.cjs                    # Remove (use eslint.config.js)
package-lock.json                # Remove (use pnpm-lock.yaml)
apps/api/package-lock.json       # Remove
apps/web/package-lock.json       # Remove
```

#### **Build Artifacts**
```
out.wav                          # Remove
apps/api/test.wav               # Remove
apps/api/test.ogg               # Remove
apps/api/test-final-audio.wav   # Remove
apps/api/test-enhanced-audio.wav # Remove
apps/api/test-audio-2.wav       # Remove
apps/api/test-audio.wav         # Remove
apps/web/test.ogg               # Remove
```

#### **Deployment Scripts (Consolidate)**
```
deploy-simple.ps1               # Keep only one deployment script
deploy-unified.ps1              # Remove
deploy-final-decoupled.ps1      # Remove
deploy-now.ps1                  # Remove
deploy-render-api.ps1           # Move to scripts/
deploy.ps1                      # Remove
force-render-redeploy.ps1       # Remove
```

#### **Documentation Files (Archive)**
```
*.md files (40+ files)          # Move to docs/ folder
```

### **🔄 REORGANIZE (Better Structure)**

#### **Create New Directory Structure**
```
astradio/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── astro-core/
│   ├── audio-mappings/
│   ├── core/
│   ├── shared/
│   └── types/
├── scripts/                    # All deployment scripts
├── docs/                       # All documentation
├── temp/                       # Temporary files
└── tools/                      # Build tools
```

## 🎯 **CLEANUP PHASES**

### **Phase 1: Essential Cleanup (Do Now)**
1. Remove all `test-*.ps1` files from root
2. Remove all `test-*.js` files from root  
3. Remove all `test-*.html` files from root
4. Remove all `debug-*.ps1` files from root
5. Remove all `debug-*.html` files from root
6. Remove `package-lock.json` files
7. Remove `.eslintrc.cjs`
8. Remove audio files from wrong locations

### **Phase 2: Consolidation (After Phase 1)**
1. Move deployment scripts to `scripts/`
2. Move documentation to `docs/`
3. Create `temp/` directory for temporary files
4. Consolidate duplicate deployment scripts

### **Phase 3: Optimization (After Phase 2)**
1. Review and optimize remaining scripts
2. Add missing scripts for current phase
3. Update documentation

## 📋 **CURRENT PHASE REQUIREMENTS**

### **Phase 2A: Backend Core Functionality**
**Required Scripts:**
- ✅ `pnpm -F @astradio/core build`
- ✅ `pnpm -F @astradio/api build` 
- ✅ `pnpm -F @astradio/api test`
- ✅ `pnpm -F @astradio/api dev`

**Missing Scripts:**
- ❌ `pnpm -r test` (root level test runner)
- ❌ `pnpm -r dev` (already exists)

### **Phase 2B: Frontend Core Functionality**
**Required Scripts:**
- ✅ `pnpm -F @astradio/web dev`

### **Phase 3: Deployment**
**Required Scripts:**
- ❌ `pnpm deploy:api` (Render deployment)
- ❌ `pnpm deploy:web` (Vercel deployment)

## 🚀 **IMMEDIATE ACTION PLAN**

1. **Stop creating new test files** - Use existing structure
2. **Clean up root directory** - Remove 87+ test files
3. **Fix ES module issue** - Update API to use proper ES module syntax
4. **Add missing scripts** - Root level test runner
5. **Consolidate deployment** - Single deployment script

## 📝 **NEXT STEPS**

1. Execute Phase 1 cleanup
2. Fix ES module issue in API
3. Add missing root-level test script
4. Continue with Phase 2A implementation
5. Create lean deployment scripts
