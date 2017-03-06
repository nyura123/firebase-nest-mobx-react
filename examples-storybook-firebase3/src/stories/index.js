import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import ChatApp from '../../../examples/chatFirebase3/src/App';
import Mini from '../../../examples/miniExample1/src/App';

import firebase from 'firebase';

const miniFbApp = firebase.initializeApp({
  apiKey: 'yourApiKey',
  authDomain: "localhost",
  databaseURL: 'https://docs-examples.firebaseio.com',
  storageBucket: 'docs-examples.firebaseio.com'
}, "mini");

storiesOf('Mini', module)
  .add('', () => {
    return <Mini fbApp={miniFbApp}/>
  });

const chatFbApp = firebase.initializeApp({
  apiKey: 'yourApiKey',
  authDomain: "localhost",
  databaseURL: 'https://testing-3bba1.firebaseio.com',
  storageBucket: 'testing-3bba1.firebaseio.com'
}, "chat");

storiesOf('Chat', module)
  .add('', () => {
    return <ChatApp fbApp={chatFbApp} />
  });

