"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAppXUniConfig = void 0;
const uniConfig_1 = require("../app/pages/uniConfig");
function normalizeAppXUniConfig(pagesJson, manifestJson) {
    const config = {
        pages: [],
        globalStyle: pagesJson.globalStyle,
        appname: manifestJson.name || '',
        compilerVersion: process.env.UNI_COMPILER_VERSION,
        ...(0, uniConfig_1.parseEntryPagePath)(pagesJson),
        tabBar: pagesJson.tabBar,
        fallbackLocale: manifestJson.fallbackLocale,
    };
    if (config.realEntryPagePath) {
        config.conditionUrl = config.entryPagePath;
        config.entryPagePath = config.realEntryPagePath;
    }
    // TODO 待支持分包
    return JSON.stringify(config);
}
exports.normalizeAppXUniConfig = normalizeAppXUniConfig;
