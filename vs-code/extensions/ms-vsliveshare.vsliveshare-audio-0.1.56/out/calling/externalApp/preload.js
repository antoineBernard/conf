"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appEvents_1 = require("./appEvents");
const jsonRpc_1 = require("./jsonRpc");
const proxyTraceSource_1 = require("./proxyTraceSource");
console.log(`[Preload] pid: ${process.pid}`);
const { remote } = require('electron');
const slimCore = module.require('slimcore-3.0');
const videoRenderer = module.require('slimcore-3.0/lib/video-renderer');
const controlInjector = module.require('slimcore-3.0/lib/sharing-indicator');
console.log(`[Preload] videoRenderer: ${videoRenderer}`);
console.log(`[Preload] controlInjector: ${controlInjector}`);
window.SlimCore = slimCore;
window.Enums = slimCore.Enums;
window.VideoRenderer = videoRenderer;
window.ControlInjector = controlInjector;
if (!remote.process.argv || !remote.process.argv.length || remote.process.argv.length < 3) {
    throw new Error('[Preload] no pipe name specified');
}
const ipcPipeName = remote.process.argv[2];
console.log(`[Preload] JsonRPC IPC PipeName: ${ipcPipeName}`);
const jsonRPCProxy = new jsonRpc_1.JsonRPC(ipcPipeName, proxyTraceSource_1.proxyTraceSource);
const appEvents = new appEvents_1.AppEvents(jsonRPCProxy);
window.appEvents = appEvents;
console.log(`[Preload] Completed`);
//# sourceMappingURL=preload.js.map