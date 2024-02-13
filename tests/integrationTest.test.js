const request = require("supertest");
const { Sequelize } = require("sequelize");
const User = require("../models/user");

describe("test", () => {
  var testData = {
    first_name: "John",
    last_name: "Doe",
    password: "abc",
    username: "abc@eg.com",
  };
  const authToken = btoa(`${testData.username}:${testData.password}`);
  let res;

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
    await User.sync({ force: true });
    await server.close();
  });

  it("should return a 201 status code and the created user details for POST request with a valid body", async () => {
    res = await request(server).post("/v1/user").send(testData);

    expect(res.status).toBe(201);
    expect(res.body.first_name).toMatch(testData.first_name);
    expect(res.body.last_name).toMatch(testData.last_name);
    expect(res.body.username).toMatch(testData.username);
    expect(res.body["id"]).toBeTruthy();
    expect(res.body["account_created"]).toBeTruthy();
    expect(res.body["account_updated"]).toBeTruthy();
  });

  it("should return a 200 status code and the respective user details for GET request with valid credentials", async () => {
    const res = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.first_name).toMatch(testData.first_name);
    expect(res.body.last_name).toMatch(testData.last_name);
    expect(res.body.username).toMatch(testData.username);
    expect(res.body["id"]).toBeTruthy();
    expect(res.body["account_created"]).toBeTruthy();
    expect(res.body["account_updated"]).toBeTruthy();
  });

  it("should return a 204 status code and no response body for PUT request, given correct login credentials and the first_name and last_name fields to update", async () => {
    const res = await request(server)
      .put("/v1/user/self")
      .set("Authorization", `Basic ${authToken}`)
      .send({ first_name: "Jane", last_name: "Mary" });

    expect(res.status).toBe(204);
    expect(JSON.stringify(res.body)).toMatch(JSON.stringify({}));
  });

  it("should return a 200 status code and the updated user details for GET request with valid credentials", async () => {
    const res = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.first_name).toMatch("Jane");
    expect(res.body.last_name).toMatch("Mary");
    expect(res.body.username).toMatch(testData.username);
    expect(res.body["id"]).toBeTruthy();
    expect(res.body["account_created"]).toBeTruthy();
    expect(res.body["account_updated"]).toBeTruthy();
  });

  it("should return a 204 status code for PUT request, given a password field to update", async () => {
    const res = await request(server)
      .put("/v1/user/self")
      .set("Authorization", `Basic ${authToken}`)
      .send({ password: "abcd" });

    expect(res.status).toBe(204);
    expect(JSON.stringify(res.body)).toMatch(JSON.stringify({}));
  });

  it("should return 401 status code and no response body for GET request, when it is sent with old password as login credentials", async () => {
    const res = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${authToken}`);

    setTimeout(() => {
      expect(res.status).toBe(401);
      expect(JSON.stringify(res.body)).toMatch(JSON.stringify({}));
    }, 1000);
  });

  it("should return 200 status code and the updated user details for GET request, when it is sent with correct password as login credentials", async () => {
    const updatedAuthToken = btoa(`${testData.username}:abcd`);
    const res = await request(server)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${updatedAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.first_name).toMatch("Jane");
    expect(res.body.last_name).toMatch("Mary");
    expect(res.body.username).toMatch(testData.username);
    expect(res.body["id"]).toBeTruthy();
    expect(res.body["account_created"]).toBeTruthy();
    expect(res.body["account_updated"]).toBeTruthy();
  });
});
