import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import ChatApp from '../../../examples/chatFirebase3/src/App';

import firebase from 'firebase';
const config = {
  apiKey: 'yourKeyGoesHere',
  authDomain: "localhost",
  databaseURL: 'https://testing-3bba1.firebaseio.com',//"https://dinosaur-facts.firebaseio.com",
  storageBucket: 'testing-3bba1.firebaseio.com'//"dinosaur-facts.firebaseio.com",
};
firebase.initializeApp(config);

storiesOf('Chat', module)
  .add('', () => {
    return <ChatApp />
  });