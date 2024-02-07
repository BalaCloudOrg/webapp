const express = require("express");
const router = express.Router();

router.use("/v1/user", (req, res, next) => {
  console.log("reached v1/user", req.body);
  res.status(201).send({
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    first_name: "Jane",
    last_name: "Doe",
    username: "jane.doe@example.com",
    account_created: "2016-08-29T09:12:33.001Z",
    account_updated: "2016-08-29T09:12:33.001Z",
  });
});

module.exports = router;
