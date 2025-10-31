#!/usr/bin/env node
const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

const port = process.argv[2] || process.env.PORT || '3001';
let previewProc = null;
let building = false;
let queued = false;

function runBuildAndStart() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  console.log('[watch-rebuild] Running production build (next build)...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  build.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log('[watch-rebuild] Build succeeded. Starting preview...');
      if (previewProc) {
        try {
          console.log('[watch-rebuild] Killing previous preview process...');
          previewProc.kill('SIGTERM');
        } catch (e) {
          console.warn('[watch-rebuild] Failed to kill previous preview:', e && e.message);
        }
      }
      // Run tests first (blocking) before starting preview. If tests pass, start preview and run lint in background.
      try {
        console.log('[watch-rebuild] Running tests before preview...');
        const testProc = spawn('npm', ['run', 'test', '--', '--run'], { stdio: 'inherit', shell: true });
        testProc.on('close', (t) => {
          console.log('[watch-rebuild] Tests finished with code', t);
          if (t === 0) {
            console.log('[watch-rebuild] Tests passed. Starting preview...');
            if (previewProc) {
              try {
                console.log('[watch-rebuild] Killing previous preview process...');
                previewProc.kill('SIGTERM');
              } catch (e) {
                console.warn('[watch-rebuild] Failed to kill previous preview:', e && e.message);
              }
            }
            previewProc = spawn('npm', ['run', 'start', '--', '-p', port], { stdio: 'inherit', shell: true });
            previewProc.on('close', (c) => {
              console.log('[watch-rebuild] Preview exited with code', c);
            });

            // Run lint in background
            try {
              const lintProc = spawn('npm', ['run', 'lint'], { stdio: 'inherit', shell: true });
              lintProc.on('close', (l) => {
                console.log('[watch-rebuild] Lint finished with code', l);
              });
            } catch (e) {
              console.warn('[watch-rebuild] Failed to run lint:', e && e.message);
            }
          } else {
            console.error('[watch-rebuild] Tests failed with exit code', t, '. Preview will not be started. Fix test failures and save files to retry.');
          }
          if (queued) {
            queued = false;
            runBuildAndStart();
          }
        });
      } catch (e) {
        console.warn('[watch-rebuild] Failed to run tests:', e && e.message);
        // If tests cannot be run, still attempt to start preview to avoid blocking developer flow
        if (previewProc) {
          try {
            console.log('[watch-rebuild] Killing previous preview process...');
            previewProc.kill('SIGTERM');
          } catch (err) {}
        }
        previewProc = spawn('npm', ['run', 'start', '--', '-p', port], { stdio: 'inherit', shell: true });
        previewProc.on('close', (c) => {
          console.log('[watch-rebuild] Preview exited with code', c);
        });
      }
    } else {
      console.error('[watch-rebuild] Build failed with exit code', code, '. Fix build errors and save files to retry.');
    }
    if (queued) {
      queued = false;
      runBuildAndStart();
    }
  });
}

process.on('SIGINT', () => {
  console.log('\n[watch-rebuild] Stopping watcher (SIGINT)');
  try { watcher.close(); } catch (e) {}
  try { if (previewProc) previewProc.kill('SIGTERM'); } catch (e) {}
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\n[watch-rebuild] Stopping watcher (SIGTERM)');
  try { watcher.close(); } catch (e) {}
  try { if (previewProc) previewProc.kill('SIGTERM'); } catch (e) {}
  process.exit();
});

const watchPaths = [
  path.join(process.cwd(), 'app'),
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'data'),
  path.join(process.cwd(), 'tailwind.config.cjs'),
  path.join(process.cwd(), 'package.json'),
  path.join(process.cwd(), 'next.config.ts'),
];

console.log('[watch-rebuild] Watching paths:', watchPaths.join(', '));

const watcher = chokidar.watch(watchPaths, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 } });
const debounceMs = 800;
let timer = null;

watcher.on('all', (event, changedPath) => {
  console.log(`[watch-rebuild] ${event} detected: ${changedPath}`);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('[watch-rebuild] Changes settled — rebuilding...');
    runBuildAndStart();
  }, debounceMs);
});

// Initial build & start
runBuildAndStart();

// export for testing
module.exports = { runBuildAndStart };
