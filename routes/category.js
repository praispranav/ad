var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");


let flowers = [];
let tifin = [];
let newsPaper = [];
let fruits = [];
let vegetables = [];

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

router.get("/update", async function (req, res, next) {
  try {
    const products = await Products.find();
    flowers = products.filter((item)=> item.category == 'flowers')
    newsPaper = products.filter((item)=> item.category == 'news-paper')
    fruits = products.filter((item)=> item.category == 'fruit')
    vegetables = products.filter((item)=> item.category == 'vegetables')
    vegetables = products.filter((item)=> item.category == 'tifin')
    res.json({ status: "ok", msg: "Cached Updated" });
  } catch (error) {
    res.json({ status: 400, msg: "Something Went Wrong" });
  }
});

module.exports = router;
