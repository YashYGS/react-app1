import { Sequelize } from "sequelize";

const sequelize = new Sequelize("job_tracker", "root", "Gyashaswini@123", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;