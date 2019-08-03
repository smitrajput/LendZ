const Web3 = require('web3');
var MetaCoin = require('./build/contracts/MetaCoin.json');
// const MetaCoin = artifacts.require("MetaCoin");

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));
// console.log(web3);

async function getBalance()  {

    var accounts = await web3.eth.getAccounts();
    var Metacoin = new web3.eth.Contract(MetaCoin.abi, "0x35D8a615F9486647C41492c34d6B346Bf98f74bC");
    // console.log(MetaCoin);
    // var Metacoin = await MetaCoin.deployed();
    const balance = await Metacoin.methods.getBalance(accounts[0]).call();
    // const txhash = Metacoin.methods.setVersion(4).send({from:accounts[0]});
    const receipt = await Metacoin.methods.setVersion(5).send({from:accounts[0]});
                
    console.log("balance retreived: ", balance);
    console.log("receipt retreived: ", receipt);
    // console.log("txhash retreived: ", txhash);

}

getBalance();