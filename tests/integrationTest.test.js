const request = require("supertest");
const { Sequelize } = require("sequelize");
const User = require("../models/user");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  { host: process.env.MYSQL_HOST, dialect: "mysql" }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

User.sync()
  .then((res) => {
    console.log("Table synced", res);
  })
  .catch((err) => console.log("error on table creation", err));

describe("test", () => {
  beforeEach(() => {
    server = require("../index");
  });

  afterEach(async () => {
    await server.close();
  });

  it("checks", async () => {
    await request(server).post("/v1/user").send({
      first_name: "abcd",
      last_name: "efgh",
      password: "mnbv",
      username: "abc@gnh.com",
    });
    const token = btoa("abc@gnh.com:mnbv");
    const res = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${token}`);

    // expect(res.status).toBe(401);
  });

  it("checkss", async () => {
    const token = btoa("abc@gnh.com:mnbv");
    const res = await request(server)
      .put("/v1/user/self")
      .set("Authorization", `Basic ${token}`)
      .send({ first_name: "changed", last_name: "last" });

    setTimeout(() => {
      console.log("first", res.status, res.body);
    }, 1000);

    const res1 = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${token}`);

    console.log(res1.status, res1.body);
    // expect(res.status).toBe(401);
  });
});
