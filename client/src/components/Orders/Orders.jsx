import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { isBrowser } from 'react-device-detect'

import { Lendroid } from 'lendroid'

import TableGroup from '../TableGroup/TableGroup'
import ListGroup from '../ListGroup/ListGroup'
import FormTab from '../FormTab/FormTab'
import Header from '../Header/Header'

import CreateTables from '../../assets/Tables'

import { CONTRACT_ADDRESSES, ORDER_TOKENS } from './Contracts'

import 'intro.js/introjs.css'
import 'react-tabs/style/react-tabs.scss'
import './Orders.scss'

const options = _this => ({
  apiEndpoint: 'https://winged-yeti-201009.appspot.com',
  // apiEndpoint: 'http://localhost:8080',
  stateCallback: () => _this.setState({ lastSync: Date.now() }),
  CONTRACT_ADDRESSES,
  wranglers: [
    {
      label: 'Default Simple Wrangler',
      address: '0x0f02a30cA336EC791Ac8Cb40816e4Fc5aeB57E38',
      apiLoanRequests: 'https://lendroidwrangler.com'
    }
  ]
})

class Orders extends Component {
  constructor(props) {
    super(props)

    this.state = {
      LendroidJS: {},
      Tables: [],
      metamaskChecking: true,
      metamaskLogged: false,
      lastSync: Date.now()
    }
  }

  componentDidMount() {
    this.checkMetamask()
  }

  async checkMetamask() {
    if (window.ethereum) {
      try {
        await window.ethereum.enable()
        const newState = {
          metamaskLogged: true,
          metamaskChecking: false
        }
        if (Object.keys(this.state.LendroidJS).length === 0) {
          const LendroidJS = new Lendroid({
            ...options(this),
            provider: window.ethereum
          })
          newState['LendroidJS'] = LendroidJS
          newState['Tables'] = CreateTables(LendroidJS.web3Utils)
        }
        this.setState(newState)
      } catch (error) {
        this.setState({
          metamaskChecking: false
        })
      }
    } else if (window.web3) {
      window.web3.eth.getAccounts((err, accounts) => {
        if (accounts && accounts.length > 0) {
          const newState = {
            metamaskLogged: true,
            metamaskChecking: false
          }
          if (Object.keys(this.state.LendroidJS).length === 0) {
            const LendroidJS = new Lendroid(options(this))
            newState['LendroidJS'] = LendroidJS
            newState['Tables'] = CreateTables(LendroidJS.web3Utils)
          }
          this.setState(newState)
        } else {
          this.setState({
            metamaskChecking: false
          })
        }
      })
    }
  }

  getPositionsData() {
    const { LendroidJS } = this.state
    if (!LendroidJS.contracts || !LendroidJS.contracts.positions) return {}
    const {
      contracts: { positions },
      exchangeRates
    } = LendroidJS
    if (!positions) return {}

    let isExRatesReady = true
    positions.lent.forEach(position => {
      if (exchangeRates[position.loanCurrency] === 0) isExRatesReady = false
    })
    positions.borrowed.forEach(position => {
      if (exchangeRates[position.loanCurrency] === 0) isExRatesReady = false
    })
    if (!isExRatesReady) return {}

    const positionsData = {
      lent: positions.lent.map(position => {
        const { health } = position
        return Object.assign(position, {
          health: Math.min(parseInt(health, 10), 100)
        })
      }),
      borrowed: positions.borrowed.map(position => {
        const { health } = position
        return Object.assign(position, {
          health: Math.min(parseInt(health, 10), 100)
        })
      })
    }
    return positionsData
  }

  render() {
    const {
      LendroidJS = {},
      Tables,
      metamaskChecking,
      metamaskLogged
    } = this.state

    if (!window.web3 && !window.ethereum)
      return <Redirect to="/metamask-missing" />

    const {
      loading = {},
      orders = { myOrders: {} },
      lastFetchTime,
      exchangeRates = {},
      contracts,
      web3Utils,
      metamask = {},
      wranglers
    } = LendroidJS
    const { address, network } = metamask
    const { currentWETHExchangeRate } = exchangeRates
    const offers = orders.orders
    const myLendOffers = orders.myOrders.lend
    const myBorrowOffers = orders.myOrders.borrow
    const positions = this.getPositionsData()
    const methods = {
      onCreateOrder: LendroidJS.onCreateOrder,
      onWrapETH: LendroidJS.onWrapETH,
      onAllowance: LendroidJS.onAllowance,
      onPostLoans: LendroidJS.onPostLoans,
      onFillLoan: LendroidJS.onFillLoan,
      onClosePosition: LendroidJS.onClosePosition,
      onTopUpPosition: LendroidJS.onTopUpPosition,
      onLiquidatePosition: LendroidJS.onLiquidatePosition,
      onFillOrderServer: LendroidJS.onFillOrderServer,
      onDeleteOrder: LendroidJS.onDeleteOrder,
      onCancelOrder: LendroidJS.onCancelOrder
    }

    if (!(network && address) && !metamaskChecking && isBrowser)
      this.checkMetamask()

    return network && address ? (
      <div className="OrdersWrapper">
        <Header
          address={address}
          contracts={contracts}
          tokens={Object.keys(CONTRACT_ADDRESSES)}
        />
        <FormTab
          methods={methods}
          address={address}
          contracts={contracts}
          exchangeRates={exchangeRates}
          web3Utils={web3Utils}
          loading={loading}
          tokens={ORDER_TOKENS}
          pTokens={Object.keys(CONTRACT_ADDRESSES)}
          wranglers={wranglers}
        />
        {[1, 3, 6].map((term, tIndex) => (
          <TableGroup
            key={tIndex}
            methods={methods}
            address={address}
            contracts={contracts}
            data={{
              left: Tables[0],
              right: Tables[1],
              classes: 'first',
              data: { offers: JSON.parse(JSON.stringify(offers)) }
            }}
            web3Utils={web3Utils}
            loading={loading.orders}
            lastFetchTime={lastFetchTime}
            terms={term}
          />
        ))}
        <ListGroup
          methods={methods}
          address={address}
          contracts={contracts}
          currentWETHExchangeRate={currentWETHExchangeRate}
          data={{
            left: Tables[2],
            right: Tables[3],
            data: { myLendOffers, myBorrowOffers }
          }}
          web3Utils={web3Utils}
          loading={loading.orders}
          style={{ marginBottom: 29 }}
          isOffer
        />
        <ListGroup
          methods={methods}
          address={address}
          contracts={contracts}
          currentWETHExchangeRate={currentWETHExchangeRate}
          data={{
            left: Tables[4],
            right: Tables[5],
            data: positions,
            classes: 'Positions'
          }}
          web3Utils={web3Utils}
          loading={loading.positions}
        />
      </div>
    ) : metamaskChecking || metamaskLogged ? (
      <div className="Checking">
        {metamaskChecking ? 'Metamask Checking...' : 'Loading...'}
      </div>
    ) : (
      <Redirect to="/metamask-not-logged-in" />
    )
  }
}

export default Orders
