require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DEV_USERNAME,
    password: process.env.DEV_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    port: process.env.DEV_PORT,
    pool: {
      max: 20, // Increase this value
      min: 0,
      acquire: 30000, // Timeout to acquire connection in milliseconds
      idle: 10000,
    },
    migrationStorage: "sequelize",
    migrationStorageTableName: "sequelize_migrations",
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_seeders",
    logging: false,
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
