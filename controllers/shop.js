const Product = require('../models/product');
const Order = require('../models/order');
const Image = require('../models/images');

exports.getProducts = async (req, res, next) => {
  try{
    let imagesArr = [];
    let products = await Product.find();
    for (product of products){
      let images = await Image.find({productId: product._id})
      if(images && images.length >0) imagesArr.push(images[0]);
    }
    console.log(imagesArr[0].imageUrl);
      return res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        images: imagesArr
      });
  }
   catch(err){
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }

  // Product.find()
  //   .then(products => {
  //     console.log(products);
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'All Products',
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      Image.find({productId:prodId}).then(images => {
        res.render('shop/product-detail', {
          product: product,
          images: images,
          pageTitle: product.title,
          path: '/products'
        });
      })
      .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getIndex = async (req, res, next) => {
  try{
    let imagesArr = [];
    let products = await Product.find();
    for (product of products){
      let images = await Image.find({productId: product._id})
      if(images && images.length >0) imagesArr.push(images[0]);
    }
    console.log("shop", imagesArr);
      return res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        images: imagesArr
      });
  }
   catch(err){
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
};

exports.getCart = (req, res, next) => {
  //console.log("hello cart");
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      //console.log( user.cart.items)
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
