"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs-extra"));
/**
 * Get the Local application support directory based on OS
 */
function getLocalAppDataPath() {
    switch (process.platform) {
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'Local');
        case 'win32':
            return path.join(process.env.APPDATA || '', 'Local');
        case 'linux':
            return path.join(os.homedir(), '.config', 'Local');
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}
/**
 * Get the Local.app resources path based on OS
 */
function getLocalAppPath() {
    switch (process.platform) {
        case 'darwin':
            return '/Applications/Local.app/Contents/Resources/extraResources';
        case 'win32':
            return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Local', 'resources', 'extraResources');
        case 'linux':
            return '/opt/Local/resources/extraResources';
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}
/**
 * Get platform-specific binary folder name
 */
function getPlatformBinaryFolder() {
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
    switch (process.platform) {
        case 'darwin':
            return `darwin-${arch}`;
        case 'win32':
            return `win32-${arch}`;
        case 'linux':
            return `linux-${arch}`;
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}
/**
 * Get the terminal environment key based on OS
 */
function getTerminalEnvKey() {
    switch (process.platform) {
        case 'darwin':
            return 'terminal.integrated.env.osx';
        case 'win32':
            return 'terminal.integrated.env.windows';
        case 'linux':
            return 'terminal.integrated.env.linux';
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}
/**
 * Find the lightning service version folder for a given service and version
 */
function findServiceVersion(serviceName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const localAppData = getLocalAppDataPath();
        const servicesPath = path.join(localAppData, 'lightning-services');
        try {
            const entries = yield fs.readdir(servicesPath);
            // Look for folder matching service-version pattern (e.g., php-8.4.4+2, mysql-8.0.35+4)
            const matchingEntry = entries.find(entry => {
                return entry.startsWith(`${serviceName}-${version}`);
            });
            return matchingEntry || null;
        }
        catch (e) {
            console.error(`Error finding service version for ${serviceName}-${version}:`, e);
            return null;
        }
    });
}
/**
 * Adds VS Code terminal environment configuration for the site
 */
function addVSCodeSettings(site) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const localAppData = getLocalAppDataPath();
        const localAppPath = getLocalAppPath();
        const platformBin = getPlatformBinaryFolder();
        const terminalEnvKey = getTerminalEnvKey();
        // Get PHP and MySQL versions from site services
        const phpVersion = (_b = (_a = site.services) === null || _a === void 0 ? void 0 : _a.php) === null || _b === void 0 ? void 0 : _b.version;
        const mysqlVersion = (_d = (_c = site.services) === null || _c === void 0 ? void 0 : _c.mysql) === null || _d === void 0 ? void 0 : _d.version;
        if (!phpVersion) {
            throw new Error('Could not determine PHP version for this site');
        }
        // Find the actual lightning service folders
        const phpServiceFolder = yield findServiceVersion('php', phpVersion);
        const mysqlServiceFolder = mysqlVersion ? yield findServiceVersion('mysql', mysqlVersion) : null;
        if (!phpServiceFolder) {
            throw new Error(`Could not find PHP lightning service for version ${phpVersion}`);
        }
        // Build paths
        const runConfPath = path.join(localAppData, 'run', site.id, 'conf');
        const phpBinPath = path.join(localAppData, 'lightning-services', phpServiceFolder, 'bin', platformBin, 'bin');
        const mysqlBinPath = mysqlServiceFolder
            ? path.join(localAppData, 'lightning-services', mysqlServiceFolder, 'bin', platformBin, 'bin')
            : '';
        const wpCliPath = path.join(localAppPath, 'bin', 'wp-cli', 'posix');
        const composerPath = path.join(localAppPath, 'bin', 'composer', 'posix');
        const imageMagickPath = path.join(localAppData, 'lightning-services', phpServiceFolder, 'bin', platformBin, 'ImageMagick', 'modules-Q16', 'coders');
        // Build PATH variable - MySQL first (if exists), then PHP, then WP-CLI, then Composer, then existing PATH
        const pathParts = [];
        if (mysqlBinPath) {
            pathParts.push(mysqlBinPath);
        }
        pathParts.push(phpBinPath, wpCliPath, composerPath);
        // Use platform-specific PATH variable reference
        const pathVarRef = process.platform === 'win32' ? '${env:Path}' : '${env:PATH}';
        const newPath = pathParts.join(path.delimiter) + path.delimiter + pathVarRef;
        // Build the terminal environment settings
        const terminalEnv = {
            DISABLE_AUTO_TITLE: 'true',
            PHPRC: path.join(runConfPath, 'php'),
            WP_CLI_CONFIG_PATH: path.join(localAppPath, 'bin', 'wp-cli', 'config.yaml'),
            WP_CLI_DISABLE_AUTO_CHECK_UPDATE: '1',
            PATH: newPath,
        };
        // Add MySQL home if MySQL service exists
        if (mysqlVersion) {
            terminalEnv.MYSQL_HOME = path.join(runConfPath, 'mysql');
        }
        // Add ImageMagick path if the directory exists
        try {
            yield fs.access(imageMagickPath);
            terminalEnv.MAGICK_CODER_MODULE_PATH = imageMagickPath;
        }
        catch (_e) {
            // ImageMagick not available, skip
        }
        // Prepare the settings to add/merge
        const newSettings = {
            [terminalEnvKey]: terminalEnv,
            'terminal.integrated.cwd': path.join(site.longPath, 'app', 'public', 'wp-content'),
            'terminal.integrated.shellIntegration.enabled': true,
        };
        // Read existing settings or create new
        const vscodePath = path.join(site.longPath, 'app', 'public', '.vscode');
        const settingsPath = path.join(vscodePath, 'settings.json');
        yield fs.ensureDir(vscodePath);
        let existingSettings = {};
        try {
            const existingContent = yield fs.readFile(settingsPath, 'utf-8');
            existingSettings = JSON.parse(existingContent);
        }
        catch (_f) {
            // File doesn't exist or is invalid JSON, start fresh
        }
        // Merge settings - new settings take precedence for the keys we manage
        const mergedSettings = Object.assign(Object.assign(Object.assign({}, existingSettings), newSettings), { 
            // Deep merge the terminal env if there are existing custom entries
            [terminalEnvKey]: Object.assign(Object.assign({}, (existingSettings[terminalEnvKey] || {})), terminalEnv) });
        // Write the merged settings
        yield fs.writeFile(settingsPath, JSON.stringify(mergedSettings, null, '\t'));
        console.log(`VS Code terminal settings added to ${settingsPath}`);
    });
}
exports.default = addVSCodeSettings;
//# sourceMappingURL=addVSCodeSettings.js.map