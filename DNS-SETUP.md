# 🌐 Astradio.io DNS Configuration Guide

## Domain: astradio.io

### DNS Records to Configure

#### 1. A Record (Root Domain)
- **Type**: A
- **Name**: @ (or leave empty)
- **Value**: `76.76.21.21`
- **TTL**: 3600 (or default)

#### 2. CNAME Record (WWW Subdomain)
- **Type**: CNAME
- **Name**: www
- **Value**: `cname.vercel-dns.com`
- **TTL**: 3600 (or default)

### Vercel Dashboard Configuration

#### 1. Add Custom Domain
1. Go to your Vercel dashboard
2. Select the Astradio project
3. Go to "Settings" → "Domains"
4. Add `astradio.io` as a custom domain
5. Add `www.astradio.io` as a custom domain

#### 2. Configure Redirects
1. In the same "Domains" section
2. Set up redirect from `www.astradio.io` to `astradio.io`
3. Enable "Force HTTPS" for both domains

#### 3. SSL/TLS Configuration
- Vercel will automatically provision SSL certificates
- Force HTTPS is enabled in vercel.json
- HSTS headers are configured in the API

### Verification Steps

#### 1. DNS Propagation Check
```bash
# Check A record
nslookup astradio.io

# Check CNAME record
nslookup www.astradio.io

# Expected results:
# astradio.io -> 76.76.21.21
# www.astradio.io -> cname.vercel-dns.com
```

#### 2. SSL Certificate Verification
```bash
# Check SSL certificate
openssl s_client -connect astradio.io:443 -servername astradio.io

# Should show valid certificate from Let's Encrypt or Vercel
```

#### 3. Redirect Verification
```bash
# Test www to non-www redirect
curl -I https://www.astradio.io
# Should return 301 redirect to https://astradio.io
```

### Environment Variables for Production

Add these to your Vercel project environment variables:

```
NEXT_PUBLIC_API_URL=https://astradio.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://astradio.io
NODE_ENV=production
```

### Security Headers Verification

The application includes these security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### CORS Configuration

The API is configured to allow requests from:
- `https://astradio.io`
- `https://www.astradio.io`
- `https://astradio.vercel.app`
- `https://astradio-staging.vercel.app`
- `http://localhost:3000` (development only)

### Testing Checklist

- [ ] DNS records are properly configured
- [ ] Domain is added to Vercel dashboard
- [ ] SSL certificates are provisioned
- [ ] HTTPS redirects are working
- [ ] www to non-www redirect is working
- [ ] API calls from frontend to backend work
- [ ] CORS allows requests from astradio.io
- [ ] Security headers are present
- [ ] Environment variables are set in Vercel

### Troubleshooting

#### Common Issues:

1. **DNS not propagated**: Wait up to 48 hours for full propagation
2. **SSL certificate issues**: Vercel should auto-provision certificates
3. **CORS errors**: Check that astradio.io is in the allowed origins list
4. **API calls failing**: Verify NEXT_PUBLIC_API_URL is set correctly

#### Debug Commands:
```bash
# Check DNS propagation
dig astradio.io
dig www.astradio.io

# Test HTTPS
curl -I https://astradio.io

# Test API endpoint
curl https://astradio.vercel.app/api/health
```

### Next Steps After DNS Setup

1. Deploy the application to Vercel
2. Test all functionality on the live domain
3. Monitor error logs for any issues
4. Set up monitoring and analytics
5. Begin beta testing with the live domain 