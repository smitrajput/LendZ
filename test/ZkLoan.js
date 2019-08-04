// const Web3 = require("web3")
// const url = `http://127.0.0.1:8545`;
// const web3 = new Web3(new Web3.providers.HttpProvider(url));

const utils = require('@aztec/dev-utils');

const JoinSplitFluid = artifacts.require('../contracts/AZTEC/ACE/validators/joinSplitFluid/JoinSplitFluid.sol');
const Swap = artifacts.require('../contracts/AZTEC/ACE/validators/swap/Swap.sol');
// const Dividend = artifacts.require('./Dividend.sol');
// const PrivateRange = artifacts.require('./PrivateRange.sol');
const JoinSplit = artifacts.require('../contracts/AZTEC/ACE/validators/joinSplit/JoinSplit.sol');
const ACE = artifacts.require("../contracts/AZTEC/ACE/ACE.sol")

const ERC20_A = artifacts.require('../contracts/ERC20_A.sol')
const ERC20_B = artifacts.require('../contracts/ERC20_B.sol')
const LSTProtocolToken = artifacts.require('../contracts/LSTProtocolToken.sol')


const ZkERC20 = artifacts.require('../contracts/ZkERC20.sol')

const ZkLoan = artifacts.require('../contracts/ZkLoan.sol')
const Kernel = artifacts.require('../contracts/Kernel.sol')
const aztec = require('aztec.js');
const dotenv = require('dotenv');
dotenv.config();


const {
        constants,
        proofs: {
            JOIN_SPLIT_PROOF,
            MINT_PROOF,
            SWAP_PROOF,
        },
    } = utils;

let aztecAccounts = require("./accounts.json");

function signNote(validatorAddress, noteHash, spender, privateKey) {
    let signature = aztec.signer.signNote(validatorAddress, noteHash, spender, privateKey);
    return signature;
}

