import React, { Component } from 'react'
import FadeIn from 'react-fade-in'
import {
  isBrowser,
  isChrome,
  isOpera,
  isChromium,
  isMobile,
  browserName,
  browserVersion
} from 'react-device-detect'
import { Route, Switch } from 'react-router-dom'

import Orders from './components/Orders/Orders'
import {
  PageDesktop,
  PageMetaMaskLogIn,
  PageMetaMaskMissing,
  PageNotFound,
  PageFAQs
} from './components/Pages'

import './App.scss'

class App extends Component {
  render() {
    return (
      <FadeIn>
        <div className={`AppWrapper ${browserName}`}>
          {(isBrowser && (isChrome || isOpera || isChromium)) ||
          (isMobile && browserName === 'Chrome WebView') ? (
            <Switch>
              <Route exact path="/" render={() => <Orders />} />
              <Route exact path="/faq" render={() => <PageFAQs />} />
              <Route
                exact
                path="/metamask-missing"
                render={() => <PageMetaMaskMissing />}
              />
              <Route
                exact
                path="/metamask-not-logged-in"
                render={() => <PageMetaMaskLogIn />}
              />
              <Route render={() => <PageNotFound />} />
            </Switch>
          ) : (
            <div>
              <div className="CurrentDevice">
                {browserName} - {browserVersion}
              </div>
              <Switch>
                <Route path="/" render={() => <PageDesktop />} />
              </Switch>
            </div>
          )}
        </div>
      </FadeIn>
    )
  }
}

export default App
