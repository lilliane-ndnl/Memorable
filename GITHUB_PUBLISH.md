# Publishing to GitHub

Follow these steps to publish your College Calendar application to GitHub:

## Preparation

1. Make sure you have a GitHub account. If not, create one at [github.com](https://github.com/)

2. You may want to take screenshots of the application for the README:
   - Run the application (`npm start` then press 'w')
   - Take screenshots of the Calendar and Tasks views
   - Save them in the `screenshots` folder

## Creating a GitHub Repository

1. Log in to GitHub
2. Click on the "+" icon in the top right corner and select "New repository"
3. Enter a repository name (e.g., "college-calendar")
4. Add a short description: "A React Native calendar app for college students"
5. Make the repository public or private as desired
6. Do not initialize with a README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Pushing Your Code to GitHub

GitHub will show commands similar to these. Run them from your project folder:

```bash
git remote add origin https://github.com/YOUR_USERNAME/college-calendar.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Verify the Repository

1. Refresh your GitHub repository page to see the uploaded files
2. Check that the README displays correctly
3. Adjust any paths or images as necessary

## Optional: Enable GitHub Pages

If you want to deploy a live demo of your web application:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to "GitHub Pages" section
4. Select the "main" branch and "/docs" folder
5. Click "Save"

Note: You'll need to build your project for web and place the output in a docs folder:

```bash
npm run web -- --no-dev --output-dir docs
```

Then commit and push the docs folder to GitHub. 