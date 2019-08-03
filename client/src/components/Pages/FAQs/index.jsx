import React, { Component } from 'react'
import FadeIn from 'react-fade-in'

import { FAQContents } from './FAQ'

import './style.scss'

class FAQs extends Component {
  state = {
    opened: {}
  }
  render() {
    const { opened } = this.state

    return (
      <div className="FAQsWrapper">
        <h1>FAQs for <a href="https://reloanr.com">ReloanR</a></h1>
        <div className="FAQs">
          <p>
            Reloanr is a <a href="https://app.reloanr.com">dApp</a> for collateralised ERC20 loans, with stablecoins
            forming an important part of the ecosystem. Those who hold digital
            assets can lend and earn interest on their tokens. And those that
            need them can use this as an alternative to outright purchase on
            exchanges. By adding a layer of utility, and a form of transaction
            outside an exchange, Reloanr hopes to increase the level of
            liquidity.
          </p>

          {FAQContents.map(({ title, contents }, fIndex) => (
            <div className="Section" key={fIndex}>
              <h3>{title}</h3>
              {contents.map((content, cIndex) => (
                <div className="Content" key={cIndex}>
                  <h6
                    className="Title"
                    onClick={e => {
                      const { opened } = this.state
                      opened[`${fIndex}-${cIndex}`] = !opened[
                        `${fIndex}-${cIndex}`
                      ]
                      this.setState({
                        opened
                      })
                    }}
                  >
                    {content[0]}
                    <i
                      className={`fa fa-${
                        opened[`${fIndex}-${cIndex}`] ? 'minus' : 'plus'
                      }-square-o`}
                    />
                  </h6>
                  {opened[`${fIndex}-${cIndex}`] && (
                    <FadeIn>
                      <p dangerouslySetInnerHTML={{ __html: content[1] }} />
                    </FadeIn>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default FAQs
