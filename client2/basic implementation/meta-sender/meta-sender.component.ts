import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { MatSnackBar } from '@angular/material';
import { BaseContract } from '@0x/base-contract';
import { HttpClient } from '@angular/common/http';

var Web3 = require("web3");
var contract_addresses_1 = require("@0x/contract-addresses");
var ContractWrappers = require("@0x/contract-wrappers").ContractWrappers;
var contract_artifacts_1 = require("@0x/contract-artifacts");
var order_utils_1 = require("@0x/order-utils");
var utils_1 = require("@0x/utils");
var subproviders_1 = require("@0x/subproviders");
import { SignerSubprovider, RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
var Web3Wrapper = require("@0x/web3-wrapper").Web3Wrapper;
var http = require('@0x/connect').HttpClient;

// uncomment to use for kovan testnet 
var network_config = {
    httpradar: new http("https://api.kovan.radarrelay.com/0x/v2"),
    RPC_PROVIDER: "https://kovan.infura.io/v3/425313c6627e43ddb43324a9419c9508",
    NETWORK_ID: 42,
    ASSET_URL: "https://api.kovan.radarrelay.com/v2/markets/",
    ETHERSCAN_TX: "https://kovan.etherscan.io/tx/"
}
// uncomment to use for mainnet 
// var network_config = {
//     httpradar:new http("https://api.radarrelay.com/0x/v2"),
//     RPC_PROVIDER:"https://mainnet.infura.io/v3/425313c6627e43ddb43324a9419c9508",
//     NETWORK_ID:1,
//     ASSET_URL:"https://api.radarrelay.com/v2/markets/",
//     ETHERSCAN_TX : "https://etherscan.io/tx/"
// }

var httpradar = new http("https://api.kovan.radarrelay.com/0x/v2");
// var httpradar = new http("https://api.radarrelay.com/0x/v2");
const RPC_PROVIDER = "https://kovan.infura.io/v3/425313c6627e43ddb43324a9419c9508";
// const RPC_PROVIDER = "https://mainnet.infura.io/v3/425313c6627e43ddb43324a9419c9508";
const NETWORK_ID = 42;
// const NETWORK_ID = 1;
const ASSET_URL = "https://api.kovan.radarrelay.com/v2/markets/";
// const ASSET_URL = "https://api.radarrelay.com/v2/markets/";
const ETHERSCAN_TX = "https://kovan.etherscan.io/tx/";
// const ETHERSCAN_TX = "https://etherscan.io/tx/";

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const DECIMALS = 18;
declare let require: any;

var web3 = new Web3(new Web3.providers.HttpProvider(network_config.RPC_PROVIDER));

var request;
var makerAssetData, takerAssetData;
var zrxTokenAddress, etherTokenAddress, exchangeAddress;
var providerEngine, web3Wrapper, contractWrappers;
var takerAssetAmount, signedOrder;
var exchange, weth, zrx;
var taker, maker;

function getRandomFutureDateInSeconds() {
    return new utils_1.BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(utils_1.BigNumber.ROUND_CEIL);

}

@Component({
    selector: 'app-meta-sender',
    templateUrl: './meta-sender.component.html',
    styleUrls: ['./meta-sender.component.css']
})
export class MetaSenderComponent implements OnInit {
    accounts: string[];
    assets: any;

    model = {
        amount: 5,
        receiver: '',
        balance: 0,
        account: '',
        eth_receiver: '',
        eth_amount: '',
        orders: '',
        weth_amount: '',
        validation_status: false,
        validation_message: null,
        assets: this.assets,
        sell_token: null,
        buy_token: null,
        baseTokenAddress: '',
        quoteTokenAddress: '',
        baseAssetData: '',
        quoteAssetData: '',
        takerAssetAddress: '',
        makerAssetAddress: '',
        bids_flag: true,
        takerAssetAmount: '',
        approval_tx: null,
        fill_tx: null,
        fill_status: null,
        max_buy_amount: 0,
        max_sell_amount: 0,
        price: null,
        weth_balance: null,
        eth_balance: null,
        zrx_balance: null,
        order_available: false,
        trade_possible: null,
        balance_sell_token: '',
        balance_buy_token: '',
        approval_status: null
    };

    status = '';

    constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar, private http: HttpClient) {
        console.log('Constructor: ' + web3Service);
    }

    ngOnInit(): void {
        console.log('OnInit: ' + this.web3Service);
        console.log(this);
        this.watchAccount();

        const contractAddresses = contract_addresses_1.getContractAddressesForNetworkOrThrow(network_config.NETWORK_ID);
        zrxTokenAddress = contractAddresses.zrxToken;
        etherTokenAddress = contractAddresses.etherToken;
        exchangeAddress = contractAddresses.exchange;

        var abiexchange = contract_artifacts_1.Exchange.compilerOutput.abi;
        var abizrx = contract_artifacts_1.ZRXToken.compilerOutput.abi;
        var abiweth = contract_artifacts_1.WETH9.compilerOutput.abi;

        weth = new web3.eth.Contract(abiweth, etherTokenAddress);
        zrx = new web3.eth.Contract(abizrx, zrxTokenAddress);
        exchange = new web3.eth.Contract(abiexchange, exchangeAddress);

        makerAssetData = order_utils_1.assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
        takerAssetData = order_utils_1.assetDataUtils.encodeERC20AssetData(etherTokenAddress);

        providerEngine = new subproviders_1.Web3ProviderEngine();
        providerEngine.addProvider(new SignerSubprovider(this.web3Service.getProvider()));
        providerEngine.addProvider(new subproviders_1.RPCSubprovider(network_config.RPC_PROVIDER));
        console.log("about to start provider")
        // console.log(providerEngine);
        // providerEngine.addProvider(new subproviders_1.RPCSubprovider('http://localhost:8545'));
        providerEngine.start();

        (async () => {
            console.log("this inside function");
            // Get all of the accounts through the Web3Wrapper
            const web3Wrapper = new Web3Wrapper(providerEngine);
            console.log(this.web3Service.getProvider());
            [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
            taker = maker;
            console.log("accounts using web3 provider engine ");
            console.log(maker + " : " + taker);
        })();

        web3Wrapper = new Web3Wrapper(providerEngine);
        contractWrappers = new ContractWrappers(providerEngine, { networkId: network_config.NETWORK_ID });

        this.getAssets();
        // this.updateWethBalance();

    }

    // async  getAssets() {

    //     var assets = await network_config.httpradar.getAssetPairsAsync();
    //     console.log(assets);
    //     this.model.assets = assets;

    // }

    getAssets() {
        this.http.get(network_config.ASSET_URL).subscribe((res) => {
            // console.log(res);
            this.model.assets = res;
            this.setStatusShort("Available Markets Received")
        })
    }

    print_pairs() {
        var i;
        for (i = 0; i < this.model.assets.length; i++) {
            console.log(this.model.assets[i].displayName);
            console.log(this.model.assets[i].baseTokenAddress + " : " + this.model.assets[i].quoteTokenAddress);
        }
    }

    watchAccount() {
        this.web3Service.accountsObservable.subscribe((accounts) => {
            this.accounts = accounts;
            this.model.account = accounts[0];
            this.refreshBalance();
        });
    }

    async refreshBalance() {
        console.log("refreshing balance...");
    }
    setStatusShort(status) {
        this.matSnackBar.open(status, null, { duration: 2000 });
    }
    setStatus(status) {
        this.matSnackBar.open(status, null, { duration: 3000 });
    }
    setStatusLong(status) {
        this.matSnackBar.open(status, null, { duration: 4000 });
    }


    async sendEth() {

        const eth_amount = this.model.eth_amount;
        const eth_receiver = this.model.eth_receiver;

        console.log('Sending eth' + eth_amount + ' to ' + eth_receiver);

        this.setStatus('Initiating transaction... (please wait)');
        try {

            var transaction = await this.web3Service.sendEth(eth_amount, eth_receiver);

            if (!transaction) {
                this.setStatus('Transaction failed!');
            } else {
                this.setStatus('Transaction complete!');
                console.log(transaction);
            }
        } catch (e) {
            console.log(e);
            this.setStatus('Error sending coin; see log.');
        }
    }

    async getOrderBook() {

        // request = {
        //     baseAssetData: makerAssetData,
        //     quoteAssetData: takerAssetData
        // }

        request = {
            baseAssetData: this.model.baseAssetData,
            quoteAssetData: this.model.quoteAssetData
        }
        console.log("requesting order book for ")
        console.log("base data : " + this.model.baseAssetData)
        console.log("quote data : " + this.model.quoteAssetData)

        console.log("data that was used earlier");
        console.log("zrx asset data " + makerAssetData);
        console.log("eth asset data : " + takerAssetData);
        // var orderbook = await network_config.httpradar.getOrderbookAsync(request, { networkId: network_config.NETWORK_ID })
        //     .catch(err => console.log(err));
        this.setStatus("getting the best order...");
        var orderbook = await network_config.httpradar.getOrderbookAsync(request)
            .catch(err => console.log(err));

        if (orderbook.asks.total === 0) {
            throw new Error('No orders found on the SRA Endpoint. Choose another token pair.');
        }
        //as the order changed, remove the order validation message
        this.model.validation_message = null;
        this.model.validation_status = false;

        var order_filling_bid = orderbook["bids"]["records"][0]["order"];
        var order_filling_ask = orderbook["asks"]["records"][0]["order"];

        if (this.model.bids_flag) {
            console.log("best order is bid  ");
            console.log("Best Bid Order for the corresponding assets : ");
            console.log("maker asset amount : " + web3.utils.fromWei(order_filling_bid.makerAssetAmount + ""));
            console.log("taker asset amount : " + web3.utils.fromWei(order_filling_bid.takerAssetAmount + ""));

            this.model.max_sell_amount = web3.utils.fromWei(order_filling_bid.takerAssetAmount + "");
            this.model.max_buy_amount = web3.utils.fromWei(order_filling_bid.makerAssetAmount + "");

            this.model.takerAssetAmount = order_filling_bid.takerAssetAmount;

            var price = order_filling_bid.makerAssetAmount / (order_filling_bid.takerAssetAmount);
            this.model.price = "price : " + " 1 " + this.model.sell_token + " ===> " + price + " " + this.model.buy_token;
            console.log("price : " + " 1 " + this.model.sell_token + " ===> " + price + " " + this.model.buy_token);
            signedOrder = order_filling_bid;

            this.model.order_available = true;
        }
        else {
            console.log("best order is ask ");
            console.log("Best Ask Order for the corresponding assets : ");
            console.log("maker asset amount : " + web3.utils.fromWei(order_filling_ask.makerAssetAmount + ""));
            console.log("taker asset amount : " + web3.utils.fromWei(order_filling_ask.takerAssetAmount + ""));
            this.model.takerAssetAmount = order_filling_ask.takerAssetAmount;

            this.model.max_sell_amount = web3.utils.fromWei(order_filling_ask.takerAssetAmount + "");
            this.model.max_buy_amount = web3.utils.fromWei(order_filling_ask.makerAssetAmount + "");

            var price = order_filling_ask.makerAssetAmount / (order_filling_ask.takerAssetAmount);
            this.model.price = "price : " + " 1 " + this.model.sell_token + " ===> " + price + " " + this.model.buy_token;
            console.log("price : " + " 1 " + this.model.sell_token + " ===> " + price + " " + this.model.buy_token);
            signedOrder = order_filling_ask;

            this.model.order_available = true;
        }

        await this.updateCurrentTokenBalance();
        // console.log("Best Bid Order for the corresponding assets : ");
        // console.log("maker asset amount : " + web3.utils.fromWei(order_filling.makerAssetAmount + ""));
        // console.log("taker asset amount : " + web3.utils.fromWei(order_filling.takerAssetAmount + ""));

        // order_filling = orderbook["asks"]["records"][0]["order"];
        // signedOrder = order_filling;
        // console.log("Best Ask Order for the corresponding assets : ");
        // console.log("maker asset amount : " + web3.utils.fromWei(order_filling.makerAssetAmount + ""));
        // console.log("taker asset amount : " + web3.utils.fromWei(order_filling.takerAssetAmount + ""));

        // this.model.orders = "Best Ask Order for the corresponding assets : " + "maker asset amount : "
        //     + web3.utils.fromWei(order_filling.makerAssetAmount + "") + "\n" +
        //     "taker asset amount : " + web3.utils.fromWei(order_filling.takerAssetAmount + "");



        // console.log(orderbook);
        // await this.validate_filling_order();

    }

    async zrkapprove() {
        console.log("inside zkapprove");
        console.log("taker address for approval : " + taker + " for token : " + this.model.takerAssetAddress);

        // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
        console.log(this.model.takerAssetAddress + " : " + taker);
        // console.log(contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync)
        // const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        //     zrxTokenAddress,
        //     taker,
        // );
        // var takerstring = taker + "";
        // contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(zrxTokenAddress, takerstring, { networkId: network_config.NETWORK_ID, gasLimit: 100000 })
        //     .then((makerZRXApprovalTxHash) => console.log(makerZRXApprovalTxHash))
        //     .catch(err => console.log(err));
        // var tx1 = await web3Wrapper.awaitTransactionSuccessAsync(makerZRXApprovalTxHash);
        // console.log("inside zrkapprove. zrx aproval tx hash : " + makerZRXApprovalTxHash + " \n " + tx1);
        this.setStatusShort("checking approval amount for sell token...");
        var allowance = await contractWrappers.erc20Token.getProxyAllowanceAsync(
            this.model.takerAssetAddress,
            taker,
        ).catch(err => console.log(err));
        console.log("the allowance set for the selling token is : " + allowance);
        // getProxyAllowanceAsync

        if (Number(allowance) < Number(this.model.takerAssetAmount)) {
            console.log(allowance + " : " + this.model.takerAssetAmount);
            const takerAssetApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
                this.model.takerAssetAddress,
                taker,
            ).catch(err => console.log(err));
            var tx2 = await web3Wrapper.awaitTransactionSuccessAsync(takerAssetApprovalTxHash).catch(err => console.log(err));
            console.log("inside zrkapprove. weth aproval tx hash : " + takerAssetApprovalTxHash + " \n " + tx2);
            if (tx2) {
                this.model.approval_tx = network_config.ETHERSCAN_TX + takerAssetApprovalTxHash + "/ ";
            }
            else
                this.model.approval_tx = "Transaction failed. Cannot send the approval Transaction";

        }
        else {
            this.model.approval_status = "No need for approval for this token. Already approved."
            console.log("No need for approval for this transaction");
        }

        // await getOrderConfigRequest();
        console.log("approve returned");
        // await this.getOrderBook();

    }

    async validate_filling_order() {

        // taker = await web3Wrapper.getAvailableAddressesAsync();
        taker = taker + "";
        var takerAssetAmount = this.model.takerAssetAmount;
        console.log("validating for taker : " + taker + " , for amount : " + takerAssetAmount);
        console.log(signedOrder.takerAssetAmount);
        this.setStatusLong("Checking validity of the order...")
        await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(signedOrder, takerAssetAmount, taker, { networkId: network_config.NETWORK_ID })
            .catch(err => {
                console.log(err);
                this.model.validation_message = err + " . Check if your internet Connection is stable";
                return;
            });

        if (this.model.validation_message == null) {
            this.model.validation_status = true;
            this.model.validation_message = "Order Validated. all set.";
        }
        // this.model.validation_message = "validated. all set.";
        console.log("leaving validating");
        // await this.fillOrder();
    }

    async fillOrder() {
        // taker = await web3Wrapper.getAvailableAddressesAsync();
        // taker = taker + "";
        if (!this.model.validation_status) {
            this.setStatusLong("The order is not validated. Filling order without validating might result in failing of transaction and loss of the transaction fees ");
            return;
        }
        this.model.fill_status = null;
        this.model.fill_tx = null;

        await this.printTokenBalance(this.model.baseTokenAddress, taker);
        await this.printTokenBalance(this.model.quoteTokenAddress, taker);

        console.log("inside filling order" + " order : " + signedOrder + " taker : " + taker + "amount : " + this.model.takerAssetAmount);
        this.setStatus("Setting up the transaction... Check metamask if no pop up appears");
        var txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, this.model.takerAssetAmount, taker, {
            gasLimit: 8000000,
            networkId: network_config.NETWORK_ID
        }).catch(err => console.log(err));
        console.log("the tx hash for order filling : " + txHash);
        let res = await web3Wrapper.awaitTransactionSuccessAsync(txHash)
            .catch(err => console.error(err));
        console.log(res);

        if (res) {
            this.setStatus("Transaction Successful! check below to see transaction on etherscan");
            this.model.fill_tx = network_config.ETHERSCAN_TX + txHash + "/ ";
            this.model.fill_status = " Transaction completed successfully. Check token balances. ";
        }
        else {
            this.model.fill_status = "Transaction failed. Could not fill the order successfully.";
        }

        await this.updateWethBalance();
        this.printTokenBalance(this.model.baseTokenAddress, taker);
        this.printTokenBalance(this.model.quoteTokenAddress, taker);
        await this.updateCurrentTokenBalance();


    }
    setAmount(e) {
        console.log('Setting amount: ' + e.target.value);
        this.model.amount = e.target.value;
    }

    setReceiver(e) {
        console.log('Setting receiver: ' + e.target.value);
        this.model.receiver = e.target.value;
    }
    setEthAmount(e) {
        console.log('Setting eth  amount: ' + e.target.value);
        this.model.eth_amount = e.target.value;
    }

    setEthReceiver(e) {
        console.log('Setting eth receiver: ' + e.target.value);
        this.model.eth_receiver = e.target.value;
    }

    setWethAmount(e) {
        console.log('Setting weth  amount: ' + e.target.value);
        this.model.weth_amount = e.target.value;
    }
    set_sell_token(e) {
        console.log('Setting selling token : ' + e.target.value);
        this.model.sell_token = e.target.value;

        // remove the order, order fill status message, approval status,
        // and order validation message if token changed.
        this.model.order_available = false;
        this.model.approval_status = null;
        this.model.fill_status = null;
        this.model.fill_tx = null;
        this.model.validation_status = false;
        this.model.validation_message = null;
        // if both the tokens are set, check whether trade between them is possible
        if (this.model.buy_token != null)
            this.check_trade();
    }
    set_buy_token(e) {
        console.log('Setting buy token : ' + e.target.value);
        this.model.buy_token = e.target.value;

        // remove the order, order fill status message, and order validation message if token changed.
        this.model.order_available = false;
        this.model.fill_status = null;
        this.model.fill_tx = null;
        this.model.validation_message = null;
        this.model.validation_status = false;
        // if both the tokens are set, check whether trade between them is possible
        if (this.model.sell_token != null)
            this.check_trade();
    }
    set_fill_amount(e) {
        console.log('Setting fill amount : ' + e.target.value);
        this.model.validation_message = null;
        this.model.validation_status = false;
        this.model.fill_tx = null;
        this.model.fill_status = null;
        this.model.takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new utils_1.BigNumber(e.target.value), DECIMALS);
        // this.model.takerAssetAmount = this.convertToWei(e.target.value);
        console.log("taker asset amount updated : " + this.model.takerAssetAmount);
        this.model.fill_status = null;
    }

    async  getWeth() {

        takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new utils_1.BigNumber(this.model.weth_amount), DECIMALS);
        this.setStatus("Preparing Transaction...")
        const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
            etherTokenAddress,
            takerAssetAmount,
            taker,
        ).catch(err => console.log(err));
        let tx3 = await web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash).catch(err => console.log(err));
        this.setStatus("Transaction in progress...");
        // var tx = await weth.methods.deposit({ from: taker, value: 1 });
        // console.log(tx.encodeABI());

        let value = web3.utils.toWei(1 + "");
        // let rawTx = {
        //     nonce: await web3.eth.getTransactionCount(taker),
        //     to: weth.address,
        //     data: weth.methods.deposit().encodeABI(),
        //     gasLimit: web3.utils.toHex(300000),
        //     chainId: 42,
        //     value: value
        // }

        // let signedTx = await web3.eth.accounts.signTransaction(rawTx, "0xfc6b8652f136961ef1d848c888e6cfc0ab61c9b81efbb79bb0930f0a723abea2")

        // web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (err, hash) => {
        //     if (err) {
        //         console.error(err);
        //     }
        //     else {
        //         console.log(hash);
        //     }
        // })
        await this.printBalance();
        if (tx3) {
            this.setStatus("Transaction Successful!");
            await this.updateWethBalance();
        }

    }

    async printBalance() {

        console.log("balances of maker : " + maker + " : ");
        var makerweth = await weth.methods.balanceOf(maker).call();
        var makerzrx = await zrx.methods.balanceOf(maker).call();
        var makereth = await web3.eth.getBalance(maker);
        console.log("maker eth : " + web3.utils.fromWei(makereth + "") + " maker weth : " + web3.utils.fromWei(makerweth + "") + " maker zrx : " + web3.utils.fromWei(makerzrx + ""));

        console.log("balances of taker : " + taker + " : ");
        var takerweth = await weth.methods.balanceOf(taker).call();
        var takerzrx = await zrx.methods.balanceOf(taker).call();
        var takereth = await web3.eth.getBalance(taker);
        console.log("taker eth : " + web3.utils.fromWei(takereth + "") + " taker weth : " + web3.utils.fromWei(takerweth + "") + " taker zrx : " + web3.utils.fromWei(takerzrx + ""));

    }

    async updateWethBalance() {

        console.log("balances of taker : " + taker + " : ");
        var makerweth = await weth.methods.balanceOf(taker).call();
        var makerzrx = await zrx.methods.balanceOf(taker).call();
        var makereth = await web3.eth.getBalance(taker);

        this.model.weth_balance = web3.utils.fromWei(makerweth + "");
        this.model.zrx_balance = web3.utils.fromWei(makerzrx + "");
        this.model.eth_balance = web3.utils.fromWei(makereth + "");

        // console.log("maker eth : " + web3.utils.fromWei(makereth + "") + " maker weth : " + web3.utils.fromWei(makerweth + "") + " maker zrx : " + web3.utils.fromWei(makerzrx + ""));
    }

    async printTokenBalance(tokenAddress, ownerAddress) {

        console.log("balance of owner " + ownerAddress + " for the token " + tokenAddress + " : ");
        var balance = await contractWrappers.erc20Token.getBalanceAsync(tokenAddress, ownerAddress)
            .catch(err => console.log(err));
        console.log(balance);
    }

    async updateCurrentTokenBalance() {

        // console.log("balance of owner " + ownerAddress + " for the token " + tokenAddress + " : ");
        var balance_sell_token = await contractWrappers.erc20Token.getBalanceAsync(this.model.takerAssetAddress, taker)
            .catch(err => console.log(err));
        console.log(balance_sell_token);
        var balance_buy_token = await contractWrappers.erc20Token.getBalanceAsync(this.model.makerAssetAddress, taker)
            .catch(err => console.log(err));
        console.log(balance_buy_token);
        this.model.balance_sell_token = this.model.sell_token + " : " + this.convertToEth(balance_sell_token);
        this.model.balance_buy_token = this.model.buy_token + " : " + this.convertToEth(balance_buy_token);
    }

    convertToEth(balance_in_wei) {
        return web3.utils.fromWei(balance_in_wei + "");
    }
    convertToWei(balance_in_eth) {
        return web3.utils.toWei(balance_in_eth + "");
    }
    getAssetData(tokenAddress) {

        return order_utils_1.assetDataUtils.encodeERC20AssetData(tokenAddress);
    }
    check_trade() {
        var i;
        for (i = 0; i < this.model.assets.length; i++) {
            var tokens = this.model.assets[i].displayName.split('/');
            console.log(tokens);
            var sell_token = this.model.sell_token.toUpperCase();
            var buy_token = this.model.buy_token.toUpperCase();
            console.log("sell token : " + sell_token + " buy token : " + buy_token);
            if (sell_token == tokens[0] && buy_token == tokens[1] || sell_token == tokens[1] && buy_token == tokens[0]) {

                this.model.trade_possible = "found a match : " + tokens + " trade possible";
                console.log("found a match : " + tokens + " trade possible");
                this.model.baseTokenAddress = this.model.assets[i].baseTokenAddress;
                this.model.quoteTokenAddress = this.model.assets[i].quoteTokenAddress;
                this.model.baseAssetData = this.getAssetData(this.model.baseTokenAddress);
                this.model.quoteAssetData = this.getAssetData(this.model.quoteTokenAddress);

                if (sell_token == tokens[0] && buy_token == tokens[1]) {
                    this.model.bids_flag = true;
                    this.model.takerAssetAddress = this.model.baseTokenAddress
                    this.model.makerAssetAddress = this.model.quoteTokenAddress
                }
                else {
                    this.model.bids_flag = false;
                    this.model.takerAssetAddress = this.model.quoteTokenAddress
                    this.model.makerAssetAddress = this.model.baseTokenAddress
                }
                // console.log("found both the tokens at " + is_sell + " and " + is_buy);
                // this.model.bids_flag = (is_sell < is_buy) ? true : false;

                return true;
            }
            // var is_sell = this.model.assets[i].displayName.search(this.model.sell_token.toUpperCase());
            // var is_buy = this.model.assets[i].displayName.search(this.model.buy_token.toUpperCase());
            // console.log("is sell available : " + is_sell + " is buy available : " + is_buy);
            // if (is_sell != -1 && is_buy != -1) {
            // this.model.baseTokenAddress = this.model.assets[i].baseTokenAddress;
            // this.model.quoteTokenAddress = this.model.assets[i].quoteTokenAddress;
            // this.model.baseAssetData = this.getAssetData(this.model.baseTokenAddress);
            // this.model.quoteAssetData = this.getAssetData(this.model.quoteTokenAddress);

            // console.log("found both the tokens at " + is_sell + " and " + is_buy);
            // this.model.bids_flag = (is_sell < is_buy) ? true : false;
            //     return true;
            // }
        }
        this.model.trade_possible = "could not find the asset pair. trade not possible. Choose another pair";
        console.log("could not find the asset pair. trade not possible");
        return false;
    }


}
