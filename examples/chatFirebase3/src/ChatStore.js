
import MobxFirebaseStore from 'mobx-firebase-store';

import firebase from 'firebase';

const userStr = 'userDetail_';
const allMsgsStr = 'allMsgs';
const allUsersStr = 'allUsers';
const messageStr = 'message_';

import { autorun, map } from 'mobx';

import { incrementalGrouping } from './incrementalGrouping';

export default class ChatStore extends MobxFirebaseStore {
    constructor(fbApp) {
        super(firebase.database(fbApp).ref());

        //derived data populated by auto-runs
        this.numMessagesPerUser = map({});

        this.messageAutoRuns = {};

        //plain data used by message auto-runs incremental grouping
        this.byUser = {
            groups: {},
            messageCache: {}
        };

        const groupByUser = incrementalGrouping({
            getGroupKeys: message => [message.uid],
            onUpdatedInGroup: this.messageUpdatedForUser
        });

        this.allMessagesAutoRun = autorun(() => {
            const messages = this.allMsgs();

            console.log('all msgs autorun');

            messages && (messages.keys()).forEach(messageKey => {
                this.setUpMessageAutoRun(messageKey, groupByUser);
            });

            Object.keys(this.messageAutoRuns).forEach(messageKey => {
                if (!messages || !messages.get(messageKey)) {
                    const disposer = this.messageAutoRuns[messageKey];
                    console.log('remove autorun for '+messageKey);
                    if (disposer) disposer();
                    delete this.messageAutoRuns[messageKey];
                }
            });

        });

    }

    cleanup() {
        Object.keys(this.messageAutoRuns || []).forEach(messageKey => {
            const disposer = this.messageAutoRuns[messageKey];
            if (disposer) disposer();
        });
        this.allMessagesAutoRun && this.allMessagesAutoRun();
    }

    setUpMessageAutoRun(messageKey, groupByUser) {
        if (this.messageAutoRuns[messageKey]) {
            return;
        }
        console.log('set up autorun for message '+messageKey);
        this.messageAutoRuns[messageKey] = autorun(() => {
            const observableMessage = this.message(messageKey);
            const message = observableMessage ? this.message(messageKey).toJS() : null;
            console.log('processing message '+messageKey);
            groupByUser(messageKey, message, this.byUser.groups, this.byUser.messageCache);
        });
    }

    messageUpdatedForUser = (messageKey, newMessage, prevMessage, uid, user) => {
        const userMessages = (user || {}).objects || {};
        const numMessages = Object.keys(userMessages).length;
        this.numMessagesPerUser.set(uid, numMessages);
    }

    resolveFirebaseQuery(sub) {
        let ref = this.fb.child(sub.path);
        if (sub.orderByChild) {
            ref = ref.orderByChild(sub.orderByChild);
        }
        if (sub.equalTo) {
           ref = ref.equalTo(sub.equalTo);
        }
        return ref;
    }
    
    //write to firebase
    addMessage({text, uid, timestamp}) {
        return this.fb.child('chat').child('messages').push({text, uid, timestamp})
          .catch(error => {
              throw error.code;
          })
    }

    deleteMessage(messageKey) {
        return this.fb.child('chat').child('messages').child(messageKey).set(null)
          .catch(error => {
              throw error.code;
          });
    }

    //getters
    user(userKey) {
        return this.getData(userStr + userKey);
    }
    numMessagesForUser(userKey) {
        return this.numMessagesPerUser.get(userKey) || 0;
    }
    message(messageKey) {
        return this.getData(messageStr + messageKey);
    }
    allMsgs() {
        return this.getData(allMsgsStr);
    }
    allUsers() {
        return this.getData(allUsersStr);
    }

    allUsersSubs() {
        return [{
            subKey: allUsersStr,
            asList: true,
            path: 'chat/users'
        }];
    }

    allMsgsSubs() {
        return [{
            subKey: allMsgsStr,
            asList: true,
            path: 'chat/messages',

            // orderByChild: 'text',
            // equalTo: 'hello',

            //nested subscription - subscribe to each message's user
            //and individual message for derived data (# msgs per user)
            forEachChild: {
                childSubs: function(messageKey, messageData) {
                    return [{
                        subKey: userStr+messageData.uid,
                        asValue: true,
                        path: 'chat/users/'+messageData.uid
                    }, {
                        subKey: messageStr+messageKey,
                        asValue: true,
                        path: 'chat/messages/'+messageKey
                    }]
                }
            }
        }];
    }
}