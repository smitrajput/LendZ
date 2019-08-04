const mongoose = require('mongoose');

const viewKeySchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    kernel_hash:{type:String},
    view_key:{type:String}
})

module.exports = mongoose.model('ViewKey', viewKeySchema);