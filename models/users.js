'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users',
    {
      UserId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      Email: {
        type: DataTypes.STRING,
        unique: true
      },
      Username: {
        type: DataTypes.STRING,
        unique: true
      },
      Admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      Deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      Password: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );
  return users;
};