var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");
const Image = require("../schema/imageStore");
const NormalOrder = require("../schema/normalOrders");
const Users = require("../schema/user");
const Address = require("../schema/address");
const Subscription = require("../schema/subscriptions");
const Deliveries = require("../schema/deliverySubscription");
const ExtendRequest = require("../schema/extraQuantitySubscription");
const CancelledRequest = require("../schema/cacelledSubscriptions");

const auth = (token, next) => {
  if (token === "jasjkiwe47541weqe12wewq8ew51qe8qw7e") return true;
  else console.log("Unauthorised");
};

const uploadImage = async (_id, imageString, category) => {
  try {
    const data = {
      token: undefined,
      productId: _id,
      image: imageString,
      category: category,
    };

    await Image.create(data);
  } catch (err) {
    res.json({ status: "error", message: "Something Went Wrong" });
  }
};

class AuthCheck {
    token = "jasjkiwe47541weqe12wewq8ew51qe8qw7e";
    props;
    authorised;
    secured;
    constructor( req, res, next, secured ){
    
        this.props = { req, res, next }
        this.authorised = false;
        this.secured = secured;
        console.warn(secured)
        if(secured){
            this.init()
        }
    }

    init(){
        const userToken = this.props.req.body.token
        if(this.token === userToken ){
            this.authorised = true
        }
        console.log("Auth Status", this.authorised)
    }

    validator(){
        if(this.secured === false) return true
        else if(this.authorised && this.secured) return true
        else false
    }
}

router.get('/category', async ( req, res, next )=> new Product(req, res, next, false).getProducts() )
// router.post('/category', addProducts)
// router.delete('/category/:id', deleteProducts)
// router.put('/category', updateProducts)

class Product extends AuthCheck {
    res;
    constructor(req, res, next, secured){
        super();
        this.res = res;
    }

    getProducts(){
        if(this.validator(secured)){
            this.res.json({ message: "Working Fine With Auth", auth: this.authorised })
        } else this.res.json({ message: "U are Not Authorised"})
    }
}

const getProducts = async (req, res, next) =>{

}
const updateProducts = async (req, res, next) =>{

}
const deleteProducts = async (req, res, next) =>{

}
const addProducts = async (req, res, next) =>{

}

// router.get('/price/:id')
// router.post('/price')
// router.delete('/price/:id')
// router.put('/price')

// const getProducts = async (req, res, next) =>{

// }
// const updateProducts = async (req, res, next) =>{

// }
// const deleteProducts = async (req, res, next) =>{

// }
// const addProducts = async (req, res, next) =>{

// }

module.exports = router;