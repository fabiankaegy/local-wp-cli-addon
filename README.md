# VS Code Terminal Environment Add-on for Local

This Local add-on automatically configures VS Code's integrated terminal with the correct environment variables for your LocalWP site. This allows you to run `php`, `mysql`, `wp`, and `composer` commands directly from VS Code's terminal without any additional setup.

## Features

- **One-click setup**: Adds all necessary environment variables to your project's VS Code settings
- **Automatic path configuration**: Configures PATH to include PHP, MySQL, WP-CLI, and Composer binaries
- **Cross-platform support**: Works on macOS, Windows, and Linux
- **Non-destructive**: Merges with existing VS Code settings without overwriting custom configurations
- **Site-specific**: Uses the correct PHP and MySQL versions configured for each site

## What Gets Configured

The add-on adds the following to your `.vscode/settings.json`:

### Terminal Environment Variables

- `PATH` - Includes LocalWP's PHP, MySQL, WP-CLI, and Composer binaries
- `PHPRC` - Points to the site's PHP configuration
- `MYSQL_HOME` - Points to the site's MySQL configuration
- `WP_CLI_CONFIG_PATH` - WP-CLI configuration path
- `WP_CLI_DISABLE_AUTO_CHECK_UPDATE` - Disables WP-CLI update checks
- `MAGICK_CODER_MODULE_PATH` - ImageMagick modules (if available)
- `DISABLE_AUTO_TITLE` - Prevents terminal title flickering

### Terminal Settings

- `terminal.integrated.cwd` - Sets working directory to `wp-content`
- `terminal.integrated.shellIntegration.enabled` - Enables shell integration

## Usage

1. Open your site in Local
2. Go to the **Add-ons** menu in the Local sidebar, then **Installed**
3. Turn the extension
4. Restart Local
5. Go to a site and then the **Tools** tab
6. Click **"VS Code Terminal"** in the site sidebar
7. Click **"Add Terminal Environment to VS Code"**
8. Open your project in VS Code
9. Open a new terminal - it will automatically have access to PHP, MySQL, WP-CLI, and Composer

**Note:** The site must be running in Local for the commands to work (MySQL socket requires an active connection).

## Installation

### From GitHub Releases

1. Download the latest `local-addon-vscode-terminal.zip` from [Releases](../../releases)
2. Extract the zip file
3. Move the `local-addon-vscode-terminal` folder to your Local add-ons directory:
   - **macOS**: `~/Library/Application Support/Local/addons/`
   - **Windows**: `%APPDATA%\Local\addons\`
   - **Linux**: `~/.config/Local/addons/`
4. Restart Local

## Requirements

- Local 6.5.2 or later
- VS Code or any compatible editor (Cursor, VS Codium, etc.)
- The site must be running in Local for the environment to work correctly

## Development

### Building from source

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the add-on
npm run build

# Watch for changes
npm run watch
```

### Installing locally

1. Build the add-on
2. Copy the folder to your Local add-ons directory:
   - **macOS**: `~/Library/Application Support/Local/addons/`
   - **Windows**: `%APPDATA%\Local\addons\`
   - **Linux**: `~/.config/Local/addons/`
3. Restart Local

## License

MIT

## Credits

Inspired by the [Xdebug + VS Code add-on](https://github.com/nickcernis/local-addon-xdebug-vscode) by Pixel Jar.
