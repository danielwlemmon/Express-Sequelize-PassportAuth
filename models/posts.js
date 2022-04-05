'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define(
    'posts',
    {
      UserId: {
        type: DataTypes.INTEGER,
        foreignKey: true
      },
      PostTitle: DataTypes.STRING,
      PostBody: DataTypes.STRING,
      PostId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      Deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );
  return posts;
};