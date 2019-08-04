import { Injectable } from '@angular/core';
import { Web3Service } from './util/web3.service';
import kernel from "../artifacts/Kernel.json";
import zkLoan from "../artifacts/ZkLoan.json";
import dai from  "../artifacts/DAI.json";
import weth from "../artifacts/WETH.json";
import joinsplit from "../artifacts/JoinSplit.json"
import ace from "../artifacts/ACE.json"

import { HttpClient } from '@angular/common/http';
import { note, JoinSplitProof } from "aztec.js";
// import {EthCrypto} from 'eth-crypto';

@Injectable({
  providedIn: 'root'
})
export class ZkLoanService {

  private kernelContract: any;
  private deployedKernelContract: any;
  private deployedDAIContract: any;
  private deployedWETHContract: any;
  private deployedJoinSplitContract: any;
  private deployedACEContract: any;


  constructor(private web3Service: Web3Service, private http: HttpClient) { 
    this.getContracts();
  }

  private async getContracts(){
    this.kernelContract = await this.web3Service.artifactsToContract(kernel);
    this.deployedKernelContract = await this.kernelContract.deployed();

    let DAIContract = await this.web3Service.artifactsToContract(dai);
    this.deployedDAIContract = await dai.deployed();

    let WETHContract = await this.web3Service.artifactsToContract(weth);
    this.deployedWETHContract = await weth.deployed();

    let joinsplitContract = await this.web3Service.artifactsToContract(joinsplit);
    this.deployedJoinSplitContract = await joinsplitContract.deployed();

    let aceContract = await this.web3Service.artifactsToContract(ace);
    this.deployedACEContract = await aceContract.deployed();

  }

  public async requestViewAccess(loanHash: string, address: string) {
    return new Promise(async resolve => {
      try {
        let pubKey = this.addressToPubKey(address);
        await this.deployedKernelContract.requestAccess(loanHash, pubKey);
        resolve(true);
      }
      catch (err) {
        console.error(err);
        resolve(false);
        return;
      }
    })
  }

  private addressToPubKey(address: string) {
    if (address === "0x7924259759c86CAf163128AfD3570Db18925425f") {
      return "0x04242a636931f1fcba041c3fd228714675684b984be660378816ec29ba86be89be57960c678806b7b637813bf73e19d2f61601ec74b97d8af7bc48180899e9d9ab";
    }
    if (address === "0xCba39f71715820a3b352fE9A50d541168a1B1134") {
      return "0x04e34eab0be228dc4cbb314c6220f0f77442e716893376a936f7db5e51cb7809dfc100b08c308db489e54b9fdb9b069bb77b1b2513ec6dabdeb78c423235c1b572";
    }
    if (address === "0x6753F20c2E4811CCb763b5F13A94d13421725Ad3") {
      return "0x04242a636931f1fcba041c3fd228714675684b984be660378816ec29ba86be89be57960c678806b7b637813bf73e19d2f61601ec74b97d8af7bc48180899e9d9ab";
    }
    if (address === "0xcc6c627c8361530e733d3c007817d6aab7ce478f") {
      return "0x0494faff9c0ee9f928cd54c1413f665272e2810cc7130f871b4eb510dc5d6661d3796af3042b8df828fc105b928a79a76e7c7f34c88005271d2299de3169b0ecda";
    }
    else {
      return '0x0';
    }
  }

  public async grantViewAccess(loanHash: string, address: string) {
    return new Promise(async resolve => {
      try {
        let url = "http://localhost:8000/kernel/viewKey/" + loanHash;
          this.http.get(url).subscribe(async (res) => {
          let viewKey = res["result"]["view_key"];
          let pubKey = this.addressToPubKey(address);

          let sharedSecret = this.encrypt(viewKey, pubKey);
          await this.deployedKernelContract.grantAccess(loanHash, sharedSecret);
          resolve(true);
        });
      }
      catch (err) {
        console.log(err);
        resolve(false);
      }
    })
  }

  public async createKernel(json_body){
    return new Promise(async resolve => {
      // await protocolTokenInstance.approve(ZkLoanInstance.address, 1, {from: json_body["lender"]})

      // let depositInputNotes1 = [];
      // let depositOutputNotes1 = [await note.create(this.addressToPubKey(json_body["lender"]), json_body["loan_amount"])]
      // let depositPublicValue1 = json_body["loan_amount"] * -1;
      // let depositInputOwnerAccounts1 = [];

      // const depositProof1 = new JoinSplitProof(depositInputNotes1, depositOutputNotes1, json_body["lender"], depositPublicValue1, json_body["lender"]);
      // const depositData1 = depositProof1.encodeABI(json_body["lend_currency_address"]);
      // const depositSignatures1 = depositProof1.constructSignatures(json_body["lend_currency_address"], depositInputOwnerAccounts1);

      // await ERC20_AInstance.approve(ACEInstance.address, -depositPublicValue1, {from: json_body["lender"]});
      let dummyPublicKey = "0x047c7b4dfedccb80aa11132e4b5411e96d9fc4057e1cb74a8058ca003fc707473f34d40713927ebdd721bd4ac4f7bef50456a5eff02bc888127c40e2c67eeda823";
      let salt = "0x7bf20bc9c53493cfd19f9378b1bb9f36ceeee7e76b724efeca38f7d1c96f8a04";

      let lendCurrencyNote = note.create(this.addressToPubKey(json_body["lender"]), json_body["loan_amount"]);
      let borrowCurrencyNote = note.create(dummyPublicKey, json_body["collateral_amount"]);


      let kernelHash = await this.deployedKernelContract.kernel_hash(
          [json_body["lender"], json_body["borrower"], json_body["relayer"], json_body["wrangler"], json_body["borrow_currency_address"], json_body["lend_currency_address"]],
          [json_body["monitoring_fee"], json_body["expires_at"], json_body["daily_interest_rate"], json_body["position_duration"]],
          [lendCurrencyNote.noteHash, borrowCurrencyNote.noteHash, salt]
      )

      json_body["kernel_hash"] = kernelHash;
      json_body["lend_currency_noteHash"] = lendCurrencyNote.noteHash;
      json_body["borrow_currency_noteHahs"] = borrowCurrencyNote.noteHash;

      const url = "http://localhost:8000/kernel";
      this.http.post(url, json_body).subscribe(async(res) => {
        console.log(res);
      })

      resolve(true);


    });
  }

  private encrypt(viewKey: string, pubKey: string) {
    return viewKey;
  }
}
