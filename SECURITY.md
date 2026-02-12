# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within QuoteGen, please send an email to security@quotegen.app. All security vulnerabilities will be promptly addressed.

Please do not disclose security-related issues publicly until a fix has been released.

## Security Measures

### Environment Variables

- All sensitive configuration is stored in environment variables
- No secrets are committed to the repository
- Service role keys are only used server-side in API routes

### Authentication

- Supabase Auth for user authentication
- JWT tokens with secure expiration
- Row Level Security (RLS) policies on all database tables

### API Security

- API routes validate all inputs
- CORS configured for production domains only
- Rate limiting on sensitive endpoints

### Data Protection

- All data encrypted at rest in Supabase
- HTTPS required for all connections
- No sensitive data in client-side code

## Best Practices

1. **Never commit `.env.local`** - It contains sensitive keys
2. **Use strong passwords** - For all admin accounts
3. **Enable 2FA** - On your Supabase and Vercel accounts
4. **Regular updates** - Keep dependencies updated
5. **Monitor logs** - Check for suspicious activity

## Security Checklist for Deployment

- [ ] All environment variables set in production
- [ ] Supabase RLS policies configured
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled
- [ ] Sentry error tracking configured
- [ ] HTTPS enforced
- [ ] Security headers configured in next.config.ts

## Contact

For security concerns: security@quotegen.app
