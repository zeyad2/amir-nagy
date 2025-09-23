#!/usr/bin/env node

/**
 * Entry point for the SAT Platform
 * This file serves as a launcher for the server application
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'server', 'app.js');

// Spawn the server process
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: join(__dirname, 'server')
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`📶 Server terminated by signal: ${signal}`);
  } else {
    console.log(`🔚 Server exited with code: ${code}`);
  }
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SAT Platform...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down SAT Platform...');
  serverProcess.kill('SIGTERM');
});