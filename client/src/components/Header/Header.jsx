import React, { Component } from 'react'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import './Header.scss'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      token: props.tokens[0],
      dropdownOpen: {}
    }
  }

  setPrecision(value, prec) {
    if (!prec) return value
    if (!value) value = 0
    const up = parseInt(value, 10)
    const down = (
      '000' + parseInt(value * Math.pow(10, prec), 10).toString()
    ).substr(-prec)
    return up + '.' + down
  }

  toUpper(value) {
    return `0x${value.substr(2).toUpperCase()}`
  }

  toggle(key) {
    const { dropdownOpen } = this.state
    dropdownOpen[key] = !dropdownOpen[key]
    this.setState({ dropdownOpen })
  }

  render() {
    const { token } = this.state
    const { address, contracts, tokens } = this.props

    return (
      <div className="HeaderWrapper">
        <div className="Inner">
          <div className="Logo">Reloanr</div>
          <div className="Header">
            <div className="Info Address">
              <div className="Label">Address</div>
              <div className="Value">{this.toUpper(address)}</div>
            </div>
            <div className="Info">
              <div className="SubInfo Info1">
                <div className="Label">Balance</div>
                <div className="Value">
                  {this.setPrecision(
                    contracts.balances ? contracts.balances.ETH : 0,
                    3
                  )}{' '}
                  <span>ETH</span>
                </div>
              </div>
              <div className="SubInfo Info2">
                <div className="Label" />
                <div className="Value">
                  {this.setPrecision(
                    contracts.balances ? contracts.balances.WETH : 0,
                    3
                  )}{' '}
                  <span>WETH</span>
                </div>
              </div>
              <div className="SubInfo Info3">
                <div className="Label" />
                <div className="Value">
                  {this.setPrecision(
                    contracts.balances ? contracts.balances.LST : 0,
                    3
                  )}{' '}
                  <span>LST</span>
                </div>
              </div>
              <div className="SubInfo Info4">
                <div className="Label" />
                <div
                  className="Value"
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {this.setPrecision(
                    contracts.balances ? contracts.balances[token] : 0,
                    3
                  )}{' '}
                  <span className="SuffixDropDown">
                    <Dropdown
                      isOpen={this.state.dropdownOpen['list']}
                      toggle={e => this.toggle('list')}
                    >
                      <DropdownToggle caret>{token}</DropdownToggle>
                      <DropdownMenu>
                        {tokens.map((tok, index) => (
                          <DropdownItem
                            key={index}
                            onClick={e => this.setState({ token: tok })}
                            active={tok === token}
                          >
                            {tok}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Header
