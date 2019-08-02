pragma solidity ^0.5.7;

import "./ZkERC20.sol";
import "./IERC20.sol";

contract ZkLoan {

    // struct representing a kernel
    struct Kernel{
        address lender;
        address borrower;
        address relayer;
        address wrangler;
        address borrow_currency_address;
        address lend_currency_address;
        // uint256 lend_currency_offered_value;

        // One of the notes below will actually be a dummy note, to be used just for comparison later
        bytes32 lend_currency_noteHash;
        bytes32 borrow_currency_noteHash;
        // uint256 relayer_fee;
        uint256 monitoring_fee;
        // uint256 rollover_fee;
        // uint256 closure_fee;
        bytes32 salt;
        uint256 expires_at;
        uint256 daily_interest_rate;
        uint256 position_duration_in_seconds;
    }
    // struct representing a position
    struct Position{
        uint256 index;
        address kernel_creator;
        address lender;
        address borrower;
        address relayer;
        address wrangler;
        uint256 created_at;
        uint256 updated_at;
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
    }

    event BorrowerAccessRequested(bytes32 kernelHash, address borrower);
    event BorrowerAccessGranted(bytes32 kernelHash, address borrower);
    // Events of the protocol.
    event ProtocolParameterUpdateNotification(string[64] _notification_key, address indexed _address, uint256 _notification_value);
    event PositionUpdateNotification(address indexed _wrangler,bytes32 indexed _position_hash, string[64] _notification_key, uint256 _notification_value);

    // Variables of the protocol.
    address public protocol_token_address;
    address public owner;
    // kernel
    mapping(bytes32 => uint256) public kernels_filled;
    mapping(bytes32 => uint256)  public kernels_cancelled;
    // all positions
    mapping(bytes32 => Position) public positions;
    uint256 public last_position_index;
    mapping(uint256 => bytes32) public position_index;
    uint256 public position_threshold;
    mapping(address => mapping(uint256 => bytes32)) public borrow_positions;
    mapping(address => mapping(uint256 => bytes32)) public lend_positions;
    mapping(address => mapping(bytes32 => uint256)) borrow_position_index;
    mapping(address => mapping(bytes32 => uint256)) lend_position_index;
    mapping(address => uint256) public borrow_positions_count;
    mapping(address => uint256) public lend_positions_count;

    // wrangler
    mapping(address => bool) public wranglers;
    mapping(address => mapping(address => uint256)) public wrangler_nonces;

    // tokens
    mapping(address => bool) public supported_tokens;

    // nonreentrant locks for positions, inspired from https//github.com/ethereum/vyper/issues/1204
    mapping(bytes32 => bool) nonreentrant_locks;

    // Mapping to store approvals of borrowers for loan notional view requests
    mapping(bytes32 => mapping(address => bytes)) borrowerApprovals;

    // constants
    uint256 public SECONDS_PER_DAY;
    uint256 public POSITION_STATUS_OPEN;
    uint256 public POSITION_STATUS_CLOSED;
    uint256 public POSITION_STATUS_LIQUIDATED;
    uint256 public POSITION_TOPPED_UP;
    address public ZERO_ADDRESS = address(0);



    constructor(address _protocol_token_address) public {
        owner = msg.sender;
        protocol_token_address = _protocol_token_address;
        position_threshold = 10;
        SECONDS_PER_DAY = 86400;
        POSITION_STATUS_OPEN = 1;
        POSITION_STATUS_CLOSED = 2;
        POSITION_STATUS_LIQUIDATED = 3;
        POSITION_TOPPED_UP = 1;
    }


    function requestAccess(bytes32 _kernelHash) public {
        borrowerApprovals[_kernelHash][msg.sender] = '0x';
        emit BorrowerAccessRequested(_kernelHash, msg.sender);
    }

    function approveAccess(bytes32 _kernelHash, address _borrower, bytes memory _sharedSecret) public {
        borrowerApprovals[_kernelHash][_borrower] = _sharedSecret;
        emit BorrowerAccessGranted(_kernelHash, _borrower);
    }

    function can_borrow(address _address) public pure returns (bool) {
        return  borrow_positions_count[_address] < position_threshold;
    }

    function can_lend(address _address) public pure returns (bool) {
        return  lend_positions_count[_address] < position_threshold;
    }

    function filled_or_cancelled_loan_amount(bytes32 _kernel_hash) public pure returns (uint256) {
        return kernels_filled[_kernel_hash] + kernels_cancelled[_kernel_hash];
    }

    function position(bytes32 _position_hash) public pure returns (uint256, address, address, address, address, address, uint256, uint256, uint256, address, address, bytes32,
        bytes32, bytes32, uint256, uint256, uint256, bytes32) {
        return (positions[_position_hash].index, positions[_position_hash].kernel_creator, positions[_position_hash].lender,  positions[_position_hash].borrower,  positions[_position_hash].relayer,  positions[_position_hash].wrangler,  positions[_position_hash].created_at,  positions[_position_hash].updated_at,  positions[_position_hash].expires_at,  positions[_position_hash].borrow_currency_address,  positions[_position_hash].lend_currency_address,  positions[_position_hash].borrow_currency_noteHash,  positions[_position_hash].lend_currency_filled_noteHash,  positions[_position_hash].lend_currency_owed_noteHash,  positions[_position_hash].status, positions[_position_hash].nonce, positions[_position_hash].monitoring_fee, positions[_position_hash].hash);
    }

    function position_counts(address _address) public pure returns (uint256, uint256) {
        return ( borrow_positions_count[_address],  lend_positions_count[_address]);
    }

    function kernel_hash(
            address[6] memory _addresses, uint256[4] memory _intValues,
            bytes32[3] memory _bytesData
            ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),  // address of ZkLoans contract
                _addresses[0],  // lender
                _addresses[1],  // borrower
                _addresses[2],  // relayer
                _addresses[3],  // wrangler
                _addresses[4],  // collateral token
                _addresses[5],  // loan token
                _bytesData[0],  // lend currency noteHash
                _bytesData[1],  // borrow currency noteHash (collateral)
                _intValues[0],  // monitoring fee
                _bytesData[2],  // salt
                _intValues[1],  // expires at
                _intValues[2],  // daily interest rate
                _intValues[3]   // position duration in seconds
            )
        );
    }

    function position_hash(
                address[7] memory _addresses,
                bytes32[3] memory _bytesData,
                uint256[6] memory _values
            ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                _addresses[0],  // kernel creator
                _addresses[1],  // lender
                _addresses[2],  // borrower
                _addresses[3],  // relayer
                _addresses[4],  // wrangler
                _values[0],     // created at
                _values[1],     // updated at
                _values[2],     // expires at
                _addresses[5],  // borrow currency (collateral) address
                _addresses[6],  // lend currency address
                _bytesData[0],  // borrow currency noteHash
                _bytesData[1],  // lend currency filled noteHash
                _bytesData[2],  // lend currency owed noteHash
                _values[3],     // status
                _values[4],     // nonce
                _values[5]      // monitoring fee
            )
        );
    }



}