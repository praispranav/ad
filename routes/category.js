var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");
const Image = require("../schema/imageStore");
var mongoose = require("mongoose");
const { response } = require("express");

let flowers = [];
let tifin = [];
let newsPaper = [];
let fruits = [];
let vegetables = [];
let dairy = [];

let a = 0;

router.get("/flowers", function (req, res, next) {
  res.json(flowers);
});

router.get("/vegetables", function (req, res, next) {
  res.json(vegetables);
});

router.get("/product/:id", async function (req, res, next) {
  try{
    const id = req.params.id
    console.log(id)
    const products = await Products.find({ _id:id });
    res.status(200).json(products)
  } catch (error){
    console.log(error)
    res.status(500).json({ message: "Something Went Wrong"})
  }
});

router.get("/fruits", function (req, res, next) {
  res.json(fruits);
});

router.get("/tifin", function (req, res, next) {
  res.json(tifin);
});

router.get("/newspaper", function (req, res, next) {
  res.json(newsPaper);
});

router.get("/dairy", function (req, res, next) {
  res.json(dairy);
});
router.get("/time-range", function (req, res, next) {
  const timeRange = [
    "8pm - 9pm",
    "7pm - 8pm",
    "6pm - 7pm",
    "5pm - 6pm",
    "6am - 7am",
    "7am - 8am",
    "8am - 9am",
  ];
  res.json(timeRange)
});

router.get("/image/:category", async (req, res) => {
  try {
    const category = req.params.category;
    console.log(req.params);
    const result = await Image.find({ category: category });
    res.status(200).json({ status: "ok", data: result });
    res.status;
  } catch (err) {
    console.log(error);
  }
});

router.get("/image/id/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(req.params);
    const result = await Image.find({ productId: productId });
    res.status(200).json(result);
    res.status;
  } catch (err) {
    console.log(error);
  }
});

router.get("/update", async function (req, res, next) {
  try {
    const products = await Products.find();
    flowers = products.filter((item) => item.category == "flowers");
    newsPaper = products.filter((item) => item.category == "newspaper");
    fruits = products.filter((item) => item.category == "fruits");
    vegetables = products.filter((item) => item.category == "vegetables");
    tifin = products.filter((item) => item.category == "tifin");
    dairy = products.filter((item) => item.category == "dairy");
    res.json({ status: "ok", msg: "Cached Updated" });
  } catch (error) {
    res.json({ status: 400, msg: "Something Went Wrong" });
  }
});

module.exports = router;
