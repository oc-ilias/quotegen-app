/**
 * Lighthouse CI Server Configuration
 * 
 * This configures a self-hosted Lighthouse CI server for storing
 * historical performance data and trends.
 * 
 * Run with: npm run lighthouse:server
 * 
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/recipes/docker-server/README.md
 */

export default {
  ci: {
    server: {
      port: 9001,
      
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci-server.db',
      },
      
      // Basic authentication
      basicAuth: {
        username: process.env.LHCI_SERVER_USERNAME || 'admin',
        password: process.env.LHCI_SERVER_PASSWORD || 'changeme',
      },
      
      // Project management
      projectToken: process.env.LHCI_PROJECT_TOKEN,
      
      // Admin disallowed tokens (projects that can't be created via API)
      adminDisallowedTokenModify: process.env.LHCI_ADMIN_DISALLOWED_TOKENS?.split(',') || [],
    },
  },
};
