const { Sequelize } = require('sequelize');
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const DB_DIALECT = process.env.DB_DIALECT || (isProduction ? 'postgres' : 'sqlite');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'mydatabase';
const DB_USER = process.env.DB_USER || 'user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_STORAGE = process.env.DB_STORAGE || './database.sqlite';

// Configure database connection options based on dialect
const sequelizeOptions = DB_DIALECT === 'sqlite'
    ? { 
        dialect: DB_DIALECT, 
        storage: DB_STORAGE,
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        define: {
            // Add ON DELETE CASCADE for all associations
            hooks: true
        },
        retry: {
            max: 5,
            match: [
                /SQLITE_BUSY/,
                /SQLITE_LOCKED/
            ]
        }
      }
    : {
        dialect: DB_DIALECT,
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
        username: DB_USER,
        password: DB_PASSWORD,
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            // Add ON DELETE CASCADE for all associations
            hooks: true
        }
    };

const sequelize = new Sequelize(sequelizeOptions);

// Import models and initialize them with sequelize
const Users = require('../models/Users')(sequelize);
const Achievement = require('../models/Achievement')(sequelize);
const Education = require('../models/Education')(sequelize);
const Experience = require('../models/Experience')(sequelize);
const Links = require('../models/Links')(sequelize);
const Project = require('../models/Project')(sequelize);
const Skills = require('../models/Skills')(sequelize);

// Define relationships with cascade delete
Users.hasMany(Achievement, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Achievement.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Education, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Education.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Experience, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Experience.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Links, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Links.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Project, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Project.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Skills, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Skills.belongsTo(Users, { foreignKey: 'userId' });

const connectDB = async () => {
    try {
        // Increase connection retries for Docker startup
        let retries = 10;
        
        while (retries) {
            try {
                await sequelize.authenticate();
                break;
            } catch (error) {
                if (retries <= 1) {
                    throw error;
                }
                console.log(`Database connection failed. Retries left: ${retries}`);
                retries -= 1;
                // Wait for 5 seconds before retrying
                await new Promise(res => setTimeout(res, 5000));
            }
        }
        
        // In production, sync with alter: true to safely update schema
        // without dropping tables
        await sequelize.sync({ force: false, alter: true });
        console.log('Database synchronized');
        
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    connectDB,
    Achievement,
    Education,
    Experience,
    Links,
    Project,
    Skills,
    Users,
};