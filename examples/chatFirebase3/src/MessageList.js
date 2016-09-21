import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import { mobxFirebaseAutoSubscriber } from 'firebase-nest-mobx-react';

import RegisterOrLogin from './RegisterOrLogin';

/*
 Display messages and users for each message
 */

const dateFmtOptions = {
    weekday: 'long', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
};
const dateLocale = 'en-US';

class MessageList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newMessageText: '',
            error: null,
            fetching: false,
            newMessageUid: 'cookiemonster'
        };
        this.addMessage = this.addMessage.bind(this);
    }

    deleteMessage(messageKey) {
        const {chatStore} = this.props;
        this.setState({
            error: null
        }, () => {
            chatStore.deleteMessage(messageKey)
              .catch((error) => {
                  this.setState({error});
              });
        });
    }

    addMessage() {
        const { newMessageText, newMessageUid } = this.state;
        if (!newMessageText || !newMessageUid) {
            this.setState({error: 'missing text or user selection'});
            return;
        }

        const {chatStore} = this.props;

        this.setState({
            error: null
        }, () => {
            chatStore.addMessage({
                text: newMessageText,
                timestamp: new Date().getTime(),
                uid: newMessageUid
            })
              .then((res) => {
                  //Clear field
                  this.setState({newMessageText: ''})
                  return
              })
              .catch((error) => {
                  //Clear field and show error
                  this.setState({error, newMessageText: ''});
              });
        });
    }

    renderMessage(messageKey, messageData) {
        const {chatStore} = this.props;
        
        const user = chatStore.user(messageData.uid);

        return (
            <div style={{border:'1px grey solid'}} key={messageKey}>
                <div>
                    {messageData.text}
                </div>
                <div>
                    Posted {new Date(messageData.timestamp).toLocaleDateString(dateLocale, dateFmtOptions)}
                </div>
                {user && <div>By {user.get('first') || ''}{' '}{user.get('last') || ''}</div>}
                <button onClick={()=>this.deleteMessage(messageKey)}>
                    Delete
                </button>
            </div>
        );
    }

    renderUsersOptions() {
        const { chatStore } = this.props;

        const users = chatStore.allUsers();
        if (!users) return null;
        return users.entries().map(entry => {
            const uid = entry[0];
            const userData = entry[1];
            return (
                <option key={uid} value={uid}>
                    {userData.first}{' '}{userData.last}
                </option>
            );
        });
    }

    render() {
        const { chatStore } = this.props;

        const messages = chatStore.allMsgs();
        const numMessages = messages ? messages.keys().length : 0;

        const { newMessageText, newMessageUid, error, fetching } = this.state;

        return (
            <div>
                {error && <div style={{color:'red'}}>{error}</div>}

                <RegisterOrLogin />

                <div>

                    <div>Enter New Message:
                        <input onChange={(e) => this.setState({newMessageText: e.target.value})}
                               placeholder='enter text'
                               value={newMessageText}/>
                        <select
                          onChange={(e) => this.setState({newMessageUid: e.target.value})}
                          value={newMessageUid}>
                            <option value=''>Select User</option>
                            {this.renderUsersOptions()}
                        </select>
                        <button onClick={this.addMessage}>Send</button>
                    </div>
                    {fetching &&
                    <div>Loading messages and users...</div>
                    }
                    {messages &&
                    <div>
                        Messages:
                        {messages.keys().map(messageKey => this.renderMessage(messageKey, messages.get(messageKey)))}
                    </div>
                    }
                    {messages && numMessages == 0 &&
                    <h4 style={{color:'grey'}}>No Messages Yet</h4>
                    }
                </div>

            </div>
        );
    }
}

//to be passed to mobx-react.inject inside MobxAutoSubscriber
function mobxInject(allStores) {
    const {authStore, chatStore} = allStores;
    return {
        chatStore,
        subscribeSubs: allStores.subscribeSubs,
        getSubs: (props, state) => {
            //Subscriptions based on observable authStore.authUser() -- will be called
            //whenever the observable changes.
            return authStore.authUser() ? chatStore.allMsgsSubs().concat(chatStore.allUsersSubs()) : []
        }
    }
}

export default mobxFirebaseAutoSubscriber(mobxInject)(observer((MessageList)));