import React, { Component } from 'react'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import Modal from 'react-modal'
import InputModal from '../common/InputModal/InputModal'

import './List.scss'

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

class List extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dropdownOpen: {},
      topupCollateralAmount: 0,
      modalAmountIsOpen: false,
      modalErrorIsOpen: false,
      modalIsOpen: false,
      modalData: {},
      modalErr: 'Unknown',
      currentData: undefined,
      singleLoading: false
    }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal(key) {
    this.setState({ [key]: true })
  }

  closeModal(key, keep = false) {
    const { singleLoading } = this.state
    this.setState({
      [key]: false,
      topupCollateralAmount: 0,
      singleLoading: keep ? singleLoading : false
    })
  }

  getData(data) {
    const { key, filter } = data.data
    if (key) {
      const ret = this.props.data[key] || []
      if (filter) return filter(ret)
      return ret
    }
    return data.data
  }

  addCommas(value) {
    return (value + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }

  calcTerm(value) {
    const { isOffer } = this.props
    let day = parseInt(value / 3600 / 24, 10)
    let month = parseInt(day / 30, 10)
    day = day % 30
    let year = parseInt(month / 12)
    month = month % 12
    return isOffer
      ? `${year > 0 ? year + ' Years ' : ''}${
          month > 0 ? month + (month === 1 ? ' Month' : ' Months ') : ''
        }`
      : `${parseInt(value / 3600 / 24, 10)}d` +
          ((value / 3600) % 24 !== 0
            ? ` ${parseInt((value / 3600) % 24, 10)}h`
            : '')
  }

  setPrecision(value, prec) {
    const up = parseInt(value, 10)
    const down = (
      '000' + parseInt(value * Math.pow(10, prec), 10).toString()
    ).substr(-prec)
    return this.addCommas(up) + '.' + down
  }

  shortAddress(value) {
    return `${value.substr(0, 4)}...${value.substr(-4)}`
  }

  getDisplayData(data, header) {
    let ret = data[header.key]

    if (header.key === 'loanDuration') {
      ret = ret.split(' ')[0]
    }

    if (header.precision) ret = this.setPrecision(ret, header.precision)
    if (header.filter) ret = this[header.filter](ret)
    if (header.suffix) {
      ret = (
        <div>
          {ret} <span>{data[header.suffix] || header.suffix}</span>
        </div>
      )
    } else {
      ret = <div>{ret}</div>
    }
    return ret
  }

  getFill(percent) {
    if (percent > 80) return '#84d74d'
    if (percent > 60) return '#eeab35'
    if (percent > 40) return '#fd458a'
    return 'red'
  }

  toggle(key) {
    return () => {
      const { dropdownOpen } = this.state
      dropdownOpen[key] = !dropdownOpen[key]
      this.setState({ dropdownOpen })
    }
  }

  onSubmitTopupWithCollateral() {
    this.closeModal('modalAmountIsOpen', true)

    const { methods, web3Utils } = this.props
    const { currentData } = this.state
    const data = currentData.origin
    const topupCollateralAmount = web3Utils.toWei(
      this.state.topupCollateralAmount
    )

    methods.onTopUpPosition(data, topupCollateralAmount, (err, hash) => {
      if (err) {
        console.log(err)
        if (err.message) {
          this.setState(
            {
              modalErr: err.message
            },
            () => this.openModal('modalErrorIsOpen')
          )
        }
      } else {
        console.log(`[EVENT] : Position TopUp with HASH -> ${hash}`)
      }
      this.setState({ singleLoading: false })
    })
  }

  // Slots

  onCancel(data, param) {
    const { methods } = this.props

    const cancelCallback = (err, hash) => {
      if (err) {
        this.setState({ singleLoading: false })
        if (err.message) {
          this.setState(
            {
              modalErr: err.message
            },
            () => this.openModal('modalErrorIsOpen')
          )
        }
        return
      } else {
        methods.onDeleteOrder({ id: data.id, txHash: hash }, (err, res) => {
          if (err) {
            console.log(err)
            if (err.message) {
              this.setState(
                {
                  modalErr: err.message
                },
                () => this.openModal('modalErrorIsOpen')
              )
            }
          } else {
            console.log(`[EVENT] : Order Deleted with ID -> ${data.id}`)
          }
          this.setState({ singleLoading: false })
        })
      }
    }

    this.setState(
      {
        singleLoading: data.id
      },
      () => methods.onCancelOrder(data, cancelCallback)
    )
  }

  onLiquidatePosition(data, param) {
    const { methods } = this.props
    console.log(data, param)
    this.setState(
      {
        singleLoading: data.address
      },
      () =>
        methods.onLiquidatePosition(data, (err, hash) => {
          if (err) {
            console.log(err)
            if (err.message) {
              this.setState(
                {
                  modalErr: err.message
                },
                () => this.openModal('modalErrorIsOpen')
              )
            }
          } else {
            console.log(`[EVENT] : Position Liquidated with HASH ->`, hash)
          }
          this.setState({ singleLoading: false })
        })
    )
  }

  onRepayLoan(data, param) {
    const { methods } = this.props
    console.log(data, param)

    this.setState(
      {
        singleLoading: data.address
      },
      () =>
        methods.onClosePosition(data, (err, hash) => {
          if (err) {
            console.log(err)
            if (err.message) {
              this.setState(
                {
                  modalErr: err.message
                },
                () => this.openModal('modalErrorIsOpen')
              )
            }
          } else {
            console.log(`[EVENT] : Position Closed with HASH ->`, hash)
          }
          this.setState({ singleLoading: false })
        })
    )
  }

  onTopupWithCollateral(data, param) {
    console.log(data, param)
    this.setState(
      {
        currentData: Object.assign(data),
        param,
        topupCollateralAmount: 0,
        singleLoading: data.address
      },
      () => this.openModal('modalAmountIsOpen')
    )
  }

  onDetails(data, param) {
    console.log(data, param)
    this.setState({ modalData: data.detail }, () => {
      this.openModal('modalIsOpen')
    })
  }

  // Action

  onAction(action, data) {
    if (!action.slot) return
    this[action.slot](data, action.param)
  }

  onAllowance(selectedToken, address) {
    const { methods } = this.props

    this.setState(
      {
        singleLoading: address
      },
      () =>
        methods.onAllowance(selectedToken, (err = {}, res) => {
          if (err && err.message) {
            this.setState(
              {
                singleLoading: false,
                modalErr: err.message
              },
              () => this.openModal('modalErrorIsOpen')
            )
          } else {
            this.setState({ singleLoading: false })
          }
        })
    )
  }

  render() {
    const {
      data,
      classes,
      terms,
      contracts: { allowances }
    } = this.props
    const filteredData = this.getData(data)
    const {
      topupCollateralAmount,
      currentData = {},
      modalAmountIsOpen,
      modalErrorIsOpen,
      modalIsOpen,
      modalData,
      modalErr,
      singleLoading
    } = this.state

    return (
      <div className="ListWrapper">
        <div className="Title">
          <div>
            {data.title}{' '}
            {terms && (
              <i>
                {terms === 1
                  ? `(${terms} Month)`
                  : terms < 12
                  ? `(${terms} Months)`
                  : `(${terms / 12} Years)`}
              </i>
            )}
          </div>
        </div>
        <div className="ListsWrapper">
          {data.loading && (
            <div className="Loading">
              <div className="Loader" />
            </div>
          )}
          <div className="Lists">
            {filteredData.map((d, index) => (
              <div className={`List ${classes}`} key={index}>
                {data.headers.map((h, hIndex) => (
                  <div
                    key={hIndex}
                    className={`ListField ${h.key}`}
                    style={h.style}
                  >
                    <div className="Label">{h.label}</div>
                    <div className="Data">
                      {h.key === 'health' ? (
                        <div className="HealthBar">
                          <div className="BarPercent">
                            {this.getDisplayData(d, h)}
                          </div>
                          <div className="BarBase">
                            <div
                              className="Fill"
                              style={{
                                width: `${d[h.key] || 0}%`,
                                backgroundColor: this.getFill(d[h.key] || 0)
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        this.getDisplayData(d, h)
                      )}
                    </div>
                  </div>
                ))}
                <div className="Actions">
                  {data.action.label === '3-dot' ? (
                    data.action.items.filter(item => item.enabled(d)).length >
                    0 ? (
                      <Dropdown
                        isOpen={this.state.dropdownOpen[index]}
                        toggle={this.toggle(index)}
                      >
                        <DropdownToggle
                          style={data.action.style}
                          className="close three-dot"
                          disabled={singleLoading === d.address}
                        >
                          {singleLoading === d.address && (
                            <div className="Loading">
                              <div className="Loader" />
                            </div>
                          )}
                        </DropdownToggle>
                        <DropdownMenu>
                          {data.action.items
                            .filter(item => item.enabled(d))
                            .map((item, iIndex) => (
                              <DropdownItem
                                key={iIndex}
                                onClick={() => {
                                  if (
                                    item.slot === 'onRepayLoan' &&
                                    allowances[d.loanCurrency] < 1000000
                                  ) {
                                    this.onAllowance(d.loanCurrency, d.address)
                                  } else {
                                    this.onAction(item, d)
                                  }
                                }}
                              >
                                {item.slot === 'onRepayLoan' &&
                                allowances[d.loanCurrency] < 1000000 ? (
                                  <div>
                                    Unlock <span>{d.loanCurrency}</span> to
                                    Repay loan
                                  </div>
                                ) : (
                                  item.label
                                )}
                              </DropdownItem>
                            ))}
                        </DropdownMenu>
                      </Dropdown>
                    ) : // <button style={data.action.style} className="close three-dot"></button>
                    null
                  ) : (
                    <button
                      style={data.action.style}
                      className={`${data.action.key}`}
                      onClick={() =>
                        singleLoading !== d.id
                          ? this.onAction(data.action, d)
                          : null
                      }
                    >
                      {singleLoading === d.id && (
                        <div className="Loading">
                          <div className="Loader" />
                        </div>
                      )}
                      {data.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className={`List ${classes}`}>
                <div style={{ width: '100%' }}>
                  {data.loading ? 'Loading' : 'No Data'}
                </div>
              </div>
            )}
          </div>
        </div>
        <InputModal
          isOpen={modalAmountIsOpen}
          title="Topup Collateral Amount"
          onRequestClose={() => this.closeModal('modalAmountIsOpen')}
          onChange={e =>
            this.setState({ topupCollateralAmount: e.target.value })
          }
          onSubmit={this.onSubmitTopupWithCollateral.bind(this)}
          contentLabel="Topup Collateral Amount"
          value={topupCollateralAmount}
          max={0}
          suffix={currentData.collateralCurrency || ''}
          disabled={topupCollateralAmount > (currentData.amount || 0)}
        />
        <Modal
          isOpen={modalIsOpen}
          // onRequestClose={() => this.closeModal('modalIsOpen')}
          style={customStyles}
          contentLabel={`'Order Book'`}
        >
          <h2>Position Detail</h2>
          <button onClick={() => this.closeModal('modalIsOpen')} />
          <div className="ModalBody">
            <div className="Info">
              <table>
                <tbody>
                  {Object.keys(modalData).map((key, kIndex) => (
                    <tr key={kIndex}>
                      <td>{key}</td>
                      <td>{modalData[key].toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
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

export default List
