var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");

const auth = (token, next) => {
  if (token === "jasjkiwe47541weqe12wewq8ew51qe8qw7e") return true;
  else console.log("Unauthorised");
};

router.post("/products", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      await Products.create(data);
      res.json({ status: "ok", message: "Created" });
    }
    res.json({ status: "Unauthorised" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
});

router.post("/vegetables", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      await Products.create(data);
      res.json({ status: "ok", message: "Created" });
    }
    res.json({ status: "Unauthorised" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
});

router.get("/fruits", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      await Products.create(data);
      res.json({ status: "ok", message: "Created" });
    }
    res.json({ status: "Unauthorised" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
});

router.get("/tifin", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      await Products.create(data);
      res.json({ status: "ok", message: "Created" });
    }
    res.json({ status: "Unauthorised" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
});

router.get("/newspaper", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      await Products.create(data);
      res.json({ status: "ok", message: "Created" });
    }
    res.json({ status: "Unauthorised" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
});

module.exports = router;
