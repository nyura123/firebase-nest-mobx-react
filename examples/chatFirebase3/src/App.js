
import React, { Component, PropTypes } from 'react';

import { Provider, inject } from 'mobx-react';

/* App state and actions */
import ChatStore from './ChatStore';
import AuthStore from './AuthStore';

import MessageList from './MessageList';

export default class ChatApp extends Component {
    constructor(props) {
        super(props);
        this.stores = {
            chatStore: new ChatStore(props.fbApp),
            authStore: new AuthStore(props.fbApp)
        }
        this.subscribeSubs = this.stores.chatStore.subscribeSubs.bind(this.stores.chatStore);
    }

    componentWillUnmount() {
        if (this.stores) {
            this.stores.authStore && this.stores.authStore.cleanup();
            this.stores.chatStore && this.stores.chatStore.cleanup();
        }
    }

    render() {
        return (
          <Provider chatStore={this.stores.chatStore}
                    authStore={this.stores.authStore}
                    subscribeSubs={this.subscribeSubs}>
              <MessageList />
          </Provider>
        )
    }
}
