# React Native CallKeep

[![npm version](https://badge.fury.io/js/react-native-callkeep.svg)](https://badge.fury.io/js/react-native-callkeep)
[![npm downloads](https://img.shields.io/npm/dm/react-native-callkeep.svg?maxAge=2592000)](https://img.shields.io/npm/dm/react-native-callkeep.svg?maxAge=2592000)

**React Native CallKeep** utilises a brand new iOS 10 framework **CallKit** to make the life easier for VoIP developers using React Native.

For more information about **CallKit** on iOS, please see [Official CallKit Framework Document](https://developer.apple.com/reference/callkit?language=objc) or [Introduction to CallKit by Xamarin](https://developer.xamarin.com/guides/ios/platform_features/introduction-to-ios10/callkit/)

# Demo

A demo of `react-native-callkeep` is available in the [wazo-react-native-demo](https://github.com/wazo-pbx/wazo-react-native-demo) repository.

## iOS
![Connection Service](docs/pictures/call-kit.png)

# Installation

```sh
npm install --save react-native-callkeep
# or
yarn add react-native-callkeep
```

- [iOS](docs/ios-installation.md)

# Usage

## Setup

```js
import RNCallKeep from 'react-native-callkeep';

const options = {
  ios: {
    appName: 'My app name',
  },
};

RNCallKeep.setup(options).then(accepted => {});
```

- `options`: Object
  - `ios`: object
    - `appName`: string (required)
      It will be displayed on system UI when incoming calls received
    - `imageName`: string (optional)
      If provided, it will be displayed on system UI during the call
    - `ringtoneSound`: string (optional)
      If provided, it will be played when incoming calls received; the system will use the default ringtone if this is not provided
    - `includesCallsInRecents`: boolean (optional)
      If provided, calls will be shown in the recent calls when true and not when false (ios 11 and above)
    - `maximumCallGroups`: string (optional)
      If provided, the maximum number of call groups supported by this application (Default: 3)
    - `maximumCallsPerCallGroup`: string (optional)
      If provided, the maximum number of calls in a single group, used for conferencing (Default: 1, no conferencing)
    - `supportsVideo`: boolean (optional)
      If provided, whether or not the application supports video calling (Default: true)
## Constants

To make passing the right integer into methods easier, there are constants that are exported from the module.

```
const CONSTANTS = {
  END_CALL_REASONS: {
    FAILED: 1,
    REMOTE_ENDED: 2,
    UNANSWERED: 3,
    ANSWERED_ELSEWHERE: 4,
    DECLINED_ELSEWHERE: 5,
    MISSED: 6
  }
};

const { CONSTANTS as CK_CONSTANTS, RNCallKeep } from 'react-native-callkeep';

console.log(CK_CONSTANTS.END_CALL_REASONS.FAILED) // outputs 1
```

## Methods

### isCallActive
Returns true if the UUID passed matches an existing and answered call.
This will return true ONLY if the call exists and the user has already answered the call. It will return false
if the call does not exist or has not been answered. This is exposed to both React Native and Native sides.
This was exposed so a call can be canceled if ringing and the user answered on a different device.

```js
RNCallKeep.isCallActive(uuid);
```

- `uuid`: string
  - The `uuid` used for `startCall` or `displayIncomingCall`


### displayIncomingCall

Display system UI for incoming calls

````js
RNCallKeep.displayIncomingCall(uuid, handle, localizedCallerName);
````

- `uuid`: string
  - An `uuid` that should be stored and re-used for `stopCall`.
- `handle`: string
  - Phone number of the caller
- `localizedCallerName`: string (optional)
  - Name of the caller to be displayed on the native UI
- `handleType`: string (optional, iOS only)
  - `generic`
  - `number` (default)
  - `email`
- `hasVideo`: boolean (optional, iOS only)
  - `false` (default)
  - `true` (you know... when not false)


### startCall
iOS:
```js
RNCallKeep.startCall(uuid, handle, contactIdentifier, handleType, hasVideo);
```

- `uuid`: string
  - An `uuid` that should be stored and re-used for `stopCall`.
- `handle`: string
  - Phone number of the callee
- `contactIdentifier`: string
  - The identifier is displayed in the native call UI, and is typically the name of the call recipient.
- `handleType`: string (optional, iOS only)
  - `generic`
  - `number` (default)
  - `email`
- `hasVideo`: boolean (optional, iOS only)
  - `false` (default)
  - `true` (you know... when not false)


### updateDisplay
Use this to update the display after an outgoing call has started.

```js
RNCallKeep.updateDisplay(uuid, displayName, handle)
```
- `uuid`: string
  - The `uuid` used for `startCall` or `displayIncomingCall`
- `displayName`: string (optional)
  - Name of the caller to be displayed on the native UI
- `handle`: string
  - Phone number of the caller

### endCall

When finish an incoming/outgoing call.
(When user actively chooses to end the call from your app's UI.)

```js
RNCallKeep.endCall(uuid);
```

- `uuid`: string
  - The `uuid` used for `startCall` or `displayIncomingCall`

### endAllCalls

End all ongoing calls.

```js
RNCallKeep.endAllCalls();
```

### rejectCall

When you reject an incoming call.

```js
RNCallKeep.rejectCall(uuid);
```

- `uuid`: string
  - The `uuid` used for `startCall` or `displayIncomingCall`

### reportEndCallWithUUID

Report that the call ended without the user initiating.
(Not ended by user, is usually due to the following reasons)


```js
RNCallKeep.reportEndCallWithUUID(uuid, reason);
```

- `uuid`: string
  - The `uuid` used for `startCall` or `displayIncomingCall`
- `reason`: int
  - Reason for the end call
    - Call failed: 1
    - Remote user ended call: 2
    - Remote user did not answer: 3
    - Call Answered elsewhere: 4
    - Call declined elsewhere: 5
    - Missed: 6 (on iOS this will map to remote user ended call)
  - Access reasons as constants
  ```js
  const { CONSTANTS as CK_CONSTANTS, RNCallKeep } from 'react-native-callkeep';

  RNCallKeep.reportEndCallWithUUID(uuid, CK_CONSTANTS.END_CALL_REASONS.FAILED);
  ```

### setMutedCall

Switch the mic on/off.

```js
RNCallKeep.setMutedCall(uuid, true);
```

- `uuid`: string
  - uuid of the current call.
- `muted`: boolean

### setOnHold

Set a call on/off hold.

```js
RNCallKeep.setOnHold(uuid, true)
```

- `uuid`: string
  - uuid of the current call.
- `hold`: boolean

### checkIfBusy

Checks if there are any active calls on the device and returns a promise with a boolean value (`true` if there're active calls, `false` otherwise).

```js
RNCallKeep.checkIfBusy();
```

### checkSpeaker

Checks if the device speaker is on and returns a promise with a boolean value (`true` if speaker is on, `false` otherwise).

```js
RNCallKeep.checkSpeaker();
```

## Events

### didReceiveStartCallAction

Device sends this event once it decides the app is allowed to start a call, either from the built-in phone screens (iOS/_Recents_),
or by the app calling `RNCallKeep.startCall`.

Try to start your app call action from here (e.g. get credentials of the user by `data.handle` and/or send INVITE to your SIP server)

Note: on iOS `callUUID` is not defined as the call is not yet managed by CallKit. You have to generate your own and call `startCall`.

```js
RNCallKeep.addEventListener('didReceiveStartCallAction', ({ handle, callUUID, name }) => {

});
```

- `handle` (string)
  - Phone number of the callee
- `callUUID` (string)
  - The UUID of the call that is to be answered
- `name` (string)
  - Name of the callee

### - answerCall

User answer the incoming call

```js
RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
  // Do your normal `Answering` actions here.
});
```

- `callUUID` (string)
  - The UUID of the call that is to be answered.

### - endCall

User finish the call.

```js
RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
  // Do your normal `Hang Up` actions here
});
```

- `callUUID` (string)
  - The UUID of the call that is to be ended.

### - didActivateAudioSession

The `AudioSession` has been activated by **RNCallKeep**.

```js
RNCallKeep.addEventListener('didActivateAudioSession', () => {
  // you might want to do following things when receiving this event:
  // - Start playing ringback if it is an outgoing call
});
```

### - didDisplayIncomingCall

Callback for `RNCallKeep.displayIncomingCall`

```js
RNCallKeep.addEventListener('didDisplayIncomingCall', ({ error, callUUID, handle, localizedCallerName, hasVideo, fromPushKit, payload }) => {
  // you might want to do following things when receiving this event:
  // - Start playing ringback if it is an outgoing call
});
```

- `error` (string)
  - iOS only.
- `callUUID` (string)
  - The UUID of the call.
- `handle` (string)
  - Phone number of the caller
- `localizedCallerName` (string)
  - Name of the caller to be displayed on the native UI
- `hasVideo` (string)
  - `1` (video enabled)
  - `0` (video not enabled)
- `fromPushKit` (string)
  - `1` (call triggered from PushKit)
  - `0` (call not triggered from PushKit)
- `payload` (object)
  - VOIP push payload.

### - didPerformSetMutedCallAction

A call was muted by the system or the user:

```js
RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {

});
```

- `muted` (boolean)
- `callUUID` (string)
  - The UUID of the call.

### - didToggleHoldCallAction

A call was held or unheld by the current user

```js
RNCallKeep.addEventListener('didToggleHoldCallAction', ({ hold, callUUID }) => {

});
```

- `hold` (boolean)
- `callUUID` (string)
  - The UUID of the call.

### - didPerformDTMFAction

Used type a number on his dialer

```js
RNCallKeep.addEventListener('didPerformDTMFAction', ({ digits, callUUID }) => {

});
```

- `digits` (string)
  - The digits that emit the dtmf tone
- `callUUID` (string)
  - The UUID of the call.

### - didLoadWithEvents

Called as soon as JS context initializes if there were some actions performed by user before JS context has been created.

Since iOS 13, you must display incoming call on receiving PushKit push notification. But if app was killed, it takes some time to create JS context. If user answers the call (or ends it) before JS context has been initialized, user actions will be passed as events array of this event. Similar situation can happen if user would like to start a call from Recents or similar iOS app, assuming that your app was in killed state.

```js
RNCallKeep.addEventListener('didLoadWithEvents', (events) => {
  // see example usage in https://github.com/react-native-webrtc/react-native-callkeep/pull/169
});
```

- `events` Array
  - `name`: string
    Native event name like: `RNCallKeepPerformAnswerCallAction`
  - `data`: object
    Object with data passed together with specific event so it can be handled in the same way like original event, for example `({ callUUID })` for `answerCall` event if `name` is `RNCallKeepPerformAnswerCallAction`

### - checkReachability

```js
RNCallKeep.addEventListener('checkReachability', () => {
  RNCallKeep.setReachable();
});

```
### removeEventListener

Allows to remove the listener on an event.

```js
RNCallKeep.removeEventListener('checkReachability');
```

## Example

A full example is available in the [example](https://github.com/react-native-webrtc/react-native-callkeep/tree/master/example) folder.

```javascript
import React from 'react';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'uuid';

class RNCallKeepExample extends React.Component {
  constructor(props) {
    super(props);

    this.currentCallId = null;

    // Add RNCallKeep Events
    RNCallKeep.addEventListener('didReceiveStartCallAction', this.didReceiveStartCallAction);
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    RNCallKeep.addEventListener('didDisplayIncomingCall', this.onIncomingCallDisplayed);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    RNCallKeep.addEventListener('didToggleHoldCallAction', this.onToggleHold);
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onDTMFAction);
    RNCallKeep.addEventListener('didActivateAudioSession', this.audioSessionActivated);
  }

  // Initialise RNCallKeep
  setup = () => {
    const options = {
      ios: {
        appName: 'ReactNativeWazoDemo',
        imageName: 'sim_icon',
        supportsVideo: false,
        maximumCallGroups: '1',
        maximumCallsPerCallGroup: '1'
      },
    };

    try {
      RNCallKeep.setup(options);
    } catch (err) {
      console.error('initializeCallKeep error:', err.message);
    }
  }

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  startCall = ({ handle, localizedCallerName }) => {
    // Your normal start call action
    RNCallKeep.startCall(this.getCurrentCallId(), handle, localizedCallerName);
  };

  reportEndCallWithUUID = (callUUID, reason) => {
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  // Event Listener Callbacks

  didReceiveStartCallAction(data) => {
    let { handle, callUUID, name } = data;
    // Get this event after the system decides you can start a call
    // You can now start a call from within your app
  };

  onAnswerCallAction = (data) => {
    let { callUUID } = data;
    // Called when the user answers an incoming call
  };

  onEndCallAction = (data) => {
    let { callUUID } = data;
    RNCallKeep.endCall(this.getCurrentCallId());

    this.currentCallId = null;
  };

  onIncomingCallDisplayed = (data) => {
    let { error } = data;
    // You will get this event after RNCallKeep finishes showing incoming call UI
    // You can check if there was an error while displaying
  };

  onToggleMute = (data) => {
    let { muted, callUUID } = data;
    // Called when the system or user mutes a call
  };

  onToggleHold = (data) => {
    let { hold, callUUID } = data;
    // Called when the system or user holds a call
  };

  onDTMFAction = (data) => {
    let { digits, callUUID } = data;
    // Called when the system or user performs a DTMF action
  };

  audioSessionActivated = (data) => {
    // you might want to do following things when receiving this event:
    // - Start playing ringback if it is an outgoing call
  };

  getCurrentCallId = () => {
    if (!this.currentCallId) {
      this.currentCallId = uuid.v4();
    }

    return this.currentCallId;
  };

  render() {
  }
}
```

## Receiving a call when the application is not reachable.

In some case your application can be unreachable :
- when the user kill the application
- when it's in background since a long time (eg: after ~5mn the os will kill all connections).

To be able to wake up your application to display the incoming call, you can use [https://github.com/ianlin/react-native-voip-push-notification](react-native-voip-push-notification) on iOS

You have to send a push to your application, like with a library supporting PushKit pushes for iOS.

### PushKit

Since iOS 13, you'll have to report the incoming calls that wakes up your application with a VoIP push. Add this in your `AppDelegate.m` if you're using VoIP pushes to wake up your application :

```objective-c
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // Process the received push
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  // Retrieve information like handle and callerName here
  // NSString *uuid = /* fetch for payload or ... */ [[[NSUUID UUID] UUIDString] lowercaseString];
  // NSString *callerName = @"caller name here";
  // NSString *handle = @"caller number here";
  // NSDictionary *extra = [payload.dictionaryPayload valueForKeyPath:@"custom.path.to.data"]; /* use this to pass any special data (ie. from your notification) down to RN. Can also be `nil` */

  [RNCallKeep reportNewIncomingCall:uuid handle:handle handleType:@"generic" hasVideo:false localizedCallerName:callerName fromPushKit: YES payload:extra withCompletionHandler:completion];
}
```

## Debug


## Troubleshooting
- Ensure that you construct a valid `uuid` by importing the `uuid` library and running `uuid.v4()` as shown in the examples. If you don't do this and use a custom string, the incoming call screen will never be shown on iOS.

## Contributing

Any pull request, issue report and suggestion are highly welcome!

## License

This work is dual-licensed under ISC and MIT.
Previous work done by @ianlin on iOS is on ISC Licence.
We choose MIT for the rest of the project.

`SPDX-License-Identifier: ISC OR MIT`
