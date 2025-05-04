const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

console.log(chalk.blue('🔍 Checking web configuration for Memorable app...'));

// Check app.json web configuration
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (!appJson.expo.web) {
    console.log(chalk.red('❌ Missing web configuration in app.json'));
    appJson.expo.web = {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    };
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log(chalk.green('✅ Added web configuration to app.json'));
  } else {
    console.log(chalk.green('✅ Web configuration exists in app.json'));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking app.json: ${error.message}`));
}

// Check package.json scripts
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  let modified = false;
  
  if (!packageJson.scripts.web) {
    packageJson.scripts.web = "expo start --web";
    modified = true;
  }
  
  if (!packageJson.scripts['web:dev']) {
    packageJson.scripts['web:dev'] = "expo start --web --tunnel";
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✅ Updated web scripts in package.json'));
  } else {
    console.log(chalk.green('✅ Web scripts exist in package.json'));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking package.json: ${error.message}`));
}

console.log(chalk.blue('✨ Web configuration check complete'));
console.log(chalk.yellow('📋 To run the app on localhost, use:'));
console.log(chalk.yellow('   npm run web'));
console.log(chalk.yellow('📡 To run with tunnel access, use:'));
console.log(chalk.yellow('   npm run web:dev')); 