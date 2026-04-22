"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveExtApiProvider = exports.buildUniExtApis = exports.uniUTSUniModulesPlugin = exports.utsPlugins = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uni_shared_1 = require("@dcloudio/uni-shared");
const uts_1 = require("../../../uts");
const utils_1 = require("../../utils");
const uni_modules_1 = require("../../../uni_modules");
const UTSProxyRE = /\?uts-proxy$/;
function isUTSProxy(id) {
    return UTSProxyRE.test(id);
}
const utsModuleCaches = new Map();
exports.utsPlugins = new Set();
let uniExtApiCompiler = async () => { };
function uniUTSUniModulesPlugin(options = {}) {
    process.env.UNI_UTS_USING_ROLLUP = 'true';
    const compilePlugin = async (pluginDir) => {
        exports.utsPlugins.add(path_1.default.basename(pluginDir));
        const pkgJson = require(path_1.default.join(pluginDir, 'package.json'));
        const extApiProvider = resolveExtApiProvider(pkgJson);
        // 如果是 provider 扩展，需要判断 provider 的宿主插件是否在本地，在的话，自动导入该宿主插件包名
        let uniExtApiProviderServicePlugin = '';
        if (extApiProvider?.servicePlugin) {
            if (fs_1.default.existsSync(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'uni_modules', extApiProvider.servicePlugin))) {
                uniExtApiProviderServicePlugin = extApiProvider.servicePlugin;
            }
        }
        const compiler = (0, uts_1.resolveUTSCompiler)();
        // 处理依赖的 uts 插件
        const deps = (0, uni_modules_1.parseUTSModuleDeps)(pkgJson.uni_modules?.dependencies || [], process.env.UNI_INPUT_DIR);
        if (deps.length) {
            for (const dep of deps) {
                await compilePlugin(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'uni_modules', dep));
            }
        }
        return compiler.compile(pluginDir, {
            isX: !!options.x,
            isSingleThread: !!options.isSingleThread,
            isPlugin: true,
            extApis: options.extApis,
            sourceMap: process.env.NODE_ENV === 'development',
            uni_modules: deps,
            transform: {
                uniExtApiProviderName: extApiProvider?.name,
                uniExtApiProviderService: extApiProvider?.service,
                uniExtApiProviderServicePlugin,
            },
        });
    };
    uniExtApiCompiler = async () => {
        // 获取 provider 扩展(编译所有uni)
        const plugins = (0, uni_modules_1.getUniExtApiPlugins)().filter((provider) => !exports.utsPlugins.has(provider.plugin));
        for (const plugin of plugins) {
            const result = await compilePlugin(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'uni_modules', plugin.plugin));
            if (result) {
                // 时机不对，不能addWatch
                // result.deps.forEach((dep) => {
                //   this.addWatchFile(dep)
                // })
            }
        }
    };
    return {
        name: 'uni:uts-uni_modules',
        apply: 'build',
        enforce: 'pre',
        resolveId(id, importer) {
            if (isUTSProxy(id)) {
                return id;
            }
            const module = (0, uts_1.resolveUTSAppModule)(id, importer ? path_1.default.dirname(importer) : process.env.UNI_INPUT_DIR, options.x !== true);
            if (module) {
                // app-js 会直接返回 index.uts 路径，不需要 uts-proxy
                if (module.endsWith('.uts')) {
                    return module;
                }
                // prefix the polyfill id with \0 to tell other plugins not to try to load or transform it
                return module + '?uts-proxy';
            }
        },
        load(id) {
            if (isUTSProxy(id)) {
                return '';
            }
        },
        buildEnd() {
            utsModuleCaches.clear();
        },
        async transform(_, id, opts) {
            if (opts && opts.ssr) {
                return;
            }
            if (!isUTSProxy(id)) {
                return;
            }
            const { filename: pluginDir } = (0, utils_1.parseVueRequest)(id.replace('\0', ''));
            // 当 vue 和 nvue 均引用了相同 uts 插件，解决两套编译器会编译两次 uts 插件的问题
            // 通过缓存，保证同一个 uts 插件只编译一次
            if (utsModuleCaches.get(pluginDir)) {
                return utsModuleCaches.get(pluginDir)().then((result) => {
                    if (result) {
                        result.deps.forEach((dep) => {
                            this.addWatchFile(dep);
                        });
                        return {
                            code: result.code,
                            map: null,
                            syntheticNamedExports: result.encrypt,
                            meta: result.meta,
                        };
                    }
                });
            }
            const compile = (0, uni_shared_1.once)(() => {
                return compilePlugin(pluginDir);
            });
            utsModuleCaches.set(pluginDir, compile);
            const result = await compile();
            if (result) {
                result.deps.forEach((dep) => {
                    this.addWatchFile(dep);
                });
                return {
                    code: result.code,
                    map: null,
                    syntheticNamedExports: result.encrypt,
                    meta: result.meta,
                };
            }
        },
        async generateBundle() { },
    };
}
exports.uniUTSUniModulesPlugin = uniUTSUniModulesPlugin;
async function buildUniExtApis() {
    await uniExtApiCompiler();
}
exports.buildUniExtApis = buildUniExtApis;
function resolveExtApiProvider(pkg) {
    const provider = pkg.uni_modules?.['uni-ext-api']?.provider;
    if (provider?.service) {
        if (provider.name && !provider.servicePlugin) {
            provider.servicePlugin = 'uni-' + provider.service;
        }
        return provider;
    }
}
exports.resolveExtApiProvider = resolveExtApiProvider;
