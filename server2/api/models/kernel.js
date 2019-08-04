const mongoose = require('mongoose');

const kernelSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    hash:{type:String},
    lender:{type:String},
    borrower:{type:String},
    relayer:{type:String},
    wrangler:{type:String},
    borrow_currency_address:{type:String},
    lend_currency_address:{type:String},
    lend_currency_noteHash:{type:String},
    borrow_currency_noteHash:{type:String},
    monitoring_fee:{type:Number},
    expires_at:{type:Number},
    daily_interest_rate:{type:Number},
    position_duration:{type:Number}
})

module.exports = mongoose.model('Kernel', kernelSchema);