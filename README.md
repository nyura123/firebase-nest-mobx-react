#### mobxFirebaseAutoSubscriber

Creates a React HOC (higher-order-component) that subscribes to firebase data.

Uses [firebase-nest](https://github.com/nyura123/firebase-nest) subscriptions.

The HOC requires 2 properties:

1. `getSubs: (props, state) => Array<Sub>` - function that returns an array of subscriptions
2. `subscribeSubs: (subs) => unsubscribeFunction` - function that performs subscriptions & returns unsubscribe: ()=>void

#### Install libs

 `npm install firebase mobx mobx-react firebase-nest mobx-firebase-store`

 `mobx-firebase-store` is optional, you can use other stores


#### Example using `mobx-firebase-store`:

```js
import firebase from 'firebase';
import MobxFirebaseStore from 'mobx-firebase-store';
const config = {
  apiKey: 'yourKey',
  authDomain: "localhost",
  databaseURL: "https://docs-examples.firebaseio.com",
  storageBucket: "docs-examples.firebaseio.com",
};
firebase.initializeApp(config);
const chatStore = new MobxFirebaseStore(firebase.database().ref());
const subscribeSubs = chatStore.subscribeSubs.bind(chatStore);
```

#### Can pass down stores and subscribeSubs+getSubs via mobx Provider & inject, or via direct props

##### Example using Provider & mobx inject:

App render:

```js
 <Provider chatStore={chatStore}
           subscribeSubs={subscribeSubs}>
  <MessageList />
</Provider>
```

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
    
        //subscriptions based on props, state, and possibly observables
        getSubs: (props, state) => {           
            return [{
                subKey: 'allMessages',        //can use any name, should match getData call (see above)
                asList: true,                 //or asValue: true
                path: 'chat/messages'         //firebase path
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

