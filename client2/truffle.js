require("dotenv").config();

const HDWalletProvider = require("truffle-hdwallet-provider");

const createProvider = (network) => {
    if (!process.env.MNEMONIC) {
        console.log("Please set your MNEMONIC in a .env file first");
        process.exit(1);
    }
    if (!process.env.INFURA_API_KEY) {
        console.log("Please set your INFURA_API_KEY in a .env file first");
        process.exit(1);
    }
    return () => {
        return new HDWalletProvider(
            process.env.MNEMONIC,
            `https://${network}.infura.io/v3/` + process.env.INFURA_API_KEY
        );
    };
};

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",     // Localhost (default: none)
            port: 9545,            // Standard Ethereum port (default: none)
            network_id: "*",       // Any network (default: none)
        },
        rinkeby: {
            provider: createProvider("rinkeby"),
            network_id: 4,       // Rinkeby's id
            gas: 6000000,        // Rinkeby has a lower block limit than mainnet
            skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
        },
        kovan: {
            provider: createProvider("kovan"),
            network_id: 42,       // Rinkeby's id
            gas: 6000000,        // Rinkeby has a lower block limit than mainnet
            skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
        },
        mocha: {
        },
        // Configure your compilers
        compilers: {
            solc: {
                version: "^0.5.0"
            }
        }
    }
}