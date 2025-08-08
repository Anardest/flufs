require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host : process.env.DB_HOST || '127.0.0.1',
            port : process.env.DB_PORT || 5432,
            user : process.env.DB_USER || 'your_username',
            password : process.env.DB_PASSWORD || 'your_password',
            database : process.env.DB_NAME || 'your_dev_db_name'
        },
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
            schemaName: 'fluf_schema'
        },
        seeds: {
            directory: './db/seeds'
        }
    }
}