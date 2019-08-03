pragma solidity ^0.5.7;

import "./AZTEC/ERC1724/ZkAsset.sol";

contract ZkERC20 is ZkAsset{

    event Log(address owner, uint256 value, bytes32 noteHash);
    // event LogString(string value);

    address public aceAddress;
    address public erc20Address;

    constructor(
        address _aceAddress,
        address _erc20Address
    ) public ZkAsset(_aceAddress, address(_erc20Address), 1) {
        aceAddress = _aceAddress;
        erc20Address = _erc20Address;
    }

    function approveAceToSpendTokens(bytes32 _proofHash, uint256 _value) public {
        ACE aceContract = ACE(aceAddress);
        aceContract.publicApprove(address(this), _proofHash, _value);
        emit Log(aceAddress, _value, _proofHash);
    }

    function getACE() external view returns(address){
        return aceAddress;
    }

}