import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import * as Local from '@getflywheel/local';

/**
 * Get the Local application support directory based on OS
 */
function getLocalAppDataPath(): string {
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
function getLocalAppPath(): string {
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
function getPlatformBinaryFolder(): string {
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
function getTerminalEnvKey(): string {
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
async function findServiceVersion(serviceName: string, version: string): Promise<string | null> {
	const localAppData = getLocalAppDataPath();
	const servicesPath = path.join(localAppData, 'lightning-services');

	try {
		const entries = await fs.readdir(servicesPath);
		// Look for folder matching service-version pattern (e.g., php-8.4.4+2, mysql-8.0.35+4)
		const matchingEntry = entries.find(entry => {
			return entry.startsWith(`${serviceName}-${version}`);
		});

		return matchingEntry || null;
	} catch (e) {
		console.error(`Error finding service version for ${serviceName}-${version}:`, e);
		return null;
	}
}

/**
 * Adds VS Code terminal environment configuration for the site
 */
export default async function addVSCodeSettings(site: Local.Site): Promise<void> {
	const localAppData = getLocalAppDataPath();
	const localAppPath = getLocalAppPath();
	const platformBin = getPlatformBinaryFolder();
	const terminalEnvKey = getTerminalEnvKey();

	// Get PHP and MySQL versions from site services
	const phpVersion = site.services?.php?.version;
	const mysqlVersion = site.services?.mysql?.version;

	if (!phpVersion) {
		throw new Error('Could not determine PHP version for this site');
	}

	// Find the actual lightning service folders
	const phpServiceFolder = await findServiceVersion('php', phpVersion);
	const mysqlServiceFolder = mysqlVersion ? await findServiceVersion('mysql', mysqlVersion) : null;

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
	const terminalEnv: Record<string, string> = {
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
		await fs.access(imageMagickPath);
		terminalEnv.MAGICK_CODER_MODULE_PATH = imageMagickPath;
	} catch {
		// ImageMagick not available, skip
	}

	// Prepare the settings to add/merge
	const newSettings: Record<string, any> = {
		[terminalEnvKey]: terminalEnv,
		'terminal.integrated.cwd': path.join(site.longPath, 'app', 'public', 'wp-content'),
		'terminal.integrated.shellIntegration.enabled': true,
	};

	// Read existing settings or create new
	const vscodePath = path.join(site.longPath, 'app', 'public', '.vscode');
	const settingsPath = path.join(vscodePath, 'settings.json');

	await fs.ensureDir(vscodePath);

	let existingSettings: Record<string, any> = {};

	try {
		const existingContent = await fs.readFile(settingsPath, 'utf-8');
		existingSettings = JSON.parse(existingContent);
	} catch {
		// File doesn't exist or is invalid JSON, start fresh
	}

	// Merge settings - new settings take precedence for the keys we manage
	const mergedSettings = {
		...existingSettings,
		...newSettings,
		// Deep merge the terminal env if there are existing custom entries
		[terminalEnvKey]: {
			...(existingSettings[terminalEnvKey] || {}),
			...terminalEnv,
		},
	};

	// Write the merged settings
	await fs.writeFile(settingsPath, JSON.stringify(mergedSettings, null, '\t'));

	console.log(`VS Code terminal settings added to ${settingsPath}`);
}
