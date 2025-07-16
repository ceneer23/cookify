# GitHub Pages Deployment Instructions

## Quick Fix: Manual Steps

1. **Go to your GitHub repository**: https://github.com/ceneer23/cookify

2. **Enable GitHub Pages**:
   - Click on "Settings" tab
   - Scroll down to "Pages" section (left sidebar)
   - Under "Source", select "GitHub Actions"
   - Click "Save"

3. **Check workflow status**:
   - Go to "Actions" tab
   - Look for "Deploy to GitHub Pages" workflow
   - If it's red (failed), click on it to see the error
   - If it's not there, the workflow might not have triggered

4. **Trigger deployment manually**:
   - Go to "Actions" tab
   - Click "Deploy to GitHub Pages" on the left
   - Click "Run workflow" button
   - Select "main" branch and click "Run workflow"

## Alternative: Direct dist deployment

If the workflow isn't working, we can deploy the built files directly:

1. Create a new branch called `gh-pages`
2. Copy contents of `CookifyFrontend/dist/` to the root of that branch
3. Push the branch
4. Set GitHub Pages source to "Deploy from a branch" → `gh-pages`

## Your app will be available at:
**https://ceneer23.github.io/cookify/**

## Troubleshooting

If you still get 404:
- Wait 5-10 minutes after enabling Pages
- Check that the workflow completed successfully
- Verify the gh-pages branch exists and has files
- Make sure GitHub Pages is set to the correct source

## Local testing
You can test the built version locally:
```bash
cd CookifyFrontend
npm run build
npm run preview
```