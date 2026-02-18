#!/bin/bash
# Post-build cleanup script to reduce build output size
# This removes unnecessary files from the dist folder

echo "🔧 Running post-build cleanup..."

DIST_DIR="dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Dist folder not found: $DIST_DIR"
  exit 1
fi

# Remove webpack cache (largest contributor to build size)
if [ -d "$DIST_DIR/cache" ]; then
  echo "📦 Removing webpack cache..."
  rm -rf "$DIST_DIR/cache"
fi

# Remove source maps if they exist (for production builds)
if [ "$NODE_ENV" = "production" ]; then
  echo "🗺️  Removing source maps..."
  find "$DIST_DIR" -name "*.map" -delete 2>/dev/null || true
fi

# Remove TypeScript declaration files (not needed for runtime)
if [ -d "$DIST_DIR/types" ]; then
  echo "📄 Removing TypeScript declarations..."
  rm -rf "$DIST_DIR/types"
fi

# Remove diagnostics folder
if [ -d "$DIST_DIR/diagnostics" ]; then
  echo "🔍 Removing diagnostics..."
  rm -rf "$DIST_DIR/diagnostics"
fi

# Remove trace files (used for debugging)
if [ -f "$DIST_DIR/trace" ]; then
  echo "📊 Removing trace files..."
  rm -f "$DIST_DIR/trace"
  rm -f "$DIST_DIR/trace-build"
fi

# Calculate size reduction
BEFORE_SIZE=$(du -sh "$DIST_DIR" 2>/dev/null | cut -f1)
echo ""
echo "✅ Post-build cleanup complete!"
echo "📁 Final dist size: $BEFORE_SIZE"
