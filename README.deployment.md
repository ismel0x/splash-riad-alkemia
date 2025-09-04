# Vercel Deployment Guide

## Prerequisites

1. **Database Setup**: Ensure you have a Neon PostgreSQL database configured
2. **Environment Variables**: Set up the required environment variables in Vercel
3. **Domain Configuration**: Configure your custom domain if needed

## Environment Variables

Set these environment variables in your Vercel dashboard:

```
DATABASE_URL=your_neon_database_url
VERIMAIL_API_KEY=your_verimail_api_key
NODE_ENV=production
```

## Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Configure Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
   - Install Command: `npm ci`
3. **Set Environment Variables**: Add the environment variables listed above
4. **Deploy**: Click deploy and wait for the build to complete

## Post-Deployment

1. **Database Migration**: Run database migrations if needed
2. **Test Email Verification**: Verify that Verimail integration works
3. **Test Form Submission**: Test the complete WiFi registration flow
4. **Monitor Logs**: Check Vercel function logs for any issues

## Custom Domain

To use a custom domain:
1. Go to your Vercel project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Configure DNS settings as instructed

## Troubleshooting

- **Build Failures**: Check the build logs in Vercel dashboard
- **API Errors**: Verify environment variables are set correctly
- **Database Issues**: Ensure DATABASE_URL is correct and accessible
- **Email Verification**: Verify VERIMAIL_API_KEY is valid