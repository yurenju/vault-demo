process.env.DEBUG = "node-vault"; // switch on debug mode

require("dotenv").config();
const mysql = require("promise-mysql");
const Vault = require("node-vault");

const { VAULT_TOKEN } = process.env;
const vault = Vault({ token: VAULT_TOKEN });

let credential;

async function issueCredential() {
  credential = await vault.read("database/creds/my-role");
  const { username, password } = credential.data;
  const leaseDuration = credential.lease_duration;
  lease_id = credential.lease_id;

  const info = [
    `Got new credential!`,
    `  username: ${username}`,
    `  password: ${password}`,
    `  lease duration: ${leaseDuration}`
  ];
  console.log(info.join("\n"));

  global.setTimeout(() => {
    console.log(`Credential will expire in ${leaseDuration / 2} seconds, rotate it.`);
    issueCredential();
  }, (leaseDuration * 1000) / 2);
}

async function gracefulShutdown() {
  console.info("SIGTERM signal received.");
  await vault.revoke({ lease_id: credential.lease_id });
  process.exit(0);
}

async function loop() {
  try {
    const { username, password } = credential.data;
    const conn = await mysql.createConnection({
      host: "localhost",
      user: username,
      password: password
    });
    const result = await conn.query("SELECT USER()");
    console.log(`Current user: ${result[0]["USER()"].split("@")[0]}`);
    conn.end();
  } catch (e) {
    console.error(e.sqlMessage);
    issueCredential();
  }
}

function main() {
  issueCredential();
  global.setInterval(loop, 1000);
  process.on("SIGTERM", gracefulShutdown);
}

if (require.main === module) {
  main();
}
