/// <reference path="slimcore.d.ts" />
"use strict";
const version = require("./version");
const events_1 = require("events");
const native = module.require('../bin/slimcore.node');
function isMatch(value, pattern) {
    // tslint:disable-next-line:no-for-in
    for (const key in pattern) {
        if (!pattern.hasOwnProperty(key)) {
            continue;
        }
        if (value[key] !== pattern[key]) {
            return false;
        }
    }
    return true;
}
function makeFilteredListener(listener, filter) {
    return (args) => {
        if (isMatch(args, filter)) {
            listener(args);
        }
    };
}
class EventEmitterEx extends events_1.EventEmitter {
    handle(event, filter, listener) {
        const callback = filter ? makeFilteredListener(listener, filter) : listener;
        this.addListener(event, callback);
        return {
            dispose: () => {
                this.removeListener(event, callback);
            },
        };
    }
}
// version
exports.getVersion = version.getVersion;
exports.getApiVersion = version.getApiVersion;
// slimcore
exports.createSlimCoreInstance = native.createSlimCoreInstance;
exports.createChromiumFrameSink = native.createChromiumFrameSink;
exports.getInstanceCounts = native.getInstanceCounts;
exports.queryDeviceRotation = native.queryDeviceRotation;
exports.getAuthorizationStatus = native.getAuthorizationStatus;
exports.requestAuthorization = native.requestAuthorization;
const classes = [
    native.SlimCore,
    native.Setup,
    native.Account,
    native.CallHandler,
    native.VideoBinding,
    native.VideoBindingRenderer,
    native.VideoBindingScreenShare,
    native.FrameSink,
    native.ChromiumFrameSink,
    native.ContentSharing,
    native.DataChannel,
    native.DataSource,
    native.DataSink,
    native.Trouter,
    native.TrouterListener,
    native.TrouterRequest,
    native.TrouterResponse,
    native.Ndi,
];
for (const cls of classes) {
    if (Object.getPrototypeOf(cls.prototype) === events_1.EventEmitter.prototype) {
        Object.setPrototypeOf(cls.prototype, EventEmitterEx.prototype);
    }
    exports[cls.name] = cls;
}
Object.defineProperty(exports, 'Enums', {
    configurable: true,
    enumerable: true,
    get: () => native.Enums,
    set: (value) => { native.Enums = value; },
});
// CallHandler.prototype.getProperties
function invoke(expr, fallback) {
    try {
        return expr();
    }
    catch (error) {
        return fallback;
    }
}
// tslint:disable-next-line:max-line-length
function getProperties(object, objectId, strProperties, intProperties) {
    const result = {};
    markObjectSimple(result);
    for (const [key, item] of Object.entries(strProperties)) {
        result[key] = invoke(() => object.getStrProperty(item.objectId || objectId, item.propKey), item.fallback);
    }
    for (const [key, item] of Object.entries(intProperties)) {
        result[key] = invoke(() => object.getIntProperty(item.objectId || objectId, item.propKey), item.fallback);
    }
    return result;
}
// tslint:disable-next-line:max-line-length
native.CallHandler.prototype.getProperties = function (objectId, strProperties, intProperties) {
    // tslint:disable-next-line:no-invalid-this
    return getProperties(this, objectId, strProperties, intProperties);
};
// tslint:disable-next-line:max-line-length
native.SlimCore.prototype.getProperties = function (objectId, strProperties, intProperties) {
    // tslint:disable-next-line:no-invalid-this
    return getProperties(this, objectId, strProperties, intProperties);
};
function markObjectSimple(object) {
    native._setHiddenProperty(object, 'simple', true);
}
function setAnnotations(func, annotations) {
    if (annotations.returnType !== undefined) {
        native._setHiddenProperty(func, 'returnType', annotations.returnType);
    }
    if (annotations.simpleArgs !== undefined) {
        native._setHiddenProperty(func, 'simpleArgs', annotations.simpleArgs);
    }
}
function makePropertyConstant(object, name) {
    const { get } = Object.getOwnPropertyDescriptor(object, name);
    setAnnotations(get, { returnType: 'constant' });
}
// globals
setAnnotations(exports.getVersion, { returnType: 'constant' });
setAnnotations(exports.getApiVersion, { returnType: 'constant' });
makePropertyConstant(exports, 'Enums');
// SlimCore
setAnnotations(native.SlimCore.prototype.getBuildName, { returnType: 'constant' });
setAnnotations(native.SlimCore.prototype.getBuildVersion, { returnType: 'constant' });
setAnnotations(native.SlimCore.prototype.getMonitorSnapshot, { returnType: 'promise' });
setAnnotations(native.SlimCore.prototype.getWindowSnapshot, { returnType: 'promise' });
setAnnotations(native.SlimCore.prototype.getWindowIcon, { returnType: 'promise' });
setAnnotations(native.SlimCore.prototype.videoCreateBinding, { returnType: 'promise' });
setAnnotations(native.SlimCore.prototype.videoReleaseBinding, { returnType: 'promise' });
// CallHandler
setAnnotations(native.CallHandler.prototype.getProperties, { simpleArgs: true });
// VideoBindingRenderer
setAnnotations(native.VideoBindingRenderer.prototype.captureFrame, { returnType: 'promise' });
// FrameSink
setAnnotations(native.FrameSink.prototype.log, { returnType: 'void' });
