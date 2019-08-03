import React, { Component } from 'react'
import Modal from 'react-modal'

import './InputModal.scss'

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
    transform: 'translate(-50%, -50%)'
  }
}

class InputModal extends Component {
  render() {
    const props = this.props
    return (
      <div className="InputModalWrapper">
        <Modal
          isOpen={props.isOpen}
          // onRequestClose={props.onRequestClose}
          style={customStyles}
          contentLabel={props.contentLabel}
        >
          {props.isLoading && (
            <div className="Loading">
              {props.loadingContent && (
                <div className="Content">{props.loadingContent}</div>
              )}
              <div className="Loader" />
            </div>
          )}
          <h2>{props.title}</h2>
          {props.description && <p>{props.description}</p>}
          <button onClick={props.onRequestClose} />
          <div className="ModalBody">
            <div style={{ width: '100%' }}>
              <div className="FillLoanAmount">
                <div className="Label">
                  {props.contentLabel === 'Private Key'
                    ? props.contentLabel
                    : 'Amount'}
                </div>
                <div className="FormInputWrapper">
                  <div
                    className={`FormInput ${
                      props.suffix
                        ? `Suffix ${props.suffix || ''} L${
                            (props.suffix || '').length
                          }`
                        : ''
                    } ${props.prefix ? 'Prefix' : ''}`}
                  >
                    <div className="Prefix">{props.prefix}</div>
                    <input
                      type={props.type || 'number'}
                      onChange={props.onChange}
                      value={props.value}
                      min="0"
                      max={props.max}
                      style={{ textAlign: props.type ? 'left' : 'center' }}
                    />
                    <div className={`Suffix`}>{props.suffix}</div>
                    <div className="after" />
                    <div className="before" />
                  </div>
                </div>
                {props.value > props.max && props.max > 0 && (
                  <div className="Warning">{`Input exceed max value of ${
                    props.max
                  }`}</div>
                )}
              </div>
              <div className="Buttons">
                <div
                  className={`Confirm ${
                    props.disabled || props.value <= 0 ? 'Disabled' : ''
                  }`}
                  disabled={props.disabled || props.value <= 0 ? true : false}
                  onClick={
                    props.disabled || props.value <= 0 ? null : props.onSubmit
                  }
                >
                  Submit
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default InputModal
