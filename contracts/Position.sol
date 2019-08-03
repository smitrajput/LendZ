pragma solidity ^0.5.7;

contract Position{

    // // struct representing a position
    // struct position{
    uint256 index;
    address kernel_creator;
    address lender;
    address borrower;
    address relayer;
    address wrangler;
    uint256 created_at;
    // uint256 updated_at;
    uint256 expires_at;
    address borrow_currency_address;
    address lend_currency_address;
    bytes32 borrow_currency_noteHash;
    // uint256 borrow_currency_current_value;
    bytes32 lend_currency_filled_noteHash; // Note to be transferred from lender to borrower
    bytes32 lend_currency_owed_noteHash; // Dummy Note to be repayed by borrower to lender
    uint256 status;
    uint256 nonce;
    // uint256 relayer_fee;
    uint256 monitoring_fee;
    // uint256 rollover_fee;
    // uint256 closure_fee;
    bytes32 hash;
    // }

    constructor(
        address[7] memory _addresses, bytes32[3] memory _bytesData, uint256[4] memory _values
    ) public {
        index = _values[0];
        kernel_creator = _addresses[0];
        lender = _addresses[1];
        borrower = _addresses[2];
        relayer = _addresses[3];
        wrangler = _addresses[4];
        created_at = block.timestamp;
        expires_at = block.timestamp + _values[3];
        borrow_currency_address = _addresses[5];
        lend_currency_address = _addresses[6];
        borrow_currency_noteHash = _bytesData[0];
        lend_currency_filled_noteHash = _bytesData[1];
        lend_currency_owed_noteHash = _bytesData[2];
        nonce = _values[1];
        monitoring_fee = _values[2];
        hash = position_hash(_addresses, _bytesData, [_values[1], _values[2]]);
    }

    function getHash() external view returns (bytes32){
        return hash;
    }

    function getBorrower() external view returns (address){
        return borrower;
    }

    function getLender() external view returns (address){
        return lender;
    }

    function expiresAt() external view returns (uint256){
        return expires_at;
    }

    function getStatus() external view returns (uint256){
        return status;
    }

    function setStatus(uint256 _status) external {
        status = _status;
    }

    function getLendCurrencyAddress() external view returns (address){
        return lend_currency_address;
    }

    function getBorrowCurrencyAddress() external view returns (address){
        return borrow_currency_address;
    }

    function getLendCurrencyOwedNotehash() external view returns(bytes32){
        return lend_currency_owed_noteHash;
    }

    function getBorrowCurrencyNotehash() external view returns(bytes32){
        return borrow_currency_noteHash;
    }

    function getWrangler() external view returns(address){
        return wrangler;
    }

    function position_hash(
                address[7] memory _addresses,
                bytes32[3] memory _bytesData,
                uint256[2] memory _values
            ) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                _addresses[0],  // kernel creator
                _addresses[1],  // lender
                _addresses[2],  // borrower
                _addresses[3],  // relayer
                _addresses[4],  // wrangler
                _addresses[5],  // borrow currency (collateral) address
                _addresses[6],  // lend currency address
                _bytesData[0],  // borrow currency noteHash
                _bytesData[1],  // lend currency filled noteHash
                _bytesData[2],  // lend currency owed noteHash
                _values[0],     // nonce
                _values[1]      // monitoring fee
            )
        );
    }

    // function position() public view returns (uint256, address, address, address, address, address, uint256, uint256, address, address, bytes32,
    //     bytes32, bytes32, uint256, uint256, uint256, bytes32) {
    //     return (index, kernel_creator, lender, borrower,  relayer,  wrangler,  created_at,  expires_at,  borrow_currency_address,  lend_currency_address,  borrow_currency_noteHash, lend_currency_filled_noteHash, lend_currency_owed_noteHash, status, nonce, monitoring_fee, hash);
    // }
}