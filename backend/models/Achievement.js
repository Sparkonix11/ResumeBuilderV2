const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Achievement = sequelize.define('Achievement', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return Achievement;
};