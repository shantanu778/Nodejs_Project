const mongoose = require('mongoose');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

const Image = require('../models/images');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.files); 
  const title = req.body.title;
  const images = req.files;
  const price = req.body.price;
  const currency = req.body.currency;
  const description = req.body.description;
  if (!images) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        currency:currency
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("ERROR ON PRODUCT SAVE", errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        currency: currency
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  
  const product = new Product({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    price: price,
    description: description,
    currency: currency,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      for (i in images){
        // console.log(image);
        console.log(images[i].path);
        const image = new Image({
          imageUrl : images[i].path,
          productId : product._id
        });
        image
        .save()
        .then( result => {
          res.redirect('/admin/products');
        })
        .catch( err => {
          console.log(err);
        });
      }
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedCurrency = req.body.currency;
  const updatedimages = req.files;
  const updatedDesc = req.body.description;

  //console.log(updatedimages);
  const errors = validationResult(req);
  //console.log("Errors on Edit Product", errors.array());

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.currency = updatedCurrency
      if(updatedimages){
        Image.find({productId: prodId})
        .then(images => {
          for(let [i,image] of images.entries()){
            console.log(i, image);
            if(!updatedimages[i]){
              return;
            }
            image.imageUrl = updatedimages[i].path
            image.save()
          }
        })
      }
      return product.save().then(result => {
        //console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = async (req, res, next) => {
  try{
     let imagesArr = [];
     let products = await Product.find({ userId: req.user._id });

     for (product of products){
     let images = await Image.find({productId: product._id})
     if(images && images.length >0) imagesArr.push(images[0]);
    }
    console.log(imagesArr);
     return res.render('admin/products', {
       pageTitle: 'Admin Product',
       path: '/admin/products',
       prods: products,
       images: imagesArr
     });
  
}
  catch(err){
     const error = new Error(err);
     error.httpStatusCode = 500;
     return next(error);
  }
};

// exports.getProducts = (req, res, next) => {
//   let productsArr;
//   let imagesArr = [];
//   Product.find({ userId: req.user._id })
//     .then(products => {
//       productsArr = products
//       for (product of products){
//         Image.find({productId: product._id})
//         .then(images => {
//           imagesArr.push(images[0]);
//           return res.send("Hello World");
//         })
//         .catch(err => {
//           console.log(err);
//         });
//       }
//       console.log("Choosed Images", imagesArr);    
//     })
//     .then(result => {
//       return res.render('admin/products', {
//         pageTitle: 'Admin Product',
//         path: '/admin/products',
//         prods: productsArr,
//         images:imagesArr,
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });

// };

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
