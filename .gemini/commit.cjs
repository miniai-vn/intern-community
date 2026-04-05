const { execSync } = require('child_process');

try {
  execSync('git config user.name "Chí Bảo"');
  execSync('git config user.email "chibao220304@gmail.com"');
  execSync('git add .');
  execSync('git commit -m "feat: add delete submission feature with modern UI upgrades"');
  console.log("SUCCESS");
} catch (error) {
  console.error("FAILED:", error.message);
  if (error.stdout) console.log(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
}
