require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DEV_USERNAME,
    password: process.env.DEV_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    port: process.env.DEV_PORT,
    migrationStorage: "sequelize",
    migrationStorageTableName: "sequelize_migrations",
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_seeders",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    migrationStorage: "sequelize",
    migrationStorageTableName: "sequelize_migrations",
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_seeders",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
    migrationStorage: "sequelize",
    migrationStorageTableName: "sequelize_migrations",
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_seeders",
  },
};
