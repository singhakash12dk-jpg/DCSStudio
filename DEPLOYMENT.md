# Deployment Guide - DreamCatchers Project

## Deploy to GitHub Pages

Your project is now configured for GitHub Pages deployment. Follow these steps:

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. **Repository name:** `dreamcatchers_project` (or your preferred name)
4. **Description:** (Optional) DreamCatchers Studios - Immersive experiences
5. **Visibility:** Public (required for free GitHub Pages)
6. Click "Create repository"

### Step 2: Initialize Git & Push Code

Run these commands in PowerShell from your project directory:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DreamCatchers website with iOS/Android optimization"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/dreamcatchers_project.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Navigate to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
5. The workflow will automatically trigger and deploy your site

### Step 4: Access Your Website

After GitHub Actions completes (✓ green checkmark):
- Your site will be live at: `https://www.dreamcatcherstudios.in/`
- Visit **Settings → Pages** to see the live URL

---

## Automatic Deployment (CI/CD)

Every time you push changes to the `main` branch, GitHub Actions will:
1. ✅ Run the build process
2. ✅ Deploy to GitHub Pages automatically
3. ✅ Update your live website

### Making Future Updates

```powershell
# Make your changes, then:
git add .
git commit -m "Your update message"
git push
```

---

## Important Notes

### GoDaddy custom domain

The site uses `www.dreamcatcherstudios.in` as its GitHub Pages custom domain. The Pages build uses root-relative asset URLs for this domain and includes `public/CNAME` in the deployment artifact.

In GoDaddy DNS, configure:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `singhakash12dk-jpg.github.io` |

Remove conflicting records for `@` or `www`. In the GitHub repository that owns the Pages deployment, open **Settings → Pages**, set the custom domain to `www.dreamcatcherstudios.in`, wait for the HTTPS certificate to become available, then enable **Enforce HTTPS**. The apex domain (`dreamcatcherstudios.in`) should redirect to `www`.

### Performance Notes
- Build size: ~1.2MB (gzipped: 324KB) - normal for 3D React projects
- The large bundle includes Three.js and React Three Fiber libraries
- Consider lazy loading for future optimizations

---

## Troubleshooting

**Site not appearing?**
- Wait 1-2 minutes for GitHub Actions to complete
- Check the Actions tab for build errors
- Verify Settings → Pages shows "Deployment successful"

**Broken assets on the custom domain?**
- Confirm the Pages build sets `GITHUB_PAGES_CUSTOM_DOMAIN=true` so Vite emits root-relative asset URLs.
- Confirm `public/CNAME` contains `www.dreamcatcherstudios.in`.
- Run a new GitHub Pages deployment after pushing the changes.

**Custom domain not working?**
- Check DNS records propagated (can take up to 24 hours)
- Verify CNAME file in GitHub Pages settings

---

## Next Steps

1. ✅ Create GitHub repo
2. ✅ Push code
3. ✅ GitHub Pages goes live automatically
4. ✅ Share your website: `https://YOUR_USERNAME.github.io/dreamcatchers_project/`

**Questions?** Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
