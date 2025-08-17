# 📊 SLOs & Monitoring - Production Reliability

## 🎯 **Service Level Objectives (SLOs)**

### API SLOs
- **Latency**: p95 < 150ms for all endpoints
- **Error Rate**: < 1% (excluding 4xx client errors)
- **Uptime**: ≥ 99.9% (8.76 hours downtime per year max)
- **Availability**: Health check responds within 5 seconds

### Web SLOs
- **TTFB**: < 300ms for cached pages
- **LCP**: < 2.5 seconds
- **CLS**: < 0.1
- **Uptime**: ≥ 99.9%

## 🔍 **Health Checks & Monitoring**

### Automated Health Checks
- **API Health**: `/health` endpoint (every 30s)
- **Web Health**: Homepage availability (every 30s)
- **Smoke Tests**: Post-deploy validation (comprehensive)

### Manual Health Checks
```bash
# API Health
curl $NEXT_PUBLIC_API_URL/health

# Ephemeris Data
curl $NEXT_PUBLIC_API_URL/api/ephemeris/today

# Music Generation
curl -X POST $NEXT_PUBLIC_API_URL/api/audio/generate \
  -H "Content-Type: application/json" \
  -d '{"genre":"ambient"}'

# Web App
curl https://$VERCEL_PROJECT_NAME.vercel.app
```

## 🚨 **Alerting Strategy**

### Critical Alerts (P0)
- **API Down**: Health check fails for 2+ minutes
- **Web Down**: Homepage returns 5xx for 2+ minutes
- **High Error Rate**: > 5% error rate for 5+ minutes
- **Latency Spike**: p95 > 500ms for 5+ minutes

### Warning Alerts (P1)
- **Error Rate**: > 1% error rate for 10+ minutes
- **Latency Degradation**: p95 > 200ms for 10+ minutes
- **Rate Limit Hits**: > 100 rate limit hits per hour
- **Deploy Failures**: Smoke tests fail after deployment

### Info Alerts (P2)
- **Deployments**: Successful deployments
- **Rollbacks**: Rollback events
- **New Error Types**: New error patterns in Sentry

## 📈 **Metrics & Dashboards**

### Key Metrics to Track
1. **Request Volume**: Requests per minute by endpoint
2. **Response Times**: p50, p95, p99 latencies
3. **Error Rates**: 2xx, 4xx, 5xx percentages
4. **Cache Hit Rate**: Ephemeris cache effectiveness
5. **Rate Limit Hits**: Throttling events
6. **Uptime**: Service availability percentage

### Dashboard Requirements
- **Real-time**: Current status and recent metrics
- **Historical**: Trends over time (1h, 24h, 7d, 30d)
- **Alerting**: Current alert status and history
- **Deployment**: Recent deployments and rollbacks

## 🔧 **Operational Procedures**

### Incident Response
1. **Detection**: Automated alerts trigger
2. **Assessment**: Check dashboards and logs
3. **Mitigation**: Apply fixes or rollback
4. **Verification**: Run smoke tests
5. **Communication**: Update stakeholders
6. **Post-mortem**: Document lessons learned

### Rollback Procedures
```bash
# Quick rollback (both services)
. scripts/rollback.ps1

# Rollback specific service
. scripts/rollback.ps1 web
. scripts/rollback.ps1 api

# Verify rollback
. scripts/smoke.ps1
```

### Load Testing
```bash
# Run load test (requires k6)
k6 run -e API=$NEXT_PUBLIC_API_URL scripts/load.js

# Expected results:
# - p95 latency < 150ms
# - Error rate < 1%
# - No rate limiting under normal load
```

## 🛡️ **Security Monitoring**

### Security Checks
- **CORS Configuration**: Verify whitelist origins
- **Rate Limiting**: Monitor for abuse patterns
- **Input Validation**: Check for injection attempts
- **Authentication**: Monitor for unauthorized access

### Security Alerts
- **CORS Violations**: Unexpected origin requests
- **Rate Limit Abuse**: Excessive rate limit hits
- **Input Validation Failures**: Malformed requests
- **Authentication Failures**: Unauthorized access attempts

## 📝 **Logging Strategy**

### Structured Logging
- **Request IDs**: Unique ID per request for tracing
- **Performance Metrics**: Response times and status codes
- **Error Context**: Full error details with stack traces
- **User Context**: Request metadata (IP, user agent, etc.)

### Log Retention
- **Application Logs**: 30 days
- **Error Logs**: 90 days
- **Access Logs**: 7 days
- **Performance Logs**: 90 days

## 🔄 **Continuous Improvement**

### Weekly Reviews
- **SLO Performance**: Review against targets
- **Alert Analysis**: Reduce false positives
- **Incident Review**: Learn from outages
- **Capacity Planning**: Plan for growth

### Monthly Reviews
- **Trend Analysis**: Long-term performance trends
- **Cost Optimization**: Review infrastructure costs
- **Security Assessment**: Review security posture
- **Process Improvement**: Optimize operational procedures

## 🎯 **Success Metrics**

### Reliability Metrics
- **MTTR**: Mean Time To Recovery < 15 minutes
- **MTBF**: Mean Time Between Failures > 30 days
- **SLA Compliance**: > 99.9% uptime
- **Alert Accuracy**: < 5% false positive rate

### Performance Metrics
- **API Latency**: p95 < 150ms maintained
- **Web Performance**: Core Web Vitals in green
- **Cache Efficiency**: > 80% cache hit rate
- **Error Rate**: < 1% maintained

### Operational Metrics
- **Deployment Success**: > 95% successful deployments
- **Rollback Rate**: < 5% deployments require rollback
- **Mean Time To Detect**: < 5 minutes
- **Mean Time To Resolve**: < 15 minutes
