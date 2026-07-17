const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");

const EMAIL = "admin@prototypebd.com";
const NEW_PASSWORD = "Admin@12345";

// bcrypt with $2a$ prefix — verified by Python's bcrypt.checkpw
const hash = bcrypt.hashSync(NEW_PASSWORD, 12);

const db = new DatabaseSync("./prototypebd.db");
const info = db
  .prepare("UPDATE users SET password_hash = ? WHERE email = ?")
  .run(hash, EMAIL);

console.log("rows updated:", info.changes);
const row = db
  .prepare("SELECT id, email, role, is_active FROM users WHERE email = ?")
  .get(EMAIL);
console.log("user:", row);

// sanity-check the hash verifies
console.log("verify:", bcrypt.compareSync(NEW_PASSWORD, hash));
