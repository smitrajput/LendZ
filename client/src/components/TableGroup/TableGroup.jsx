import React, { Component } from 'react'

import Table from '../Table/Table'

import './TableGroup.scss'

class TableGroup extends Component {
  render() {
    const {
      style,
      data,
      address,
      contracts,
      methods,
      loading,
      lastFetchTime,
      web3Utils,
      terms = 1
    } = this.props
    const offers = JSON.parse(JSON.stringify(data.data.offers || []))

    const left = Object.assign(
      data.left,
      { offers },
      { loading, lastFetchTime }
    )
    const right = Object.assign(
      data.right,
      { offers },
      {
        loading,
        lastFetchTime
      }
    )

    return (
      <div className="TableGroup" style={style}>
        <Table
          data={left}
          classes={data.classes ? data.classes : ''}
          address={address}
          contracts={contracts}
          methods={methods}
          web3Utils={web3Utils}
          terms={terms}
        />
        <Table
          data={right}
          classes={data.classes ? data.classes : ''}
          address={address}
          contracts={contracts}
          methods={methods}
          web3Utils={web3Utils}
          terms={terms}
        />
      </div>
    )
  }
}

export default TableGroup
