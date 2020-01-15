const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
  imageUrl: {
    type: String,
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
});


module.exports = mongoose.model('Image', imageSchema);