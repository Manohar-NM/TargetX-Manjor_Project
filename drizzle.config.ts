import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const caPath = path.resolve(process.cwd(), "certs", "aiven-ca.pem");
const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf-8") : undefined;

const cleanUrl = connectionString.replace(/\?ssl-mode=REQUIRED(&|$)/, "").replace(/\?$/, "");
const u = new URL(cleanUrl.replace(/^mysql:/, "http:"));

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: ca
    ? {
        host: u.hostname,
        port: parseInt(u.port || "3306"),
        user: u.username,
        password: u.password,
        database: u.pathname.slice(1),
        ssl: {
          ca,
          rejectUnauthorized: true,
        },
      }
    : {
        url: connectionString,
      },
});
