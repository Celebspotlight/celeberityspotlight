# Celebrity Spotlight - Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
**Your repository is already configured!** Just run:
```bash
# You'll need to authenticate with GitHub first
git push -u origin main
```

**If you get permission errors:**
1. Make sure you're logged into GitHub with the Celebspotlight account
2. Use GitHub Desktop or authenticate via:
   ```bash
   git config --global user.email "infocelebspotlight@gmail.com"
   git config --global user.name "Celebspotlight"
   ```
3. Or use a personal access token for authentication

### 2. Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: 18 (in Environment variables)

### 3. Environment Variables Setup
In Netlify Dashboard → Site settings → Environment variables, add:

```
REACT_APP_NOWPAYMENTS_API_KEY=7NBRW0C-K0E4XS6-G4GJQ2V-MR7D8CW
REACT_APP_ADMIN_ROUTE=/dashboard-mgmt-2024
```

### 4. Custom Domain (Optional)
- Netlify provides: `your-site-name.netlify.app`
- Add custom domain in Site settings → Domain management

## 🔒 Security Features
- ✅ Environment files excluded from Git
- ✅ API keys secured in Netlify environment
- ✅ Admin routes protected
- ✅ HTTPS enabled by default

## 🌟 Netlify Features Included
- **Forms**: Contact form will work automatically
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS certificates
- **Continuous Deployment**: Auto-deploy on Git push
- **Branch Previews**: Test changes before going live

## 📊 Free Plan Limits
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Form submissions: 100/month

## 🛠️ Alternative: Manual Deployment
If you prefer manual deployment:
1. Run `npm run build` locally
2. Drag and drop the `build` folder to Netlify
3. Configure environment variables in dashboard

## 📞 Support
For deployment issues, contact: developer@celebrityspotlight.com

---
**Your Celebrity Spotlight website is ready to go live! 🎬✨**