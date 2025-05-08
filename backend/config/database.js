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

const sequelize = new Sequelize(
    DB_DIALECT === 'sqlite'
        ? { 
            dialect: DB_DIALECT, 
            storage: DB_STORAGE,
            logging: process.env.DB_LOGGING === 'true' ? console.log : false,
            define: {
                // Add ON DELETE CASCADE for all associations
                hooks: true
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
          }
);

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
        await sequelize.authenticate();
        
        // Only use sync in development mode
        if (NODE_ENV === 'development') {
            // Use force: false and alter: false to prevent repeated table rebuilding
            // Only update database schema once during first application run
            await sequelize.sync({ force: false, alter: false });
            console.log('Database synchronized');
        }
        
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