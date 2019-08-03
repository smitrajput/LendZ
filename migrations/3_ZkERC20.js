const ZkERC20 = artifacts.require("./ZkERC20.sol");
const ACE = artifacts.require("./ACE.sol");

module.exports = async (deployer, network) => {
    const _ACE = await ACE.deployed();

    // await deployer.deploy(ECVerifier);
    // await deployer.deploy(OrderVault);
    // await deployer.deploy(TradeFeeCalculator);
    // await deployer.deploy(ZkAssetHandler,_ACE.address);

    // const ECVerifyContract = await ECVerifier.deployed();
    // const OrderVaultContract = await OrderVault.deployed();
    // const TradeFeeCalculatorContract = await TradeFeeCalculator.deployed();
    // const ZkAssetHandlerContract = await ZkAssetHandler.deployed();

    const zkDAI = await deployer.deploy(ZkERC20, _ACE.address, "0x33e57fcc0b2a71c64206777bd4a2f38716558c09"); // random address for now
    const zkWETH = await deployer.deploy(ZkERC20, _ACE.address, "0xb38d970f27d1f609b21d803e47cbc7f5e108fa1a"); // random address for now

    console.log("zkDAI:", zkDAI.address);
    console.log("zkWETH:", zkWETH.address);
}
