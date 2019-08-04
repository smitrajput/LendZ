import { Injectable } from '@angular/core';
import { Web3Service } from './util/web3.service';
import kernel from "../artifacts/Kernel.json";
import zkLoan from "../artifacts/ZkLoan.json";
import { HttpClient } from '@angular/common/http';
// import {EthCrypto} from 'eth-crypto';

@Injectable({
  providedIn: 'root'
})
export class ZkLoanService {

  private kernelContract: any;
  private deployedKernelContract: any;


  constructor(private web3Service: Web3Service, private http: HttpClient) {
    this.getKernelContract();
  }

  private async getKernelContract() {
    this.kernelContract = await this.web3Service.artifactsToContract(kernel);
    this.deployedKernelContract = await this.kernelContract.deployed();
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
          let viewKey = res["view_key"];
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

  private encrypt(viewKey: string, pubKey: string) {
    return viewKey;
  }
}
