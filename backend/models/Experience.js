const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Experience = sequelize.define('Experience', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        companyLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        isCurrent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        description: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
    
    return Experience;
};