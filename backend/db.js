import { Sequelize } from "sequelize";

const sequelize = new Sequelize("job_tracker", "root", "Gyashaswini@123", {
  host: "34.9.87.219",
  dialect: "mysql",
});

export default sequelize;