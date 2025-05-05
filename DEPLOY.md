# Deploying Memorable to Netlify

This guide provides instructions for deploying the Memorable College Calendar app to Netlify as a web application.

## Prerequisites

- A GitHub account with the Memorable repository
- A Netlify account (free tier is sufficient)

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify account
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub repositories
5. Select the "Memorable" repository

### 2. Configure Build Settings

When prompted, enter the following settings:

- **Build command:** `npm run build:web`
- **Publish directory:** `web-build`
- **Base directory:** (leave blank)

These settings should be automatically detected from the netlify.toml file.

### 3. Advanced Settings

Under the "Advanced build settings" section, add the following environment variables if needed:

- `NODE_VERSION`: 18.18.0
- `NPM_VERSION`: 9.8.1

### 4. Deploy the Site

Click "Deploy site" to start the build and deployment process. Netlify will:
1. Clone your repository
2. Install dependencies
3. Run the build command
4. Deploy the result to a Netlify subdomain

### 5. Custom Domain (Optional)

1. In the Netlify dashboard, go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain's DNS settings

## Continuous Deployment

By default, Netlify will rebuild and redeploy your site whenever you push changes to the main branch of your GitHub repository.

## Troubleshooting

If your deployment fails, check the build logs for errors. Common issues include:

- Missing dependencies
- Build errors in the React Native for Web code
- Incompatible node version

## Local Testing Before Deployment

To test the web build locally before deploying:

```bash
npm run build:web
npx serve web-build
```

Then open your browser to http://localhost:3000 to preview the site.

## Netlify Features to Consider

- **Forms**: For contact or feedback forms
- **Functions**: For serverless backend functionality
- **Identity**: For user authentication
- **Analytics**: To track site usage

## Performance Optimization

The site should load quickly, but you can improve performance by:

1. Optimizing images
2. Enabling HTTP/2
3. Using the Netlify CDN efficiently 