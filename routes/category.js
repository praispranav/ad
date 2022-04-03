var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");
const Image = require("../schema/imageStore");
var mongoose = require("mongoose");
const CarauselImage = require("../schema/sliderImages");

let flowers = [];
let tifin = [];
let newsPaper = [];
let fruits = [];
let vegetables = [];
let dairy = [];
let stationary = [];
let grocery = [];

let a = 0;

const fetchPro = () => {
  return new Promise(async (resolve, rejects) => {
    const products = await Products.find();
    flowers = products.filter((item) => item.category == "flowers");
    newsPaper = products.filter((item) => item.category == "newspaper");
    fruits = products.filter((item) => item.category == "fruits");
    vegetables = products.filter((item) => item.category == "vegetables");
    tifin = products.filter((item) => item.category == "tifin");
    dairy = products.filter((item) => item.category == "dairy");
    stationary = products.filter((item) => item.category === "stationary");
    grocery = products.filter((item) => item.category === "grocery");
    resolve()
  });
};

router.get("/flowers", async function (req, res, next) {
  if(flowers.length === 0) await fetchPro();
  res.json(flowers);
});

router.get("/vegetables", async function (req, res, next) {
  if(vegetables.length === 0) await fetchPro();
  res.json(vegetables);
});

router.get("/product/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    console.log(id);
    const products = await Products.find({ _id: id });
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.get("/fruits", async function (req, res, next) {
  if(fruits.length === 0) await fetchPro();
  res.json(fruits);
});

router.get("/tifin", async  function (req, res, next) {
  if(tifin.length === 0) await fetchPro();
  res.json(tifin);
});

router.get("/newspaper", async  function (req, res, next) {
  if(newsPaper.length === 0) await fetchPro();
  res.json(newsPaper);
});

router.get("/dairy", async  function (req, res, next) {
  if(dairy.length === 0) await fetchPro();
  res.json(dairy);
});

router.get("/stationary", async  function (req, res, next) {
  if(stationary.length) await fetchPro();
  res.json(stationary);
});

router.get("/grocery", async function (req, res, next) {
  if(grocery.length) await fetchPro();
  res.json(grocery);
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
  res.json(timeRange);
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

const sliderImages = [
  "https://source.unsplash.com/1024x768/?nature",
  "https://source.unsplash.com/1024x768/?water",
  "https://source.unsplash.com/1024x768/?girl",
  "https://source.unsplash.com/1024x768/?tree", // Network image
];

router.get("/slider/image", async (req, res) => {
  const result = await CarauselImage.find();
  const newArray = new Array();
  result.forEach((item) => newArray.push(item.img));
  res.json(newArray);
});

router.get("/update", async function (req, res, next) {
  await fetchPro();
  res.json({ status: "ok", msg: "Cached Updated" });
});

module.exports = router;
