import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { MatSnackBar } from '@angular/material';
import { BaseContract } from '@0x/base-contract';
import { HttpClient } from '@angular/common/http';
import { ZkLoanService } from "../../zk-loan.service";
// import {Component} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';


var Web3 = require("web3");
var contract_addresses_1 = require("@0x/contract-addresses");
var ContractWrappers = require("@0x/contract-wrappers").ContractWrappers;
var contract_artifacts_1 = require("@0x/contract-artifacts");
var order_utils_1 = require("@0x/order-utils");
var utils_1 = require("@0x/utils");
var subproviders_1 = require("@0x/subproviders");
import { SignerSubprovider, RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { symbol } from 'prop-types';
var Web3Wrapper = require("@0x/web3-wrapper").Web3Wrapper;
var http = require('@0x/connect').HttpClient;
// var ENS = require('ethereum-ens');

// var accounts;
var ens;


var network_config = {
    httpradar: new http("https://api.radarrelay.com/0x/v2"),
    RPC_PROVIDER: "https://mainnet.infura.io/v3/425313c6627e43ddb43324a9419c9508",
    NETWORK_ID: 1,
    ASSET_URL: "https://api.radarrelay.com/v2/markets/",
    ETHERSCAN_TX: "https://etherscan.io/tx/"
}

let tokenAddresses = {
    "DAI": "a",
    "DGX": "b",
    "WETH": "c",
    "USDC": "d",
    "LST": "e"
}

let loanPeriodInSeconds = {
    "1 MONTH": 2592000,
    "3 MONTH": 7776000,
    "6 MONTH": 15552000
}


const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const DECIMALS = 18;
const COLLATERAL_TOKENS = ["DAI", "USDC", "WETH"];
const LENDING_TOKENS = ["DAI", "WETH", "LST"];
const LOAN_PERIOD = ["1 MONTH", "3 MONTH", "6 MONTH"];

declare let require: any;

// setting provider to infura
var web3 = new Web3(new Web3.providers.HttpProvider(network_config.RPC_PROVIDER));

var request;
var makerAssetData, takerAssetData;
var zrxTokenAddress, etherTokenAddress, exchangeAddress;
var providerEngine, web3Wrapper, contractWrappers;
var takerAssetAmount, signedOrder;
var exchange, weth, zrx;
var taker, maker;

declare let window: any;


// this map stores all the tokens, with their symbol as the key, and address and decimals as values as a object
let tokens = new Map();

function getRandomFutureDateInSeconds() {
    return new utils_1.BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(utils_1.BigNumber.ROUND_CEIL);

}

const VIEW_REQUESTS = {
    "112132": [
        { "address": "0x123121321", "public_key": "1231dfdffdf" },
        { "address": "0x123767661", "public_key": "1231dfasdfasdfasdff" }
    ],
    "112133": [],
    "112134": [{ "address": "0x123121321", "public_key": "1231dfdffdf" }]
}

const LOAN_DATA = [
    {
        "Loan Hash": "112132",
        "Lending Token": "DAI",
        "Collateral Token": "ETH",
        "Daily Interest Rate": 5.00,
        "Loan Period": LOAN_PERIOD[1],
        "Order Expiry": "12",
        "Monitoring Fee": 1.00,
        "Loan Amount": 500.0,
        "View Request Status": false
        //   description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        //       atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`
    },
    {
        "Loan Hash": "112133",
        "Lending Token": "DAI",
        "Collateral Token": "WETH",
        "Daily Interest Rate": 15.00,
        "Loan Period": LOAN_PERIOD[2],
        "Order Expiry": "12",
        "Monitoring Fee": 1.00,
        "Loan Amount": 400.0,
        "View Request Status": true
    },
    {
        "Loan Hash": "112134",
        "Lending Token": "DAI",
        "Collateral Token": "WETH",
        "Daily Interest Rate": 10.00,
        "Loan Period": LOAN_PERIOD[0],
        "Order Expiry": "12",
        "Monitoring Fee": 1.00,
        "Loan Amount": 8000.0,
        "View Request Status": false
    },
];

@Component({
    selector: 'app-meta-sender',
    templateUrl: './meta-sender.component.html',
    styleUrls: ['./meta-sender.component.css'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class MetaSenderComponent implements OnInit {
    private web3: any;
    accounts: string[];
    assets: any;
    lendOrders = LOAN_DATA;
    myLendOrders ;
    columnsToDisplay = ['_id', 'lend_currency_symbol', 'borrow_currency_symbol', 'daily_interest_rate', 'position_duration_month', 'bucket'];
    // expandedElement: PeriodicElement | null;

    model = {
        amount: 5,
        receiver: '',
        balance: 0,
        account: '',
        eth_receiver: '',
        eth_amount: '',
        orders: '',
        tokens: tokens,
        weth_amount: '',
        collateral_token: '',
        lending_token: '',
        daily_interest_rate: 0,
        loan_period: '',
        loan_amount: '',
        order_expiry: '',
        viewRequests: VIEW_REQUESTS,
        monitoring_fee: '',
        collateral_token_list: COLLATERAL_TOKENS,
        lending_token_list: LENDING_TOKENS,
        loan_period_list: LOAN_PERIOD
    };

    constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar, private http: HttpClient, private zkLoanService: ZkLoanService) {
        console.log('Constructor: ' + web3Service);
        window.addEventListener('load', async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                try {
                    // Request account access if needed
                    await window.ethereum.enable();
                    // Acccounts now exposed
                    console.log("inside window ethereum");
                    console.log(window.web3);
                    // this.web3.eth.sendTransaction({/* ... */ });
                } catch (error) {
                    // User denied account access...
                    console.log('Cannot send the transaction')
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                window.web3 = new Web3(this.web3.currentProvider);
                // Acccounts always exposed
                this.web3.eth.sendTransaction({/* ... */ });
            }
            // Non-dapp browsers...
            else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        });
    }

    ngOnInit(): void {
        console.log('OnInit: ' + this.web3Service);
        console.log(this);
        this.watchAccount();
        this.model.account = "0x7924259759c86CAf163128AfD3570Db18925425f";
        // get important addresses
        const contractAddresses = contract_addresses_1.getContractAddressesForNetworkOrThrow(network_config.NETWORK_ID);
        zrxTokenAddress = contractAddresses.zrxToken;
        etherTokenAddress = contractAddresses.etherToken;
        exchangeAddress = contractAddresses.exchange;

        //get abis for weth, zrx, and exchange contracts
        var abiexchange = contract_artifacts_1.Exchange.compilerOutput.abi;
        var abizrx = contract_artifacts_1.ZRXToken.compilerOutput.abi;
        var abiweth = contract_artifacts_1.WETH9.compilerOutput.abi;

        // get the contract instances 
        weth = new web3.eth.Contract(abiweth, etherTokenAddress);
        zrx = new web3.eth.Contract(abizrx, zrxTokenAddress);
        exchange = new web3.eth.Contract(abiexchange, exchangeAddress);

        makerAssetData = order_utils_1.assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
        takerAssetData = order_utils_1.assetDataUtils.encodeERC20AssetData(etherTokenAddress);

        //setting up the provider engine. using the injected web3 by metamask for signing.
        providerEngine = new subproviders_1.Web3ProviderEngine();
        providerEngine.addProvider(new SignerSubprovider(this.web3Service.getProvider()));
        providerEngine.addProvider(new subproviders_1.RPCSubprovider(network_config.RPC_PROVIDER));
        providerEngine.start();
        this.getOrders();
        this.getMyOrders();

        // get the accounts available using the provided web3
        (async () => {
            console.log("this inside function");
            // Get all of the accounts through the Web3Wrapper
            const web3Wrapper = new Web3Wrapper(providerEngine);
            console.log(this.web3Service.getProvider());
            [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
            this.model.account = maker;
            // ens = new ENS(window.ethereum);
            // console.log('ENS', await ens.resolver('tezan.deserves.eth').addr())
            // var name = await ens.reverse(maker).name()
            // if (maker != await ens.resolver(name).addr()) {
            //     name = null;
            // }
            // console.log('REVERSE', name)
            taker = maker;
            console.log("accounts using web3 provider engine");
            console.log(maker + " : " + taker);
            this.getOrders();
        })();


        web3Wrapper = new Web3Wrapper(providerEngine);
        contractWrappers = new ContractWrappers(providerEngine, { networkId: network_config.NETWORK_ID });

    }

    async watchAccount() {
        this.web3Service.accountsObservable.subscribe((accounts) => {
            this.accounts = accounts;
            this.model.account = accounts[0];
            this.refreshBalance();
            console.log("Hie", this.model.account)
        });
    }

    get_bucket(){
        if (parseInt(this.model.loan_amount)<10)
        return "1-10";
        if (parseInt(this.model.loan_amount)<100)
        return "10-100";
        if (parseInt(this.model.loan_amount)<1000)
        return "100-1000";
        else 
        return "1000 - ";
        
    }
    async refreshBalance() {
        console.log("refreshing balance...");
    }
    async getOrders(){
        this.setStatus("Refreshing the order book ....");
        var url = "http://localhost:8000/kernel/";
        this.http.get(url).subscribe(async(res) => {
            console.log("orders", res["result"]);
            this.lendOrders = res["result"];
            this.setStatus("OrderBook Updated!");
          });
        //   await this.getMyOrders(); 
    }

    async getMyOrders(){
        this.setStatus("Refreshing my lend orders ....");
        var url = "http://localhost:8000/kernel/lender/" + this.model.account;
        console.log("url for my orders", url);
        this.http.get(url).subscribe(async(res) => {
            console.log("orders", res["result"]);
            this.myLendOrders = res["result"];
            this.setStatus("My Orders Updated!");
          });
    }

    // for pop ups with messages of different duration.
    setStatusShort(status) {
        this.matSnackBar.open(status, null, { duration: 2000 });
    }
    setStatus(status) {
        this.matSnackBar.open(status, null, { duration: 3000 });
    }
    setStatusLong(status) {
        this.matSnackBar.open(status, null, { duration: 4000 });
    }


    setCollateralToken(e) {

        console.log('Setting selling token : ' + e.value);
        this.model.collateral_token = e.value.toUpperCase();
    }

    setLendingToken(e) {

        console.log('Setting selling token : ' + e.value);
        this.model.lending_token = e.value.toUpperCase();
    }
    setLoanPeriod(e) {

        console.log('Setting loan period : ' + e.value);
        this.model.loan_period = e.value;
    }

    setLoanAmount(e) {

        console.log('Setting daily interest rate : ' + e.target.value);
        this.model.loan_amount = e.target.value;
    }
    setDailyInterestRate(e) {

        console.log('Setting daily interest rate : ' + e.target.value);
        this.model.daily_interest_rate = e.target.value;
    }

    setOrderExpiry(e) {

        console.log('Setting daily interest rate : ' + e.target.value);
        this.model.order_expiry = e.target.value;
    }

    setMonitoringFee(e) {

        console.log('Setting daily interest rate : ' + e.target.value);
        this.model.monitoring_fee = e.target.value;
    }

    async get_collateral_amount(){
        var amount = parseInt(this.model.loan_amount) * this.getRate(this.model.lending_token, this.model.collateral_token);
        return amount;
    }

    async placeOrder() {
        
        var body = {
            "lender" :"0x7924259759c86CAf163128AfD3570Db18925425f",
            "borrower": "0x0000000000000000000000000000000000000000",
            "relayer": "0x0000000000000000000000000000000000000000",
            "wrangler": "0x0000000000000000000000000000000000000000",
            "borrow_currency_symbol": this.model.collateral_token,
            "lend_currency_symbol": this.model.lending_token,
            "borrow_currency_address": tokenAddresses[this.model.collateral_token],
            "lend_currency_address":tokenAddresses[this.model.lending_token],
            "expires_at":this.model.order_expiry,
            "daily_interest_rate":this.model.daily_interest_rate,
            "monitoring_fee":this.model.monitoring_fee,
            "position_duration_month": this.model.loan_period,
            "position_duration":loanPeriodInSeconds[this.model.loan_period],
            "loan_amount": parseInt(this.model.loan_amount),
            "collateral_amount": this.get_collateral_amount(),
            "bucket":this.get_bucket()
        }
        console.log("placing order : ", body);
        this.setStatus("Placing your order in the orderbook...");
        const status = <Boolean>await this.zkLoanService.createKernel(body);
        this.setStatus("Order Placed!");
            // this.model.account, 
            // tokenAddresses[this.model.collateral_token], 
            // tokenAddresses[this.model.lending_token],
            // this.model.monitoring_fee,
            // "0x7bf20bc9c53493cfd19f9378b1bb9f36ceeee7e76b724efeca38f7d1c96f8a04", //salt
            // this.model.order_expiry,
            // this.model.daily_interest_rate,
            // loanPeriodInSeconds[this.model.loan_period]
        // })


    }

    getRate(lendToken, collateralToken){
        if(lendToken === "DAI" && collateralToken === "WETH") return 0.0018;
        if(lendToken === "DAI" && collateralToken === "DGX") return 0.0216;
        if(lendToken === "USDC" && collateralToken === "WETH") return 0.01;
        if(lendToken === "USDC" && collateralToken === "DAI") return 1.01;
    }


    async requestViewAccess(loanHash: string, address: string) {

        console.log("Sending View Request .....");
        this.setStatus("Sending View Request to the Lender ....");
        const status = <Boolean>await this.zkLoanService.requestViewAccess(loanHash, address);
        console.log(status);

    }

    async grantViewAccess(loanHash: string, address: string) {

        console.log("Granting View Access .....");
        this.setStatus("Granting View Access to the borrower ....");
        const status = <Boolean>await this.zkLoanService.grantViewAccess(loanHash, address);
        console.log(status);
    }

    async updateWethBalance() {
        // update weth, eth, and zrx balance. these are the 3 most important tokens while dealing with 0x.
        console.log("balances of taker : " + taker + " : ");
        var makerweth = await weth.methods.balanceOf(taker).call();
        var makerzrx = await zrx.methods.balanceOf(taker).call();
        var makereth = await web3.eth.getBalance(taker);

        // sets the balances in wei form for easy readability and showing on frontend.
        // this.model.weth_balance = web3.utils.fromWei(makerweth + "");
        // this.model.zrx_balance = web3.utils.fromWei(makerzrx + "");
        // this.model.eth_balance = web3.utils.fromWei(makereth + "");

        // console.log("maker eth : " + web3.utils.fromWei(makereth + "") + " maker weth : " + web3.utils.fromWei(makerweth + "") + " maker zrx : " + web3.utils.fromWei(makerzrx + ""));
    }

    // basic utility functions
    convertToEth(balance_in_wei) {
        return web3.utils.fromWei(balance_in_wei + "");
    }
    convertToWei(balance_in_eth) {
        return web3.utils.toWei(balance_in_eth + "");
    }
    getAssetData(tokenAddress) {

        return order_utils_1.assetDataUtils.encodeERC20AssetData(tokenAddress);
    }

}
