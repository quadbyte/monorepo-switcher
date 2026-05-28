const { PackageDiscovery } = require('./build/cli.js');

async function debug() {
  const discovery = new PackageDiscovery();
  const packages = await discovery.discoverPackages('./test-monorepo');
  
  console.log('Discovered packages:');
  packages.forEach(pkg => {
    console.log(`- Name: "${pkg.name}" (type: ${typeof pkg.name})`);
    console.log(`  Path: "${pkg.path}"`);
    console.log(`  Length: ${pkg.name.length}`);
  });
  
  const targetName = 'backend';
  const targetPackage = packages.find(pkg => pkg.name === targetName);
  console.log(`\nLooking for "${targetName}":`);
  console.log(`Found: ${!!targetPackage}`);
  if (targetPackage) {
    console.log(`Package:`, targetPackage);
  }
}

debug().catch(console.error);