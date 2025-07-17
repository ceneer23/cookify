const { execSync } = require('child_process');

const port = process.argv[2] || 5001;

console.log(`🔍 Checking for processes on port ${port}...`);

try {
  // Find processes using the port
  const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  
  if (!netstatOutput.trim()) {
    console.log(`✅ No processes found on port ${port}`);
    return;
  }
  
  // Extract PIDs from netstat output
  const lines = netstatOutput.trim().split('\n');
  const pids = new Set();
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0' && !isNaN(pid)) {
      pids.add(pid);
    }
  });
  
  if (pids.size === 0) {
    console.log(`✅ No active processes found on port ${port}`);
    return;
  }
  
  console.log(`Found ${pids.size} process(es) using port ${port}`);
  
  // Kill each process
  pids.forEach(pid => {
    try {
      console.log(`🔥 Killing process ${pid}...`);
      execSync(`powershell -Command "Stop-Process -Id ${pid} -Force"`, { stdio: 'inherit' });
      console.log(`✅ Process ${pid} killed successfully`);
    } catch (error) {
      console.log(`⚠️ Could not kill process ${pid}: ${error.message}`);
    }
  });
  
  console.log(`✅ Port ${port} should now be free`);
  
} catch (error) {
  console.log(`✅ No processes found on port ${port}`);
}