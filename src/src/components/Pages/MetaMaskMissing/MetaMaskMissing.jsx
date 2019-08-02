import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import MetaMask from 'assets/images/MetaMask.svg'
import './MetaMaskMissing.scss'

class MetaMaskMissing extends Component {
  constructor(props) {
    super(props)

    this.state = {
      timer: -1,
      metamaskExists: false
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
      this.setState({
        metamaskExists: true
      })
    }
  }
  render() {
    const { metamaskExists } = this.state
    return metamaskExists ? (
      <Redirect to="/" />
    ) : (
      <div className="MetaMaskMissingWrapper">
        <div className="MetaMaskMissing">
          <h2 className="Title">Metamask Missing</h2>
          <img className="MetaMaskMissingImg" src={MetaMask} alt="" />
          <p className="Description">
            Please install Metamask as a Chrome extension.{' '}
            <a
              href="https://metamask.io"
              target="_blank"
              className="link-status metamask"
              rel="noopener noreferrer"
            >
              Download now
            </a>
            .
          </p>
        </div>
      </div>
    )
  }
}

export default MetaMaskMissing
