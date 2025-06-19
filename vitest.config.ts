import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable TypeScript support
    globals: true,
    environment: 'node',
    
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,ts}'],
    
    // Setup files (if needed)
    // setupFiles: ['./test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  
  // Resolve aliases to match your project structure
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});