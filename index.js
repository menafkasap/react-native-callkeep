import { NativeModules, Platform, Alert } from 'react-native';

import { listeners, emit } from './actions'

const RNCallKeepModule = NativeModules.RNCallKeep;

const CONSTANTS = {
  END_CALL_REASONS: {
    FAILED: 1,
    REMOTE_ENDED: 2,
    UNANSWERED: 3,
    ANSWERED_ELSEWHERE: 4,
    DECLINED_ELSEWHERE: 5, // make declined elsewhere link to "Remote ended" on android because that's kinda true
    MISSED: 2  }
};

export { CONSTANTS };

class RNCallKeep {

  constructor() {
    this._callkeepEventHandlers = new Map();

    this.addEventListener('didLoadWithEvents', (events) => {
      events.forEach(event => {
        emit(event.name, event.data);
      });
    });
  }

  addEventListener = (type, handler) => {
    const listener = listeners[type](handler);

    this._callkeepEventHandlers.set(type, listener);
  };

  removeEventListener = (type) => {
    const listener = this._callkeepEventHandlers.get(type);
    if (!listener) {
      return;
    }

    listener.remove();
    this._callkeepEventHandlers.delete(type);
  };

  setup = async (options) => {
    return this._setupIOS(options.ios);
  };

  displayIncomingCall = (uuid, handle, localizedCallerName = '', handleType = 'number', hasVideo = false) => {
    RNCallKeepModule.displayIncomingCall(uuid, handle, handleType, hasVideo, localizedCallerName);
  };

  startCall = (uuid, handle, contactIdentifier, handleType = 'number', hasVideo = false ) => {
    RNCallKeepModule.startCall(uuid, handle, contactIdentifier, handleType, hasVideo);
  };

  reportConnectingOutgoingCallWithUUID = (uuid) => {
    RNCallKeepModule.reportConnectingOutgoingCallWithUUID(uuid);
  };

  reportConnectedOutgoingCallWithUUID = (uuid) => {
    RNCallKeepModule.reportConnectedOutgoingCallWithUUID(uuid);
  };

  reportEndCallWithUUID = (uuid, reason) => RNCallKeepModule.reportEndCallWithUUID(uuid, reason);

  rejectCall = (uuid) => {
    RNCallKeepModule.endCall(uuid);
  };

  isCallActive = async(uuid) => await RNCallKeepModule.isCallActive(uuid);

  endCall = (uuid) => RNCallKeepModule.endCall(uuid);

  endAllCalls = () => RNCallKeepModule.endAllCalls();

  setMutedCall = (uuid, shouldMute) => {
    RNCallKeepModule.setMutedCall(uuid, shouldMute);
  };

  sendDTMF = (uuid, key) => RNCallKeepModule.sendDTMF(uuid, key);

  checkIfBusy = () => RNCallKeepModule.checkIfBusy();

  checkSpeaker = () => RNCallKeepModule.checkSpeaker();

  updateDisplay = (uuid, displayName, handle) => RNCallKeepModule.updateDisplay(uuid, displayName, handle);

  setOnHold = (uuid, shouldHold) => RNCallKeepModule.setOnHold(uuid, shouldHold);

  setReachable = () => RNCallKeepModule.setReachable();

  // @deprecated
  reportUpdatedCall = (uuid, localizedCallerName) => {
    console.warn('RNCallKeep.reportUpdatedCall is deprecated, use RNCallKeep.updateDisplay instead');
    RNCallKeepModule.reportUpdatedCall(uuid, localizedCallerName)
  };

  _setupIOS = async (options) => new Promise((resolve, reject) => {
    if (!options.appName) {
      reject('RNCallKeep.setup: option "appName" is required');
    }
    if (typeof options.appName !== 'string') {
      reject('RNCallKeep.setup: option "appName" should be of type "string"');
    }

    resolve(RNCallKeepModule.setup(options));
  });

  _alert = async (options, condition) => new Promise((resolve, reject) => {
    if (!condition) {
      return resolve(false);
    }

    Alert.alert(
      options.alertTitle,
      options.alertDescription,
      [
        {
          text: options.cancelButton,
          onPress: reject,
          style: 'cancel',
        },
        { text: options.okButton,
          onPress: () => resolve(true)
        },
      ],
      { cancelable: true },
    );
  });
}

export default new RNCallKeep();
