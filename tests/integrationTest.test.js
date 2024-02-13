const request = require("supertest");
const { Sequelize } = require("sequelize");
const User = require("../models/user");

describe("test", () => {
  beforeAll(() => {
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
    server = require("../index");
  });

  afterAll(async () => {
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
    console.log(res.body);
    expect(res.status).toBe(200);
  });

  it("checkss", async () => {
    const token = btoa("abc@gnh.com:mnbv");
    const res = await request(server)
      .put("/v1/user/self")
      .set("Authorization", `Basic ${token}`)
      .send({ first_name: "changed", last_name: "last" });

    console.log("first", res.status);

    const res1 = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${token}`);

    console.log(res1.status, res1.body);
    expect(res.status).toBe(204);
  });
});
