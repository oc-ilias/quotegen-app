# QuoteGen Error Tracking & Monitoring Runbook

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Error Severity Levels](#error-severity-levels)
4. [Alerting](#alerting)
5. [Common Issues & Resolutions](#common-issues--resolutions)
6. [Escalation Procedures](#escalation-procedures)
7. [Useful Commands](#useful-commands)

---

## Overview

This runbook documents the error tracking and monitoring system for QuoteGen, a B2B quote management application.

### Key Components
- **Sentry**: Error tracking and performance monitoring
- **Pino**: Structured logging
- **Health Checks**: `/api/health` endpoint
- **Performance Monitoring**: Core Web Vitals and API latency
- **Alerting**: Slack, PagerDuty, and webhook notifications

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     QuoteGen Application                     │
├─────────────────────────────────────────────────────────────┤
│  Client Side              │  Server Side                    │
│  ─────────────            │  ───────────                    │
│  • ErrorBoundary          │  • API Route Handlers           │
│  • GlobalErrorHandler     │  • Health Checks                │
│  • PerformanceObserver    │  • Alerting System              │
│  • Sentry Browser SDK     │  • Sentry Node SDK              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Sentry          │
                    │   Pino Logs       │
                    │   Alert Channels  │
                    └───────────────────┘
```

---

## Error Severity Levels

### Critical 🔴
- Database connection failures
- 500 errors on critical paths
- Memory usage > 85%
- **Action**: Immediate response, page on-call engineer

### High 🟠
- API errors (non-critical paths)
- Render errors in production
- Error rate > 5%
- **Action**: Respond within 15 minutes

### Medium 🟡
- Validation errors
- Slow API responses (2-5s)
- **Action**: Respond within 1 hour, investigate

### Low 🟢
- Transient network errors
- Minor UI glitches
- **Action**: Log and review during business hours

---

## Alerting

### Slack Integration
```bash
# Configure in .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Alert channels:
- `#quotegen-alerts` - All alerts
- `#quotegen-critical` - Critical alerts only

### PagerDuty Integration
```bash
# Configure in .env.local
PAGERDUTY_ROUTING_KEY=your-routing-key
```

Triggers:
- Database errors (3+ in 5 minutes)
- Error rate > 5%
- Critical memory usage

### Custom Webhook
```bash
# Configure in .env.local
ALERT_WEBHOOK_URL=https://your-monitoring-system.com/webhook
```

---

## Common Issues & Resolutions

### 1. Database Connection Errors

**Symptoms:**
- Health check failing on `/api/health`
- Sentry errors: `ECONNREFUSED` or connection timeout

**Diagnosis:**
```bash
# Check database health
curl https://your-app.com/api/health

# Check Supabase status
https://status.supabase.com/
```

**Resolution:**
1. Check Supabase dashboard for connection limits
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Check for connection pool exhaustion
4. Restart application if needed

### 2. High Error Rate

**Symptoms:**
- Slack alert: "High Error Rate Detected"
- Sentry shows spike in errors

**Diagnosis:**
```bash
# Check Sentry for error patterns
# Filter by: environment:production, last 1 hour

# Check application logs
npm run logs:production
```

**Common Causes:**
1. Recent deployment with bugs → Rollback
2. External API outage → Monitor third-party status
3. Database issues → Check database health
4. Traffic spike → Scale application

**Resolution:**
1. Identify error source in Sentry
2. If related to deployment → Rollback immediately
3. If external dependency → Add circuit breaker
4. If traffic-related → Scale horizontally

### 3. Slow API Responses

**Symptoms:**
- Alert: "High API Latency Detected"
- User complaints about slowness

**Diagnosis:**
```bash
# Check performance in Sentry
# Navigate to: Performance → Transactions

# Check database query performance
# In Supabase Dashboard → Database → Performance
```

**Resolution:**
1. Identify slow queries and add indexes
2. Check for N+1 query issues
3. Implement caching (Redis)
4. Optimize database connections

### 4. Memory Issues

**Symptoms:**
- Alert: "High Memory Usage Detected"
- Application restarts/crashes

**Diagnosis:**
```bash
# Check memory usage in logs
# Look for: "Memory usage of X%"

# Profile memory usage
node --inspect server.js
# Open Chrome DevTools → Memory tab
```

**Resolution:**
1. Check for memory leaks in code
2. Reduce cache TTLs
3. Optimize large data processing
4. Scale to larger instance if needed

### 5. Sentry Source Maps Not Working

**Symptoms:**
- Errors show minified code in stack traces

**Resolution:**
```bash
# Ensure SENTRY_AUTH_TOKEN is set
export SENTRY_AUTH_TOKEN=your-token

# Rebuild with source maps
npm run build

# Verify in Sentry project settings
# Source Maps should show recent uploads
```

---

## Escalation Procedures

### Level 1: Automated Response (0-5 minutes)
- Alerts sent to Slack
- Sentry captures error details
- Health checks mark service as degraded

### Level 2: On-Call Engineer (5-15 minutes)
- Acknowledge alert in PagerDuty
- Assess severity and impact
- Attempt immediate resolution
- Update status page if user-facing

### Level 3: Team Lead (15-30 minutes)
- Join incident if unresolved
- Coordinate team response
- Decide on rollback or hotfix
- Communicate with stakeholders

### Level 4: Management (30+ minutes)
- If service still impacted
- Customer communication
- Post-mortem scheduling

---

## Useful Commands

### Health Checks
```bash
# Check application health
curl https://your-app.com/api/health | jq

# Skip cache for fresh check
curl -H "x-skip-cache: true" https://your-app.com/api/health
```

### Logs
```bash
# View production logs
vercel logs your-app.com --production

# Filter for errors
vercel logs your-app.com --production | grep ERROR
```

### Sentry
```bash
# View recent issues
npx sentry-cli issues list

# Create release
npx sentry-cli releases new "1.0.0"
npx sentry-cli releases set-commits --auto "1.0.0"
```

### Performance
```bash
# Run Lighthouse audit
npx lighthouse https://your-app.com --output=html

# Analyze bundle size
npm run analyze
```

---

## Environment Variables

### Required
```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-auth-token

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Optional (Alerting)
```bash
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# PagerDuty
PAGERDUTY_ROUTING_KEY=your-key

# Custom Webhook
ALERT_WEBHOOK_URL=https://...
```

---

## Monitoring Dashboards

### Sentry
- **Issues**: https://sentry.io/organizations/your-org/issues/
- **Performance**: https://sentry.io/organizations/your-org/performance/
- **Releases**: https://sentry.io/organizations/your-org/releases/

### Vercel
- **Deployments**: https://vercel.com/dashboard
- **Analytics**: https://vercel.com/analytics

### Supabase
- **Database**: https://app.supabase.com/project/_/database
- **Logs**: https://app.supabase.com/project/_/logs

---

## Post-Incident Review

After any incident, conduct a post-mortem within 48 hours:

1. **Timeline**: Document what happened when
2. **Root Cause**: Identify underlying issue
3. **Impact**: Users affected, duration
4. **Resolution**: Steps taken to fix
5. **Prevention**: Action items to prevent recurrence

Template: `docs/post-mortems/YYYY-MM-DD-incident-name.md`

---

## Support Contacts

- **Primary On-Call**: #on-call Slack channel
- **Engineering Team**: #engineering-support
- **Sentry Support**: support@sentry.io
- **Vercel Support**: https://vercel.com/help

---

*Last Updated: 2024-02-05*
