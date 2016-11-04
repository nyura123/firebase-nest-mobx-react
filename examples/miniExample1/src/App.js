
import React, { Component, PropTypes } from 'react';
import MobxFirebaseStore from 'mobx-firebase-store';
import firebase from 'firebase';
import { mobxFirebaseAutoSubscriber } from '../../../src/mobxFirebaseAutoSubscriber';
import {observer} from 'mobx-react';

class MessagesList extends Component {
    renderMsg(msgKey, msg) {
        return (
          <div key={msgKey}>
              <h4>{msgKey}</h4>
              <div>text: {msg.text}</div>
              <div>timestamp: {msg.timestamp}</div>
              <div>uid: {msg.uid}</div>
          </div>
        )
    }
    render() {
        const { store } = this.props;
        const msgs = store.getData('msgs');

        return (
          <div>
              Messages:
              <br />
              {msgs && msgs.keys().map(msgKey => this.renderMsg(msgKey, msgs.get(msgKey)))}
              {!msgs && <div>Loading messages...</div>}
          </div>
        )
    }
}

MessagesList = mobxFirebaseAutoSubscriber()(observer(MessagesList));

export default class MiniExample extends Component {
    constructor(props) {
        super(props);
        this.store = new MobxFirebaseStore(firebase.database(props.fbApp).ref());
    }

    getSubs(props, state) {
        return [{
            subKey: 'msgs', //can use any name you want to describe the data source/subscription
            asList: true,
            path: 'samplechat/messages' //firebase location
        }]
    }
    subscribeSubs = (subs, props, state) => {
        return this.store.subscribeSubs(subs);
    }

    render() {
        return (
              <MessagesList
                store={this.store}
                getSubs={this.getSubs}
                subscribeSubs={this.subscribeSubs}
              />
        )
    }
}
