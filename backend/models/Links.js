const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Links = sequelize.define('Links', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        github: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        leetcode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        linkedin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        portfolio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
    
    return Links;
};