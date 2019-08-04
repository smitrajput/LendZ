const mongoose = require('mongoose');

const kernelAccessSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    kernel_hash:{type:String},
    borrower_public_key:{type:String},
    borrower_address:{type:String},
    status:{type:String, default:"none"}
})

module.exports = mongoose.model('KernelAccess', kernelAccessSchema);