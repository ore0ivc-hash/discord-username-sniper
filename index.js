import fs from 'fs';
import { checkUsername } from './utils/check.js';
import { claimUsername } from './utils/claim.js';
import turbo from 'turbo-axios';
function readLines(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8').trim();
    if (!data) throw new Error(`${filePath} is empty`);

    return data
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err.message);
    process.exit(1);
  }
}

function parseTokenPassword(line, index) {
  const separatorIndex = line.indexOf(':');

  if (separatorIndex === -1) {
    console.error(`❌ Invalid tokens.txt format on line ${index + 1}`);
    console.error('Expected format: token:password');
    process.exit(1);
  }

  const token = line.slice(0, separatorIndex).trim();
  const password = line.slice(separatorIndex + 1).trim();

  if (!token || !password) {
    console.error(`❌ Missing token or password on line ${index + 1}`);
    process.exit(1);
  }

  return { token, password };
}

async function main() {
  const tokenLines = readLines('tokens.txt');
  const usernames = readLines('usernames.txt');

  if (tokenLines.length !== usernames.length) {
    console.error('❌ Token count must match username count');
    process.exit(1);
  }

  const targets = usernames.map((username, i) => {
    const { token, password } = parseTokenPassword(tokenLines[i], i);

    return {
      username,
      token,
      password
    };
  });

  console.log(`🌐 Monitoring ${targets.length} username(s)\n`);

  for (const target of targets) {
    const available = await checkUsername(target.username, target.token);

    if (available) {
      await claimUsername(target.username, target.token, target.password);
    }
  }

  console.log(`⏳ Monitoring: ${targets.map(t => `@${t.username}`).join(', ')}\n`);

  setInterval(async () => {
    for (const target of targets) {
      const available = await checkUsername(target.username, target.token);

      if (available) {
        await claimUsername(target.username, target.token, target.password);
      }
    }
  }, 5000);
}

main().catch(console.error);
