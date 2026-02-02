import * as Local from '@getflywheel/local';
import * as LocalMain from '@getflywheel/local/main';
import addVSCodeSettings from './helpers/addVSCodeSettings';

export default function (context: LocalMain.AddonMainContext) {
	const { notifier, electron } = context;

	electron.ipcMain.on('add-vscode-terminal-config', async (event, siteId: Local.Site['id']) => {
		const site = LocalMain.SiteData.getSite(siteId);

		try {
			await addVSCodeSettings(site);

			notifier.notify({
				title: 'VS Code Terminal Environment',
				message: `Terminal environment variables have been added to VS Code settings.`,
				open: undefined,
			});
		} catch (e) {
			notifier.notify({
				title: 'VS Code Terminal Error',
				message: `Unable to add terminal environment configuration.`,
				open: undefined,
			});

			electron.dialog.showErrorBox('VS Code Terminal Error', e.stack);
		}
	});
}
