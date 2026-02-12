/**
 * Performance Tests
 * Bundle analysis and Lighthouse CI
 * @module scripts/performance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runPerformanceTests() {
  const results = {
    timestamp: new Date().toISOString(),
    bundleSize: {},
    buildTime: 0,
    lighthouse: null,
  };

  // Measure build time
  console.log('📦 Measuring build time...');
  const startTime = Date.now();
  try {
    execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() });
    results.buildTime = Date.now() - startTime;
    console.log(`✅ Build completed in ${results.buildTime}ms`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    results.buildTime = -1;
  }

  // Analyze bundle size
  console.log('📊 Analyzing bundle size...');
  const nextBuildDir = path.join(process.cwd(), '.next');
  
  if (fs.existsSync(nextBuildDir)) {
    const staticDir = path.join(nextBuildDir, 'static');
    
    function getDirSize(dirPath) {
      let size = 0;
      const files = fs.readdirSync(dirPath, { recursive: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          size += stat.size;
        }
      }
      
      return size;
    }

    if (fs.existsSync(staticDir)) {
      const staticSize = getDirSize(staticDir);
      results.bundleSize = {
        static: {
          bytes: staticSize,
          kb: Math.round(staticSize / 1024),
          mb: (staticSize / 1024 / 1024).toFixed(2),
        },
      };
    }
  }

  // Page size analysis
  console.log('🌐 Analyzing page sizes...');
  const serverDir = path.join(nextBuildDir, 'server');
  const pagesDir = path.join(serverDir, 'app');
  
  const pageSizes = {};
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir, { recursive: true });
    for (const file of pageFiles) {
      if (typeof file === 'string' && file.endsWith('.js')) {
        const fullPath = path.join(pagesDir, file);
        const stat = fs.statSync(fullPath);
        pageSizes[file] = {
          bytes: stat.size,
          kb: Math.round(stat.size / 1024),
        };
      }
    }
  }
  results.bundleSize.pages = pageSizes;

  console.log('✅ Performance analysis complete');
  return results;
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests()
    .then(results => {
      console.log('\n📈 Performance Results:');
      console.log(JSON.stringify(results, null, 2));
      
      // Save results
      const outputDir = path.join(process.cwd(), 'test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(outputDir, 'performance-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      console.log(`\n💾 Results saved to test-results/performance-results.json`);
    })
    .catch(console.error);
}

module.exports = { runPerformanceTests };
