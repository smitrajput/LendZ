import React, { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import FadeIn from 'react-fade-in'
import Modal from 'react-modal'
import moment from 'moment'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import FormInput from '../FormInput/FormInput'
import { FormInputs, FeeFormInputs, WrapETHFormInputs } from './Forms'

import './FormTab.scss'
import './ReactTab.scss'

Modal.setAppElement('body')

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '30px 20px 0',
    minWidth: 500
  }
}

class FormTab extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalErrorIsOpen: false,
      modalErr: 'Unknown',
      dropdownOpen: {},

      lendToken: props.tokens.lend[0],
      borrowToken: props.tokens.lend[0],
      collateralToken: props.tokens.borrow[0],

      // Lend/Borrow Form Inputs
      loanAmountOffered: 1.0,
      interestRatePerDay: 5,
      loanDuration: 30 * 24 * 3600,
      offerExpiry: 12,
      wrangler: props.wranglers ? props.wranglers[0] : '',
      allowance: 0,
      fieldLoading: {},

      // Fee Form Inputs
      relayerFeeLST: 0,
      monitoringFeeLST: 1.0,
      rolloverFeeLST: 0,
      closureFeeLST: 0,

      // Wrap/Unwrap ETH Form Inputs
      ETHBalance: 0,
      wETHBalance: 0,
      operation: 'Wrap',
      amount: 0.05,
      WETHContractInstance: null,

      // Allowance Form Inputs
      token: 'WETH',

      tabIndex: 0,
      showFeeForm: true,
      making: false,

      flagOnSubmit: false,
      flagOnWrapETH: false,
      flagOnAllowance: false
    }

    this.onChange = this.onChange.bind(this)
    this.renderInputs = this.renderInputs.bind(this)
    this.renderFeeForm = this.renderFeeForm.bind(this)
    this.onWrapETH = this.onWrapETH.bind(this)
    this.onAllowance = this.onAllowance.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  onChange(key, value) {
    const formData = this.state
    formData[key] = value
    this.setState(formData)
  }

  onSelect(isLend, token) {
    this.setState({
      [isLend ? 'lendToken' : 'borrowToken']: token
    })
  }

  onChangeSync(item) {
    return e => {
      this.setState({ [item.key]: e.target.value })
    }
  }

  isValid(isLend = true) {
    const { contracts, exchangeRates, tokens } = this.props
    const formData = this.state
    const { lendToken, borrowToken } = formData
    contracts.loanAmountOffered = formData.loanAmountOffered

    let valid = true
    FormInputs(isLend, tokens).forEach(item => {
      if (item.required && Number(formData[item.key]) === 0) {
        valid = false
      } else if (item.validation) {
        if (
          !item.validation(
            contracts,
            exchangeRates[isLend ? lendToken : borrowToken],
            isLend ? lendToken : borrowToken
          )
        )
          valid = false
      }
    })
    FeeFormInputs(isLend).forEach(item => {
      if (item.required && Number(formData[item.key]) === 0) {
        valid = false
      } else if (item.validation) {
        if (!item.validation(contracts, formData[item.key])) valid = false
      }
    })
    return valid
  }

  isValidForm(form) {
    const formData = this.state
    let valid = true
    form.forEach(item => {
      if (item.required && Number(formData[item.key]) === 0) valid = false
    })
    return valid
  }

  randHex(len = 40) {
    const maxlen = 8
    const min = Math.pow(16, Math.min(len, maxlen) - 1)
    const max = Math.pow(16, Math.min(len, maxlen)) - 1
    const n = Math.floor(Math.random() * (max - min + 1)) + min
    let r = n.toString(16)
    while (r.length < len) {
      r = r + this.randHex(len - maxlen)
    }
    return r
  }

  onSubmit(isLend) {
    return async () => {
      const formData = this.state
      const { lendToken, borrowToken, collateralToken } = formData
      const loanToken = isLend ? lendToken : borrowToken
      const { address, methods, contracts, web3Utils, tokens } = this.props
      const postData = {}

      this.setState({
        flagOnSubmit: true
      })

      FormInputs(isLend, tokens).forEach(item => {
        postData[item.key] = item.output
          ? item.output(formData[item.key])
          : formData[item.key]
      })
      FeeFormInputs(isLend).forEach(item => {
        postData[item.key] = item.output
          ? item.output(formData[item.key])
          : formData[item.key]
      })
      postData.wrangler = formData.wrangler.address
      postData.lender = isLend ? address : ''
      postData.borrower = !isLend ? address : ''

      postData.creatorSalt = '0x' + this.randHex(40)
      postData.collateralToken =
        contracts.contracts && contracts.contracts[collateralToken]
          ? contracts.contracts[collateralToken]._address
          : ''
      postData.loanToken = contracts.contracts
        ? contracts.contracts[loanToken]._address
        : ''
      postData.collateralAmount = web3Utils.toWei(0)

      delete postData.allowance
      const timeStamp = await web3Utils.getBlockTimeStamp()
      let offerExpiry = new moment.utc(timeStamp * 1000)
      offerExpiry.add(postData.offerExpiry * 60, 'm')
      postData.offerExpiry = parseInt(offerExpiry.format('x') / 1000).toString()

      methods.onCreateOrder(postData, (err = {}, res) => {
        if (err && err.message) {
          this.setState(
            {
              modalErr: err.message
            },
            () => this.openModal('modalErrorIsOpen')
          )
        }
        this.setState({
          flagOnSubmit: false
        })
      })
    }
  }

  onWrapETH() {
    const { methods } = this.props
    const { amount, operation } = this.state

    this.setState({
      flagOnWrapETH: true
    })

    methods.onWrapETH(amount, operation === 'Wrap', (err = {}, res) => {
      if (err && err.message) {
        this.setState(
          {
            modalErr: err.message
          },
          () => this.openModal('modalErrorIsOpen')
        )
      }
      this.setState({
        flagOnWrapETH: false
      })
    })
  }

  onAllowance(selectedToken, loading = null) {
    const { methods } = this.props
    const { token, fieldLoading } = this.state

    this.setState({
      flagOnAllowance: true
    })

    methods.onAllowance(selectedToken || token, (err = {}, res) => {
      if (err && err.message) {
        this.setState(
          {
            modalErr: err.message
          },
          () => this.openModal('modalErrorIsOpen')
        )
      }
      if (loading) {
        fieldLoading[loading] = false
      }
      this.setState({
        flagOnAllowance: false,
        fieldLoading
      })
    })
  }

  onTabChange(tabIndex) {
    this.setState({ tabIndex })

    switch (tabIndex) {
      case 0: // Lend Form
        break
      case 1: // Borrow Form
        break
      case 2: // Wrap/Unwrap Form
        break
      case 3: // Allowance Form
        break
      default:
        break
    }
  }

  renderInputs(formInputs) {
    const { contracts, loading, exchangeRates } = this.props
    const formData = this.state
    const { tabIndex, lendToken, borrowToken, fieldLoading } = formData
    contracts.token = formData.token
    const loadings = Object.assign({}, loading, { making: formData.making })
    const loanPeriod = formData.loanDuration / (30 * 24 * 3600)

    return formInputs.map((item, index) => (
      <td style={item.style} key={index}>
        {item.key === 'operation' ? (
          <div className="FormInputWrapper">
            <div className="InputLabel">{item.label}</div>
            <Dropdown
              isOpen={this.state.dropdownOpen['operation']}
              toggle={e => this.toggle('operation')}
            >
              <DropdownToggle caret>{formData.operation}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Select Operation</DropdownItem>
                <DropdownItem
                  onClick={e =>
                    this.onChangeSync(item)({ target: { value: 'Wrap' } })
                  }
                  active={formData.operation === 'Wrap'}
                >
                  Wrap
                </DropdownItem>
                <DropdownItem
                  onClick={e =>
                    this.onChangeSync(item)({ target: { value: 'Unwrap' } })
                  }
                  active={formData.operation === 'Unwrap'}
                >
                  Unwrap
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : item.key === 'loanDuration' ? (
          <div className="FormInputWrapper">
            <div className="InputLabel">{item.label}</div>
            <Dropdown
              isOpen={this.state.dropdownOpen['loanDuration']}
              toggle={e => this.toggle('loanDuration')}
            >
              <DropdownToggle caret>
                {loanPeriod === 1
                  ? `${loanPeriod} month`
                  : loanPeriod < 12
                    ? `${loanPeriod} months`
                    : `${loanPeriod / 12} years`}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Select Period</DropdownItem>
                {[1, 3, 6].map((period, index) => (
                  <DropdownItem
                    key={index}
                    onClick={e =>
                      this.onChangeSync(item)({
                        target: { value: period * 30 * 24 * 3600 }
                      })
                    }
                    active={formData.loanDuration === period * 30 * 24 * 3600}
                  >
                    {period === 1
                      ? `${period} month`
                      : period < 12
                        ? `${period} months`
                        : `${period / 12} years`}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : (
              <FormInput
                data={item}
                onChange={this.onChange.bind(this)}
                onSelect={this.onSelect.bind(this)}
                token={
                  item.key.indexOf('LST') === -1
                    ? tabIndex === 0
                      ? lendToken
                      : borrowToken
                    : 'LST'
                }
                onWarning={token => {
                  const { fieldLoading } = this.state
                  if (
                    fieldLoading[item.key] ||
                    item.warning.feature ||
                    exchangeRates[tabIndex === 0 ? lendToken : borrowToken] === 0
                  )
                    return
                  fieldLoading[item.key] = true
                  this.setState({ fieldLoading }, () =>
                    this.onAllowance(token, item.key)
                  )
                }}
                tokenInfo={[formData.lendToken, formData.borrowToken]}
                val={item.value ? item.value(contracts) : formData[item.key]}
                loading={item.loading ? loadings[item.loading] : false}
                className={item.warning && item.warning.feature ? 'feature' : ''}
                warning={
                  item.warning ? (
                    item.warning.feature ? (
                      item.warning.message
                    ) : item.warning.check(
                      contracts,
                      formData[item.key],
                      exchangeRates[tabIndex === 0 ? lendToken : borrowToken],
                      tabIndex === 0 ? lendToken : borrowToken
                    ) ? (
                          <div>
                            <div
                              className={
                                fieldLoading[item.key] ||
                                  exchangeRates[
                                  tabIndex === 0 ? lendToken : borrowToken
                                  ] === 0
                                  ? 'Loading'
                                  : ''
                              }
                            >
                              {(fieldLoading[item.key] ||
                                exchangeRates[
                                tabIndex === 0 ? lendToken : borrowToken
                                ] === 0) && <div className="Loader" />}
                            </div>
                            Click <span>here</span> to unlock{' '}
                            {item.warning.message(
                              tabIndex === 0 ? lendToken : borrowToken,
                              formData[item.key]
                            )}
                          </div>
                        ) : null
                  ) : null
                }
              />
            )}
      </td>
    ))
  }

  renderFeeForm(showFeeForm, isLend) {
    return (
      <table
        cellSpacing="15"
        className={`FeeForm ${showFeeForm ? 'Show' : 'Hide'}`}
      >
        <tbody>
          <tr>
            {this.renderInputs(FeeFormInputs(isLend))}
            <td colSpan="1" className="Empty">
              {this.renderWrangler()}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderWrangler() {
    const { wrangler } = this.state
    const { wranglers } = this.props

    return (
      <div className="FormInputWrapper">
        <div className="InputLabel">Wrangler</div>
        <Dropdown
          isOpen={this.state.dropdownOpen['wrangler']}
          toggle={e => this.toggle('wrangler')}
        >
          <DropdownToggle caret>{wrangler.label}</DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Select Wrangler</DropdownItem>
            {(wranglers || []).map(({ address, label }, wIndex) => (
              <DropdownItem
                key={wIndex}
                onClick={e => this.setState({ wrangler: { address, label } })}
                active={wrangler.address === address}
              >
                {label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }

  toggle(key) {
    const { dropdownOpen } = this.state
    dropdownOpen[key] = !dropdownOpen[key]
    this.setState({ dropdownOpen })
  }

  renderCollateral(isLend = true) {
    const { collateralToken, fieldLoading } = this.state
    const {
      tokens,
      contracts: { allowances = {} }
    } = this.props
    const isWarning = !isLend && allowances[collateralToken] < 1000000

    return (
      <div className="FormInputWrapper">
        <div className="InputLabel">Collateral</div>
        <div className="FormInputs">
          <div className="FormInput" style={{ border: 0, marginBottom: 10 }}>
            <Dropdown
              isOpen={this.state.dropdownOpen['collateral']}
              toggle={e => this.toggle('collateral')}
            >
              <DropdownToggle caret>{collateralToken}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Select Tokens</DropdownItem>
                {tokens.borrow.map(token => (
                  <DropdownItem
                    key={token}
                    onClick={e => this.setState({ collateralToken: token })}
                    active={token === collateralToken}
                  >
                    {token}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {isWarning && (
              <div
                className="warning"
                onClick={e => {
                  const { fieldLoading } = this.state
                  fieldLoading[collateralToken] = true
                  this.setState({ fieldLoading }, () =>
                    this.onAllowance(collateralToken, collateralToken)
                  )
                }}
              >
                <div>
                  <div
                    className={fieldLoading[collateralToken] ? 'Loading' : ''}
                  >
                    {fieldLoading[collateralToken] && (
                      <div className="Loader" />
                    )}
                  </div>
                  Click <span>here</span> to unlock {collateralToken}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  renderButton(title, valid, onClick) {
    return (
      <td className="ButtonWrapper">
        <div
          className={`FormInput Button ${valid ? '' : 'Disabled'} ${
            valid === 2 ? 'Loading' : ''
            }`}
          onClick={valid === 1 ? onClick : null}
        >
          {valid === 2 && (
            <div className="Loading">
              <div className="Loader" />
            </div>
          )}
          <div className="left" /> {title}
        </div>
      </td>
    )
  }

  openModal(key) {
    this.setState({ [key]: true })
  }

  closeModal(key) {
    this.setState({ [key]: false })
  }

  render() {
    const { showFeeForm, modalErrorIsOpen, modalErr } = this.state

    const { tokens } = this.props

    return (
      <div className="TabWrapper">
        <div className="Title"></div>
        <Tabs
          selectedIndex={this.state.tabIndex}
          onSelect={this.onTabChange.bind(this)}
        >
          <TabList>
            <Tab>Lend</Tab>
            <Tab>Borrow</Tab>
            <Tab>Wrap/Unwrap ETH</Tab>
          </TabList>

          <TabPanel>
            <FadeIn>
              <table cellSpacing="15">
                <tbody>
                  <tr>
                    <td>{this.renderCollateral()}</td>
                  </tr>
                  <tr>
                    {this.renderInputs(FormInputs(true, tokens))}
                    {this.renderButton(
                      'Order',
                      this.state.flagOnSubmit ? 2 : this.isValid(true) ? 1 : 0,
                      this.onSubmit(true)
                    )}
                  </tr>
                </tbody>
              </table>
              <div
                className="HandleFeeForm"
                onClick={e => this.setState({ showFeeForm: !showFeeForm })}
              >
                {`${showFeeForm ? 'Hide' : 'Show'} Fee Form`}
              </div>
              {this.renderFeeForm(showFeeForm, true)}
            </FadeIn>
          </TabPanel>
          <TabPanel>
            <FadeIn>
              <table cellSpacing="15">
                <tbody>
                  <tr>
                    <td>{this.renderCollateral(false)}</td>
                  </tr>
                  <tr>
                    {this.renderInputs(FormInputs(false, tokens))}
                    {this.renderButton(
                      'Order',
                      this.state.flagOnSubmit ? 2 : this.isValid(false) ? 1 : 0,
                      this.onSubmit(false)
                    )}
                  </tr>
                </tbody>
              </table>
              <div
                className="HandleFeeForm"
                onClick={e => this.setState({ showFeeForm: !showFeeForm })}
              >
                {`${showFeeForm ? 'Hide' : 'Show'} Fee Form`}
              </div>
              {this.renderFeeForm(showFeeForm, false)}
            </FadeIn>
          </TabPanel>
          <TabPanel>
            <FadeIn>
              <table cellSpacing="15" className="WrapETHTable">
                <tbody>
                  <tr>
                    {this.renderInputs(WrapETHFormInputs)}
                    {this.renderButton(
                      'Submit',
                      this.state.flagOnWrapETH
                        ? 2
                        : this.isValidForm(WrapETHFormInputs)
                          ? 1
                          : 0,
                      this.onWrapETH
                    )}
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </TabPanel>
        </Tabs>
        <Modal
          isOpen={modalErrorIsOpen}
          style={customStyles}
          contentLabel={`'Something went wrong'`}
        >
          <h2>Something went wrong</h2>
          <button onClick={() => this.closeModal('modalErrorIsOpen')} />
          <div className="ModalBody">
            <div className="Info Error">
              <div style={{ textAlign: 'center', marginBottom: 15 }}>
                {modalErr}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default FormTab
