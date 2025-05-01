import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Company from "./Company.js";

const Application = sequelize.define(
  "Application",
  {
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_applied: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt
  }
);

Application.belongsTo(Company, { foreignKey: "company_id" });

export default Application;