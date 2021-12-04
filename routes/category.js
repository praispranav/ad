var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");
const Image = require('../schema/imageStore')

let flowers = [];
let tifin = [];
let newsPaper = [];
let fruits = [];
let vegetables = [];
let dairy = []

let a = 0;

router.get("/flowers", function (req, res, next) {
  res.json(flowers);
});

router.get("/vegetables", function (req, res, next) {
  res.json(vegetables);
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

router.get("/image/:id", async (req, res) => {
  try {
    const id = req.params.id
    console.log(req.params)
    const result = await Image.find({ productId: id });
    res.status(200).json({ status: "ok", data: result });
    res.status;
  } catch (err) {
    console.log(error)
  }
});

router.get("/update", async function (req, res, next) {
  try {
    const products = await Products.find();
    flowers = products.filter((item)=> item.category == 'flowers')
    newsPaper = products.filter((item)=> item.category == 'newspaper')
    fruits = products.filter((item)=> item.category == 'fruits')
    vegetables = products.filter((item)=> item.category == 'vegetables')
    tifin = products.filter((item)=> item.category == 'tifin')
    dairy = products.filter((item)=> item.category == 'dairy')
    res.json({ status: "ok", msg: "Cached Updated" });
  } catch (error) {
    res.json({ status: 400, msg: "Something Went Wrong" });
  }
});

module.exports = router;