contract('ZkLoan', (accounts) => {
    let ACEInstance;
    let ZkLoanInstance;
    let KernelInstance;
    let ERC20_AInstance;
    let ERC20_BInstance;
    let zkERC20_AInstance;
    let zkERC20_BInstance;
    let protocolTokenInstance;
    const sender = accounts[0];
    // const protocolTokenAddress = web3.utils.toChecksumAddress("0xf1d712736ff2b06dda9ba03d959aa70a297ad99b");

    let lender = aztecAccounts[0];
    let borrower = aztecAccounts[1];
    let relayer = aztecAccounts[2];
    let wrangler = aztecAccounts[3];

    let dummyPublicKey = "0x047c7b4dfedccb80aa11132e4b5411e96d9fc4057e1cb74a8058ca003fc707473f34d40713927ebdd721bd4ac4f7bef50456a5eff02bc888127c40e2c67eeda823"
    let salt = "0x7bf20bc9c53493cfd19f9378b1bb9f36ceeee7e76b724efeca38f7d1c96f8a04";

    beforeEach(async () => {
        AdjustSupplyInstance = await JoinSplitFluid.new();
        BilateralSwapInstance = await Swap.new();
        JoinSplitInstance = await JoinSplit.new();
        ACEInstance = await ACE.new();
        await ACEInstance.setCommonReferenceString(constants.CRS);
        await ACEInstance.setProof(MINT_PROOF, AdjustSupplyInstance.address);
        await ACEInstance.setProof(SWAP_PROOF, BilateralSwapInstance.address);
        // await ACEContract.setProof(DIVIDEND_PROOF, Dividend.address);
        await ACEInstance.setProof(JOIN_SPLIT_PROOF, JoinSplitInstance.address);
        // await ACEContract.setProof(PRIVATE_RANGE_PROOF, PrivateRange.address);

        ERC20_AInstance = await ERC20_A.new({from: lender.address});
        ERC20_BInstance = await ERC20_B.new({from: borrower.address});

        protocolTokenInstance = await LSTProtocolToken.new({from: lender.address});

        zkERC20_AInstance = await ZkERC20.new(ACEInstance.address, ERC20_AInstance.address, {from: accounts[1]});
        zkERC20_BInstance = await ZkERC20.new(ACEInstance.address, ERC20_BInstance.address, {from: accounts[2]});

        KernelInstance = await Kernel.new();
        ZkLoanInstance = await ZkLoan.new(protocolTokenInstance.address, KernelInstance.address, {from: sender});
    })

    it('should be able to deploy', () => {
        assert.notEqual(ZkLoanInstance.address, "0x0000000000000000000000000000000000000000");
    });

    it('should deploy with correct arguments', async () => {
        assert.equal(await ZkLoanInstance.owner.call(), sender)
        assert.equal(await ZkLoanInstance.protocol_token_address.call(), protocolTokenInstance.address);
        assert.equal(await ZkLoanInstance.kernel_address.call(), KernelInstance.address);
    });

    it('should create a kernel', async () => {
        await ZkLoanInstance.set_token_support(zkERC20_AInstance.address, true);
        await ZkLoanInstance.set_token_support(zkERC20_BInstance.address, true);
        await ZkLoanInstance.set_wrangler_status(wrangler.address, true);


        let lendCurrencyNote = await aztec.note.create(lender.publicKey, 100);
        let borrowCurrencyNote = await aztec.note.create(dummyPublicKey, 50);

        let monitoringFee = 1;
        let expires_at = parseInt(Date.now()/1000) + 1000000;
        let daily_interest_rate = 5;
        let position_duration_in_seconds = 2592000;

        let kernelHash = await KernelInstance.kernel_hash(
            [lender.address, borrower.address, relayer.address, wrangler.address, zkERC20_BInstance.address, zkERC20_AInstance.address],
            [monitoringFee, expires_at, daily_interest_rate, position_duration_in_seconds],
            [lendCurrencyNote.noteHash, borrowCurrencyNote.noteHash, salt]
        )
    })

    it("should convert ERC20 tokens to Notes", async () => {
        await ZkLoanInstance.set_token_support(zkERC20_AInstance.address, true);
        await ZkLoanInstance.set_token_support(zkERC20_BInstance.address, true);
        await ZkLoanInstance.set_wrangler_status(wrangler.address, true);

        // Proofs for converting ERC20 tokens to AZTEC notes
        let depositInputNotes = [];
        let depositOutputNotes = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue = -100;
        let depositInputOwnerAccounts = [];

        const depositProof = new aztec.JoinSplitProof(depositInputNotes, depositOutputNotes, lender.address, depositPublicValue, lender.address);
        const depositData = depositProof.encodeABI(zkERC20_AInstance.address);
        const depositSignatures = depositProof.constructSignatures(zkERC20_AInstance.address, depositInputOwnerAccounts);

        await ERC20_AInstance.approve(ACEInstance.address, -depositPublicValue, {from: lender.address})

        await ACEInstance.publicApprove(zkERC20_AInstance.address, depositProof.hash, -depositPublicValue, { from: lender.address });
        const { receipt } = await zkERC20_AInstance.confidentialTransfer(depositData, depositSignatures, { from: lender.address });
        assert.equal(receipt.status, true);

    });

    it("should fill a kernel", async() => {

        await ZkLoanInstance.set_token_support(zkERC20_AInstance.address, true);
        await ZkLoanInstance.set_token_support(zkERC20_BInstance.address, true);
        await ZkLoanInstance.set_wrangler_status(wrangler.address, true);

        // Approve ZkLoan contrcat to spend the protocol token (ie, LST)
        await protocolTokenInstance.approve(ZkLoanInstance.address, 1, {from: lender.address})

        // Proofs for converting ERC20 tokens to AZTEC notes

        // For lending token
        let depositInputNotes1 = [];
        let depositOutputNotes1 = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue1 = -100;
        let depositInputOwnerAccounts1 = [];

        const depositProof1 = new aztec.JoinSplitProof(depositInputNotes1, depositOutputNotes1, lender.address, depositPublicValue1, lender.address);
        const depositData1 = depositProof1.encodeABI(zkERC20_AInstance.address);
        const depositSignatures1 = depositProof1.constructSignatures(zkERC20_AInstance.address, depositInputOwnerAccounts1);

        await ERC20_AInstance.approve(ACEInstance.address, -depositPublicValue1, {from: lender.address})

        await ACEInstance.publicApprove(zkERC20_AInstance.address, depositProof1.hash, -depositPublicValue1, { from: lender.address });
        const { receipt } = await zkERC20_AInstance.confidentialTransfer(depositData1, depositSignatures1, { from: lender.address });
        assert.equal(receipt.status, true);

        // For collateral token
        let depositInputNotes2 = [];
        let depositOutputNotes2 = [await aztec.note.create(borrower.publicKey, 50)];
        let depositPublicValue2 = -50;
        let depositInputOwnerAccounts2 = []

        const depositProof2 = new aztec.JoinSplitProof(depositInputNotes2, depositOutputNotes2, borrower.address, depositPublicValue2, borrower.address);
        const depositData2 = depositProof2.encodeABI(zkERC20_BInstance.address);
        const depositSignatures2 = depositProof2.constructSignatures(zkERC20_BInstance.address, depositInputOwnerAccounts2);

        await ERC20_BInstance.approve(ACEInstance.address, -depositPublicValue2, {from: borrower.address})

        await ACEInstance.publicApprove(zkERC20_BInstance.address, depositProof2.hash, -depositPublicValue2, { from: borrower.address });
        let tx = await zkERC20_BInstance.confidentialTransfer(depositData2, depositSignatures2, { from: borrower.address });
        assert.equal(tx.receipt.status, true);

        // Details to create the kernel & position
        let lendCurrencyNote = depositOutputNotes1[0];
        let borrowCurrencyNote = depositOutputNotes2[0];
        let lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        let borrowCurrencyNoteTransferred = await aztec.note.create(dummyPublicKey, 50, ZkLoanInstance.address);

        let monitoringFee = 1;
        let nonce = 1;
        let expires_at = parseInt(Date.now()/1000) + 1000000;
        let wrangler_expires_at = parseInt(Date.now()/1000) + 1000000;
        let daily_interest_rate = 5;
        let position_duration_in_seconds = 86400;

        //create proofs for lend & collateral
        const lendProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], ZkLoanInstance.address, 0, lender.address);
        const lendData = lendProof.encodeABI(zkERC20_AInstance.address);
        const lendSignature = signNote(zkERC20_AInstance.address, lendCurrencyNote.noteHash, ZkLoanInstance.address, lender.privateKey);
        const lendProofOutputs = lendProof.eth.output;

        const collateralProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], ZkLoanInstance.address, 0, borrower.address);
        const collateralData = collateralProof.encodeABI(zkERC20_BInstance.address);
        const collateralSignature = signNote(zkERC20_BInstance.address, borrowCurrencyNote.noteHash, ZkLoanInstance.address, borrower.privateKey);
        const collateralProofOutputs = collateralProof.eth.output;

        await ZkLoanInstance.fill_kernel(
            [lender.address, borrower.address, relayer.address, wrangler.address, zkERC20_BInstance.address, zkERC20_AInstance.address],
            [monitoringFee, nonce, daily_interest_rate, expires_at, wrangler_expires_at, position_duration_in_seconds],
            [borrowCurrencyNoteTransferred.noteHash, lendCurrencyNote.noteHash, lendCurrencyOwedNote.noteHash],
            true,
            salt,
            lendData, lendSignature, lendProofOutputs,
            collateralData, collateralSignature, collateralProofOutputs,
            {from: accounts[2]}
        );
    })

    it("should repay a loan successfully", async() => {

        await ZkLoanInstance.set_token_support(zkERC20_AInstance.address, true);
        await ZkLoanInstance.set_token_support(zkERC20_BInstance.address, true);
        await ZkLoanInstance.set_wrangler_status(wrangler.address, true);

        // Approve ZkLoan contrcat to spend the protocol token (ie, LST)
        await protocolTokenInstance.approve(ZkLoanInstance.address, 1, {from: lender.address})

        // Proofs for converting ERC20 tokens to AZTEC notes

        // For lending token
        let depositInputNotes1 = [];
        let depositOutputNotes1 = [await aztec.note.create(lender.publicKey, 100)]
        let depositPublicValue1 = -100;
        let depositInputOwnerAccounts1 = [];

        const depositProof1 = new aztec.JoinSplitProof(depositInputNotes1, depositOutputNotes1, lender.address, depositPublicValue1, lender.address);
        const depositData1 = depositProof1.encodeABI(zkERC20_AInstance.address);
        const depositSignatures1 = depositProof1.constructSignatures(zkERC20_AInstance.address, depositInputOwnerAccounts1);

        await ERC20_AInstance.approve(ACEInstance.address, -depositPublicValue1, {from: lender.address})

        await ACEInstance.publicApprove(zkERC20_AInstance.address, depositProof1.hash, -depositPublicValue1, { from: lender.address });
        const { receipt } = await zkERC20_AInstance.confidentialTransfer(depositData1, depositSignatures1, { from: lender.address });
        assert.equal(receipt.status, true);

        // For collateral token
        let depositInputNotes2 = [];
        let depositOutputNotes2 = [await aztec.note.create(borrower.publicKey, 50)];
        let depositPublicValue2 = -50;
        let depositInputOwnerAccounts2 = []

        const depositProof2 = new aztec.JoinSplitProof(depositInputNotes2, depositOutputNotes2, borrower.address, depositPublicValue2, borrower.address);
        const depositData2 = depositProof2.encodeABI(zkERC20_BInstance.address);
        const depositSignatures2 = depositProof2.constructSignatures(zkERC20_BInstance.address, depositInputOwnerAccounts2);

        await ERC20_BInstance.approve(ACEInstance.address, -depositPublicValue2, {from: borrower.address})

        await ACEInstance.publicApprove(zkERC20_BInstance.address, depositProof2.hash, -depositPublicValue2, { from: borrower.address });
        let tx = await zkERC20_BInstance.confidentialTransfer(depositData2, depositSignatures2, { from: borrower.address });
        assert.equal(tx.receipt.status, true);

        // Details to create the kernel & position
        let lendCurrencyNote = depositOutputNotes1[0];
        let borrowCurrencyNote = depositOutputNotes2[0];
        let lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        let borrowCurrencyNoteTransferred = await aztec.note.create(dummyPublicKey, 50, ZkLoanInstance.address);

        let monitoringFee = 1;
        let nonce = 1;
        let expires_at = parseInt(Date.now()/1000) + 1000000;
        let wrangler_expires_at = parseInt(Date.now()/1000) + 1000000;
        let daily_interest_rate = 5;
        let position_duration_in_seconds = 86400;

        //create proofs for lend & collateral
        const lendProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], ZkLoanInstance.address, 0, lender.address);
        const lendData = lendProof.encodeABI(zkERC20_AInstance.address);
        const lendSignature = signNote(zkERC20_AInstance.address, lendCurrencyNote.noteHash, ZkLoanInstance.address, lender.privateKey);
        const lendProofOutputs = lendProof.eth.output;

        const collateralProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], ZkLoanInstance.address, 0, borrower.address);
        const collateralData = collateralProof.encodeABI(zkERC20_BInstance.address);
        const collateralSignature = signNote(zkERC20_BInstance.address, borrowCurrencyNote.noteHash, ZkLoanInstance.address, borrower.privateKey);
        const collateralProofOutputs = collateralProof.eth.output;

        tx = await ZkLoanInstance.fill_kernel(
            [lender.address, borrower.address, relayer.address, wrangler.address, zkERC20_BInstance.address, zkERC20_AInstance.address],
            [monitoringFee, nonce, daily_interest_rate, expires_at, wrangler_expires_at, position_duration_in_seconds],
            [borrowCurrencyNoteTransferred.noteHash, lendCurrencyNote.noteHash, lendCurrencyOwedNote.noteHash],
            true,
            salt,
            lendData, lendSignature, lendProofOutputs,
            collateralData, collateralSignature, collateralProofOutputs,
            {from: accounts[2]}
        );
        // print(tx);
        assert.equal(tx.receipt.status, true);

        // After some time, repay the loan
        await ERC20_AInstance.transfer(borrower.address, 105); // Assue somehow that borrower gets the money to repay the loan

        let depositInputNotes3 = [];
        let depositOutputNotes3 = [await aztec.note.create(borrower.publicKey, 105)];
        let depositPublicValue3 = -105;
        let depositInputOwnerAccounts3 = []

        const depositProof3 = new aztec.JoinSplitProof(depositInputNotes3, depositOutputNotes3, borrower.address, depositPublicValue3, borrower.address);
        const depositData3 = depositProof2.encodeABI(zkERC20_AInstance.address);
        const depositSignatures3 = depositProof2.constructSignatures(zkERC20_AInstance.address, depositInputOwnerAccounts3);

        await ERC20_AInstance.approve(ACEInstance.address, -depositPublicValue3, {from: borrower.address})

        await ACEInstance.publicApprove(zkERC20_AInstance.address, depositProof3.hash, -depositPublicValue3, { from: borrower.address });
        tx = await zkERC20_AInstance.confidentialTransfer(depositData3, depositSignatures3, { from: borrower.address });
        assert.equal(tx.receipt.status, true);
        let positionAddress = tx.receipt.logs[0].args["_position"];
        
        // Notes for repayment & collateral return
        lendCurrencyNote = depositOutputNotes3[0];
        borrowCurrencyNote = borrowCurrencyNoteTransferred;
        lendCurrencyOwedNote = await aztec.note.create(lender.publicKey, 105);

        // let lendCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 100);
        borrowCurrencyNoteTransferred = await aztec.note.create(borrower.publicKey, 50);

        //create proofs for repayment & collateral return
        const repayProof = new aztec.JoinSplitProof([lendCurrencyNote], [lendCurrencyNoteTransferred], ZkLoanInstance.address, 0, borrower.address);
        const repayData = repayProof.encodeABI(zkERC20_AInstance.address);
        const repaySignature = signNote(zkERC20_AInstance.address, lendCurrencyNote.noteHash, ZkLoanInstance.address, borrower.privateKey);
        const repayProofOutputs = repayProof.eth.output;

        const collateralReturnProof = new aztec.JoinSplitProof([borrowCurrencyNote], [borrowCurrencyNoteTransferred], ZkLoanInstance.address, 0, ZkLoanInstance.address);
        const collateralReturnData = collateralReturnProof.encodeABI(zkERC20_BInstance.address);
        // const collateralReturnSignature = signNote(zkERC20_BInstance.address, borrowCurrencyNote.noteHash, ZkLoanInstance.address, borrower.privateKey);
        const collateralReturnProofOutputs = collateralReturnProof.eth.output;

        tx = await ZkLoanInstance.close_position(positionAddress, repayData, repaySignature, repayProofOutputs, collateralReturnData, collateralReturnProofOutputs);
        assert.equal(tx.receipt.status, true);
    })
})