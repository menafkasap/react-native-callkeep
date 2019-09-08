import { NativeModules, Platform, Alert } from 'react-native';

import { listeners } from './actions'

const RNCallKeepModule = NativeModules.RNCallKeep;
const isIOS = Platform.OS === 'ios';
const supportConnectionService = !isIOS && Platform.Version >= 23;

class RNCallKeep {

  constructor() {
    this._callkitEventHandlers = new Map();
  }


  addEventListener = (type, handler) => {
    const listener = listeners[type](handler);

    this._callkitEventHandlers.set(handler, listener);
  };

  removeEventListener = (type, handler) => {
    const listener = this._callkitEventHandlers.get(handler);
    if (!listener) {
      return;
    }

    listener.remove();
    this._callkitEventHandlers.delete(handler);
  };

  setup = async (options) => {
    if (!isIOS) {
      return this._setupAndroid(options.android);
    }

    return this._setupIOS(options.ios);
  };

  hasDefaultPhoneAccount = async (options) => {
    if (!isIOS) {
      return this._hasDefaultPhoneAccount(options);
    }

    return;
  };

  displayIncomingCall = (uuid, handle, localizedCallerName, handleType = 'number', hasVideo = false) => {
    if (!isIOS) {
      RNCallKeepModule.displayIncomingCall(uuid, handle, localizedCallerName);
      return;
    }

    RNCallKeepModule.displayIncomingCall(uuid, handle, handleType, hasVideo, localizedCallerName);
  };

  answerIncomingCall = (uuid) => {
    if (!isIOS) {
      RNCallKeepModule.answerIncomingCall(uuid);
    }
  }

  startCall = (uuid, handle, contactIdentifier, handleType = 'number', hasVideo = false ) => {
    if (!isIOS) {
      RNCallKeepModule.startCall(uuid, handle, contactIdentifier);
      return;
    }

    RNCallKeepModule.startCall(uuid, handle, contactIdentifier, handleType, hasVideo);
  };

  reportConnectingOutgoingCallWithUUID = (uuid) => {
    //only available on iOS
    if (isIOS) {
      RNCallKeepModule.reportConnectingOutgoingCallWithUUID(uuid);
    }
  };

  reportConnectedOutgoingCallWithUUID = (uuid) => {
    //only available on iOS
    if (isIOS) {
      RNCallKeepModule.reportConnectedOutgoingCallWithUUID(uuid);
    }
  };

  reportEndCallWithUUID = (uuid, reason) => {
    RNCallKeepModule.reportEndCallWithUUID(uuid, reason);
  }

  /*
   * Android explicitly states we reject a call
   * On iOS we just notify of an endCall
   */
  rejectCall = (uuid) => {
    if (!isIOS) {
      RNCallKeepModule.rejectCall(uuid);
    } else {
      RNCallKeepModule.endCall(uuid);
    }
  }

  endCall = (uuid) => {
    RNCallKeepModule.endCall(uuid);
  };

  endAllCalls = () => {
    RNCallKeepModule.endAllCalls();
  };

  supportConnectionService = () => supportConnectionService;

  hasPhoneAccount = async () =>
    isIOS ? true : await RNCallKeepModule.hasPhoneAccount();

  setMutedCall = (uuid, shouldMute) => {
    RNCallKeepModule.setMutedCall(uuid, shouldMute);
  };

  sendDTMF = (uuid, key) => {
    RNCallKeepModule.sendDTMF(uuid, key);
  }

  checkIfBusy = () =>
    isIOS
      ? RNCallKeepModule.checkIfBusy()
      : Promise.reject('RNCallKeep.checkIfBusy was called from unsupported OS');

  checkSpeaker = () =>
    isIOS
      ? RNCallKeepModule.checkSpeaker()
      : Promise.reject('RNCallKeep.checkSpeaker was called from unsupported OS');

  setAvailable = (state) => {
    if (isIOS) {
      return;
    }

    // Tell android that we are able to make outgoing calls
    RNCallKeepModule.setAvailable(state);
  };

  setCurrentCallActive = (callUUID) => {
    if (isIOS) {
      return;
    }

    RNCallKeepModule.setCurrentCallActive(callUUID);
  };

  updateDisplay = (uuid, displayName, uri) => {
    RNCallKeepModule.updateDisplay(uuid, displayName, uri)
  }

  setOnHold = (uuid, shouldHold) => {
    RNCallKeepModule.setOnHold(uuid, shouldHold);
  }

  reportUpdatedCall = (uuid, localizedCallerName) =>
    isIOS
      ? RNCallKeepModule.reportUpdatedCall(uuid, localizedCallerName)
      : Promise.reject('RNCallKeep.reportUpdatedCall was called from unsupported OS');

  _setupIOS = async (options) => new Promise((resolve, reject) => {
    if (!options.appName) {
      reject('RNCallKeep.setup: option "appName" is required');
    }
    if (typeof options.appName !== 'string') {
      reject('RNCallKeep.setup: option "appName" should be of type "string"');
    }

    resolve(RNCallKeepModule.setup(options));
  });

  signalAnswer = (uuid) => {
    RNCallKeepModule.signalAnswer(uuid);
  };

  signalReject = (uuid) => {
    RNCallKeepModule.signalReject(uuid);
  };

  endCall = (uuid) => {
    RNCallKeepModule.endCall(uuid);
  };

  finishRingActivity = () => {
    RNCallKeepModule.finishRingActivity();
  };

  _setupAndroid = async (options) => {
    RNCallKeepModule.setup(options);

    const showAccountAlert = await RNCallKeepModule.checkPhoneAccountPermission(options.additionalPermissions || []);
    const shouldOpenAccounts = await this._alert(options, showAccountAlert);

    if (shouldOpenAccounts) {
      RNCallKeepModule.openPhoneAccounts();
    }
  };

  _hasDefaultPhoneAccount = async (options) => {
    const hasDefault = await RNCallKeepModule.checkDefaultPhoneAccount();
    const shouldOpenAccounts = await this._alert(options, hasDefault);

    if (shouldOpenAccounts) {
      RNCallKeepModule.openPhoneAccountSettings();
    }
  };

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

  backToForeground() {
    if (isIOS) {
      return;
    }

    NativeModules.RNCallKeep.backToForeground();
  }

}

export default new RNCallKeep();
