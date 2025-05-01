import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Company = sequelize.define(
  "Company",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    location: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt
  }
);

export default Company;