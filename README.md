#### mobxFirebaseAutoSubscriber - DEPRECATED

Creates a React HOC (higher-order-component) that subscribes to firebase data.

Uses [firebase-nest](https://github.com/nyura123/firebase-nest) subscriptions.

The HOC requires 2 properties:

1. `getSubs: (props) => Array<Sub>` - function that returns an array of subscriptions
2. `subscribeSubs: (subs) => unsubscribeFunction` - function that performs subscriptions & returns unsubscribe: ()=>void

#### Install libs

 `npm install firebase mobx mobx-react firebase-nest mobx-firebase-store`

 `mobx-firebase-store` is optional, you can use other stores


#### Example using `mobx-firebase-store`:

```js
import React, { Component, PropTypes } from 'react';
import MobxFirebaseStore from 'mobx-firebase-store';
import firebase from 'firebase';
import { observer } from 'mobx-react';

import { mobxFirebaseAutoSubscriber } from 'firebase-nest-mobx-react';

const miniFbApp = firebase.initializeApp({
  apiKey: 'yourApiKey',
  authDomain: "localhost",
  databaseURL: 'https://docs-examples.firebaseio.com',
  storageBucket: 'docs-examples.firebaseio.com'
}, "mini");

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
        this.store = new MobxFirebaseStore(firebase.database(miniFbApp).ref());
    }


    //getSubs and subscribeSubs needed by mobxFirebaseAutoSubscriber
    //props are what's passed to MessageList (not MiniExample)
    getSubs(props) {
        console.log('getSubs')
        return [{
            subKey: 'msgs', //can use any name you want; use same name in store.getData
            asList: true,
            path: 'samplechat/messages' //firebase location
        }]
    }
    subscribeSubs = (subs, props) => {
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
```

#### Can pass down stores and subscribeSubs+getSubs via mobx Provider & inject, or via direct props as above

##### Example using Provider & mobx inject:

Provide global chatStore and subscribeSubs in App render:

```js
 <Provider chatStore={chatStore}
           subscribeSubs={subscribeSubs}>
  <MessageList />
</Provider>
```


Inject chatStore, subscribeSubs, getSubs into MessageList props:

```js

import { mobxFirebaseAutoSubscriber } from 'firebase-nest-mobx-react';

class MessageList extends Component {
    render() {
        const { chatStore } = this.props;
        
        const messages = chatStore.getData('allMessages');
        
        const isLoading = !messages;
        
        //...
     }   
}

function mobxInject(allStores) {
    const { chatStore } = allStores;
    return {
        chatStore,                              //will be passed down to wrapped MessageList
        
        subscribeSubs: allStores.subscribeSubs, //careful if using multiple stores
    
        //subscriptions based on props and possibly observables
        getSubs: (props) => {           
                return [{
                    subKey: 'msgs',
                    asList: true,
                    path: 'samplechat/messages'
                }]
        }
    }
}

export default mobxFirebaseAutoSubscriber(mobxInject)(observer((MessageList)));
```

#### Full chat example via storybook

Includes auth, derived/denormalized data, error handling, writing to firebase, nested subscriptions

1. `cd examples-storybook-firebase3`

  To run, you need to set your API key in index.js.
  You can create one at https://console.cloud.google.com, credentials->create credentials->API key->browser key.

2. `npm install`

3. `npm run storybook`

