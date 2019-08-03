import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import MetaMaskLogInImg from 'assets/images/MetaMaskLogIn.svg'
import './MetaMaskLogIn.scss'

class MetaMaskLogIn extends Component {
  constructor(props) {
    super(props)

    this.state = {
      timer: -1,
      metamaskLogged: false,
      metamaskExists: true
    }
  }

  componentDidMount() {
    this.setState({
      timer: setInterval(this.checkMetamask.bind(this), 1000)
    })
  }

  componentWillUnmount() {
    if (this.state.timer > 0) clearInterval(this.state.timer)
  }

  checkMetamask() {
    if (window.web3) {
      window.web3.eth.getAccounts((err, accounts) => {
        if (accounts && accounts.length > 0) {
          this.setState({
            metamaskLogged: true
          })
        }
      })
    } else {
      this.setState({
        metamaskExists: false
      })
    }
  }

  render() {
    const { metamaskLogged, metamaskExists } = this.state
    return !metamaskExists ? (
      <Redirect to="/metamask-missing" />
    ) : metamaskLogged ? (
      <Redirect to="/" />
    ) : (
      <div className="MetaMaskLogInWrapper">
        <div className="MetaMaskLogIn">
          <h2 className="Title">Login to MetaMask</h2>
          <img className="MetaMaskLogInImg" src={MetaMaskLogInImg} alt="" />
          <p className="Description">Your Chrome Plugin is not active.</p>
        </div>
      </div>
    )
  }
}

export default MetaMaskLogIn
