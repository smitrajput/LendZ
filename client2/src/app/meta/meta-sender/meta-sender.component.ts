import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { MatSnackBar } from '@angular/material';
import { BaseContract } from '@0x/base-contract';
import { HttpClient } from '@angular/common/http';
import { ZkLoanService } from "zk-loan.service";
// import {Component} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';


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


var network_config = {
    httpradar: new http("https://api.radarrelay.com/0x/v2"),
    RPC_PROVIDER: "https://mainnet.infura.io/v3/425313c6627e43ddb43324a9419c9508",
    NETWORK_ID: 1,
    ASSET_URL: "https://api.radarrelay.com/v2/markets/",
    ETHERSCAN_TX: "https://etherscan.io/tx/"
}

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const DECIMALS = 18;
const COLLATERAL_TOKENS = ["DAI", "DGX", "WETH"];
const LENDING_TOKENS = ["DAI", "USDC", "LST"];
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

// this map stores all the tokens, with their symbol as the key, and address and decimals as values as a object
let tokens = new Map();

function getRandomFutureDateInSeconds() {
    return new utils_1.BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(utils_1.BigNumber.ROUND_CEIL);

}

const VIEW_REQUESTS = {
    "112132":[
        {"address":"0x123121321", "public_key":"1231dfdffdf"},
        {"address":"0x123767661", "public_key":"1231dfasdfasdfasdff"}
    ],
    "112133":[],
    "112134":[{"address":"0x123121321", "public_key":"1231dfdffdf"}]
}

  const LOAN_DATA = [
    {   "Loan Hash":"112132",
        "Lending Token": "DAI",
        "Collateral Token": "ETH",
        "Daily Interest Rate": 5.00,
        "Loan Period": LOAN_PERIOD[1],
        "Order Expiry":"12",
        "Monitoring Fee":1.00,
        "Loan Amount":500.0,
        "View Request Status":false
    //   description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
    //       atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`
    },
    {   
        "Loan Hash":"112133",
        "Lending Token": "DAI",
        "Collateral Token": "WETH",
        "Daily Interest Rate": 15.00,
        "Loan Period": LOAN_PERIOD[2],
        "Order Expiry":"12",
        "Monitoring Fee":1.00,
        "Loan Amount":400.0,
        "View Request Status":true
    }, 
    {   
        "Loan Hash":"112134",
        "Lending Token": "DAI",
        "Collateral Token": "WETH",
        "Daily Interest Rate": 10.00,
        "Loan Period": LOAN_PERIOD[0],
        "Order Expiry":"12",
        "Monitoring Fee":1.00,
        "Loan Amount":8000.0,
        "View Request Status":false
    },
  ];  

@Component({
    selector: 'app-meta-sender',
    templateUrl: './meta-sender.component.html',
    styleUrls: ['./meta-sender.component.css'],
    animations: [
        trigger('detailExpand', [
          state('collapsed', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
      ],
})
export class MetaSenderComponent implements OnInit {
    accounts: string[];
    assets: any;
    lendOrders = LOAN_DATA;
    columnsToDisplay = ['loan_id', 'Lending TZkLoanServiceZkLoanServiceoken', 'Collateral Token', 'Daily Interest Rate', 'Loan Period'];
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
        collateral_token:'',
        lending_token:'',
        daily_interest_rate:0,
        loan_period:'',
        loan_amount:'',
        order_expiry:'',
        viewRequests:VIEW_REQUESTS,
        monitoring_fee:'',
        collateral_token_list:COLLATERAL_TOKENS,
        lending_token_list:LENDING_TOKENS,
        loan_period_list:LOAN_PERIOD
    };

    constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar, private http: HttpClient, private zkLoanService: ZkLoanService) {
        console.log('Constructor: ' + web3Service);
    }

    ngOnInit(): void {
        console.log('OnInit: ' + this.web3Service);
        console.log(this);
        this.watchAccount();

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

        // get the accounts available using the provided web3
        (async () => {
            console.log("this inside function");
            // Get all of the accounts through the Web3Wrapper
            const web3Wrapper = new Web3Wrapper(providerEngine);
            console.log(this.web3Service.getProvider());
            [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
            taker = maker;
            console.log("accounts using web3 provider engine");
            console.log(maker + " : " + taker);
        })();


        web3Wrapper = new Web3Wrapper(providerEngine);
        contractWrappers = new ContractWrappers(providerEngine, { networkId: network_config.NETWORK_ID });

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


    async placeOrder() {

        var order = {
            loan_amount:this.model.loan_amount,
            lending_token:this.model.lending_token,
            collateral_token:this.model.collateral_token,
            order_expiry:this.model.order_expiry,
            daily_interest_rate:this.model.daily_interest_rate,
            monitoring_fee:this.model.monitoring_fee,
            loan_period:this.model.loan_period            
        }
        console.log("placing order : ", order);
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
