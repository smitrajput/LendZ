import * as ABIs from './ContractABIs'

export const CONTRACT_ADDRESSES = {
  DAI: {
    1: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    42: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2',
    def: ABIs.ERC20ABI
    // def: ABIs.DAIABI
  },
  DGX: {
    1: '0x4f3AfEC4E5a3F2A6a1A411DEF7D7dFe50eE057bF',
    42: '0x7d6D31326b12B6CBd7f054231D47CbcD16082b71',
    def: ABIs.ERC20ABI
    // def: ABIs.DGXABI
  },
  USDC: {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    42: '0x507aac698a8f2dcd2a6f48090972cdcd5342e5f9',
    def: ABIs.ERC20ABI
  }
}

export const ORDER_TOKENS = {
  lend: ['USDC', 'DAI', 'LST'],
  borrow: ['DAI', 'DGX', 'WETH']
}
