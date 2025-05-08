const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        technologies: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        githubrepository: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        livelink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
    
    return Project;
};