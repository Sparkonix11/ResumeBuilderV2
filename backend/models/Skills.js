const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Skills = sequelize.define('Skills', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Languages: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Visualization: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Cloud: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Frameworks: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Database: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Tools: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Webdevelopment: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
    
    return Skills;
};