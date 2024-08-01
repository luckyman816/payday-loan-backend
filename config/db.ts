export const dbConfig = {
  db: "solidx",
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres"
};
