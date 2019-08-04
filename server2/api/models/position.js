const mongoose = require('mongoose');

const positionSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    hash:{type:String},
    index:{type:Number},
    status:{type:Number},
    nonce:{type:Number},
    created_at:{type:Number},
    lender:{type:String},
    kernel_creator:{type:String},
    borrower:{type:String},
    relayer:{type:String},
    wrangler:{type:String},
    borrow_currency_address:{type:String},
    lend_currency_address:{type:String},
    lend_currency_filled_noteHash:{type:String},
    lend_currency_owed_noteHash:{type:String},
    borrow_currency_noteHash:{type:String},
    monitoring_fee:{type:Number},
    expires_at:{type:Number},
    daily_interest_rate:{type:Number},
    position_duration:{type:Number}
})

module.exports = mongoose.model('Position', positionSchema);