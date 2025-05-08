const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Education = sequelize.define('Education', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        institution: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        institutionLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        degree: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fieldOfStudy: {
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
    
    return Education;
};