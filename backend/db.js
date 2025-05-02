import { Sequelize } from "sequelize";

const sequelize = new Sequelize("job_tracker", "root", "Gyashaswini@123", {
  host: "34.9.87.219",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connection to the database has been established successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
  });
  
export default sequelize;