pragma solidity ^0.5.7;

contract Kernel{
    // struct representing a kernel
    struct kernel{
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

    mapping(bytes32 => bool) public kernels_filled;
    mapping(bytes32 => bool)  public kernels_cancelled;

    function kernel_hash(
            address[6] memory _addresses, uint256[4] memory _intValues,
            bytes32[3] memory _bytesData
            ) public view returns (bytes32) {
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

    function fill(
        address[6] memory _addresses,
        // _addresses lender, borrower, relayer, wrangler, collateralToken, loanToken
        uint256[6] memory _intValues,
        // _intValues monitoringFeeLST, nonce, kernelDailyInterestRate, kernelExpiresAt, WranglerExpiresAt, positionDurationInSeconds
        bytes32[3] memory _noteHashes,
        // _noteHashes lendCurrencyNoteHash, borrowCurrencyNoteHash (expected collateral), lendCurrencyOwedNoteHash
        bool _is_creator_lender,
        bytes32 _kernel_creator_salt
    ) public{
        // validate _lender is not empty
        require(_addresses[0] != address(0));
        // validate _borrower is not empty
        require(_addresses[1] != address(0));
        address _kernel_creator = _addresses[1];
        kernel memory _kernel = kernel({
            lender: address(0),
            borrower: _addresses[1],
            relayer: _addresses[2],
            wrangler: _addresses[3],
            borrow_currency_address: _addresses[4],
            lend_currency_address: _addresses[5],
            lend_currency_noteHash: _noteHashes[0],
            borrow_currency_noteHash: _noteHashes[1],
            // relayer_fee: _values[2],
            monitoring_fee: _intValues[0],
            // rollover_fee: _values[4],
            // closure_fee: _values[5],
            salt: _kernel_creator_salt,
            expires_at: _intValues[3],
            daily_interest_rate: _intValues[2],
            position_duration_in_seconds: _intValues[5]
        });
        if(_is_creator_lender){
            _kernel_creator = _addresses[0];
            _kernel.lender = _addresses[0];
            _kernel.borrower = address(0);
        }
        // It's OK if _relayer is empty
        // validate _wrangler is not empty
        require(_kernel.wrangler != address(0));
        
        // validate loan amounts
        // require(_values[0] > 0);
        // require(_kernel.lend_currency_offered_value > 0);
        // require(_values[6] > 0);
        // validate asked and offered expiry timestamps
        require(_kernel.expires_at > block.timestamp);
        // validate daily interest rate on Kernel is greater than 0
        require(_kernel.daily_interest_rate > 0);
        // compute hash of kernel
        bytes32 _k_hash =  kernel_hash(
            [_kernel.lender, _kernel.borrower, _kernel.relayer, _kernel.wrangler,
            _kernel.borrow_currency_address, _kernel.lend_currency_address],
            [_kernel.monitoring_fee, _kernel.expires_at, _kernel.daily_interest_rate, _kernel.position_duration_in_seconds],
            [_kernel.lend_currency_noteHash, _kernel.borrow_currency_noteHash, _kernel.salt]);

        kernels_filled[_k_hash] = true;
    }

    function cancel(address[6] memory _addresses, bytes32[2] memory _noteHashes, uint256[5] memory _intValues, bytes32 _kernel_creator_salt) public {
        // compute kernel hash from inputs
            kernel memory _kernel = kernel({
                lender: address(0),
                borrower: _addresses[1],
                relayer: _addresses[2],
                wrangler: _addresses[3],
                borrow_currency_address: _addresses[4],
                lend_currency_address: _addresses[5],
                lend_currency_noteHash: _noteHashes[0],
                borrow_currency_noteHash: _noteHashes[1],
                // relayer_fee: _values[2],
                monitoring_fee: _intValues[0],
                // rollover_fee: _values[4],
                // closure_fee: _values[5],
                salt: _kernel_creator_salt,
                expires_at: _intValues[3],
                daily_interest_rate: _intValues[2],
                position_duration_in_seconds: _intValues[4]
            });
            // bytes32 _k_hash = kernel_hash(
            //     [_kernel.lender, _kernel.borrower, _kernel.relayer, _kernel.wrangler,
            //     _kernel.borrow_currency_address, _kernel.lend_currency_address],
            //     [_kernel.lend_currency_offered_value,
            //     _kernel.relayer_fee, _kernel.monitoring_fee, _kernel.rollover_fee, _kernel.closure_fee],
            //     _kernel.expires_at, _kernel.salt, _kernel.daily_interest_rate, _kernel.position_duration_in_seconds);
            bytes32 _k_hash = kernel_hash(
                [_kernel.lender, _kernel.borrower, _kernel.relayer, _kernel.wrangler,
                _kernel.borrow_currency_address, _kernel.lend_currency_address],
                [_kernel.monitoring_fee, _kernel.expires_at, _kernel.daily_interest_rate, _kernel.position_duration_in_seconds],
                [_kernel.lend_currency_noteHash, _kernel.borrow_currency_noteHash, _kernel.salt]);

            // verify sender is kernel creator
            // require(is_signer(msg.sender, _k_hash, _sig_data));
            // verify sanity of offered and cancellation amounts
            // require(_kernel.lend_currency_offered_value > 0);
            // require(_lend_currency_cancel_value > 0);
            // verify cancellation amount does not exceed remaining loan amount to be filled
            // require(_kernel.lend_currency_offered_value - _k_hash >= _lend_currency_cancel_value);
            kernels_cancelled[_k_hash] = true;
    }
}