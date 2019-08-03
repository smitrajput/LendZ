import React, { Component } from 'react'

import Reloanr from 'assets/images/Reloanr.svg'
import DesktopImg from 'assets/images/Desktop.svg'
import './Desktop.scss'

class Desktop extends Component {
  render() {
    return (
      <div className="DesktopWrapper">
        <div className="Desktop">
          <img src={Reloanr} alt="" />
          <p className="Warning">
            <b className="Light">RELOANR</b> requires <b>Chrome</b> with{' '}
            <b>MetaMask</b> installed or <b>Opera</b> browser. To use{' '}
            <b className="Light">RELOANR</b> on mobile or tablet,
          </p>
          <a
            href="https://status.im"
            target="_blank"
            className="link-status metamask"
            rel="noopener noreferrer"
          >
            download <b className="bold-text-5">Status</b>
          </a>
          <img className="DesktopImg" src={DesktopImg} alt="" />
        </div>
      </div>
    )
  }
}

export default Desktop
