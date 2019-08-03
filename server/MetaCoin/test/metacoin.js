const MetaCoin = artifacts.require("MetaCoin");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract('MetaCoin', (accounts) => {

    var accountOne, accountTwo;
    var metaCoinInstance;

    // // build up and tear down a new Casino contract before each test

    // beforeEach(async () => {
    //     meta = await MetaCoin.new({ from: fundingAccount });
    //     await meta.fund({ from: fundingAccount, value: fundingSize });
    //     assert.equal(web3.eth.getBalance(meta.address).toNumber(), fundingSize);
    // });

    // afterEach(async () => {
    //     await meta.kill({ from: fundingAccount });
    // });

    before(async () => {
        metaCoinInstance = await MetaCoin.deployed();
        // Setup 2 accounts.
        accountOne = accounts[0];
        accountTwo = accounts[1];
    })

    describe("success states", async () => {

        it('should put 10000 MetaCoin in the first account', async () => {
            // const metaCoinInstance = await MetaCoin.deployed();
            const balance = await metaCoinInstance.getBalance.call(accounts[0]);
            console.log("test 1 ");
            assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
        });
        it('should call a function that depends on a linked library', async () => {
            // const metaCoinInstance = await MetaCoin.deployed();
            const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();
            const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

            assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
        });

        it('should update version correctly', async () => {
            // const metaCoinInstance = await MetaCoin.deployed();
            const newVersion = 6;

            // when you call a set function with the call() method, it doesnt change the state of the
            //  blockchain it just executes and gives you the output in the return statement of the function. 
            // to actually make the change , dont use the call() method, provide from to, and it will return
            // the transaction Data 

            // this returns the output of the function. dont execute it on blockchain yet
            const VersionOutput = await metaCoinInstance.setVersion.call(newVersion);
            // this makes a transaction on the blockchain and changes the version. 
            const tx = await metaCoinInstance.setVersion(newVersion);
            // simple querying of the blockchain
            const VersionAfterSend = await metaCoinInstance.version.call();
            // console.log(VersionOld + " : " + VersionBeforeCall + " : " + VersionAfterCall + " : " + VersionAfterSend);
            assert.equal(VersionOutput, newVersion + 1, 'version dont match');
            assert.equal(VersionAfterSend, newVersion, 'version dont match');
        });

        it('should send coin correctly', async () => {

            // Get initial balances of first and second account.
            const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
            const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

            // Make transaction from first account to second.
            const amount = 10;
            // the transaction data 
            let tx = await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });
            // getting the events transmitted during the transaction
            var event = tx.receipt.logs[0].args;
            // console.log(event);
            console.log(event._value);

            // for (var value in event) {
            //      console.log(key);
            // }

            // can use this to traverse through all the parameters of an event
            for (const [key, value] of Object.entries(event)) {
                console.log(key, value);
            }
            assert.equal(event._from, accountOne, "the sending address is not correct");
            assert.equal(event._value, amount, "the sending amount is not correct");
            // truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
            //     console.log(ev._from + " : " + ev._value + " : " + ev._to);
            //     return ev._from === accountOne && ev._value.eq(amount);
            // });
            // Get balances of first and second account after the transactions.
            const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
            const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();


            assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
        });
    })
    describe("failure states", async () => {
        it("should not send or execute the function if not enough funds", async () => {

            var amount = 10;
            await truffleAssert.reverts(metaCoinInstance.sendCoin(accountOne, amount, { from: accountTwo }), "insufficient funds");
        });
    })

});
