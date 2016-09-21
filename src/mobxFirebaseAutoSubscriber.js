
import React, { Component, PropTypes } from 'react';

function wrapSubs(subs) {
  if (subs && subs.constructor !== Array) {
    subs = [subs];
  }
  return subs || [];
}
function getSubKeys(subs) {
  return Object.keys(subs || {}).map(k => subs[k].subKey).sort().join(",");
}

import {observer, inject} from 'mobx-react';

export function mobxFirebaseAutoSubscriber(mobxInjectInfo) {
  return function(WrappedComponent) {
    class MobxAutoSubscriber extends Component {

      static propTypes = {
        getSubs: PropTypes.func.isRequired,
        subscribeSubs: PropTypes.func.isRequired
      }

      componentDidMount() {
        this.updateSubscriptions(this.props, this.state);
      }

      componentDidUpdate() {
        this.updateSubscriptions(this.props, this.state);
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      updateSubscriptions(props, state) {
        const { subscribeSubs } = this.props;

        const subs = wrapSubs(this.latestSubs);
        if (getSubKeys(subs) !== getSubKeys(this._subs)) {
          //Only unsubscribe/subscribe if subKeys have changed
          this._subs = subs;
          var unsub = this._unsub;
          this._unsub = subscribeSubs(subs, props, state);
          //Unsubscribe from old subscriptions
          if (unsub)
            unsub();
        }
      }

      unsubscribe() {
        if (this._unsub) {
          this._unsub();
          this._unsub = null;
        }
      }

      render() {
        const {getSubs, ...props} = this.props;

        //Trigger updating based on observables accessed in getSubs
        this.latestSubs = getSubs(this.props, this.state);

        return <WrappedComponent {...props} />
      }
    }

    return mobxInjectInfo ?
      inject(mobxInjectInfo)(observer(MobxAutoSubscriber)) :
      observer(MobxAutoSubscriber);
  }
}
