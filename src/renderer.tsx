import React from 'react';
import { TextButton, TableListRow } from '@getflywheel/local-components';
import { AddonRendererContext } from '@getflywheel/local/renderer';

export default function (context: AddonRendererContext) {
	const { hooks, electron } = context;

	hooks.addContent('siteInfoUtilities', (site) => {
		return (
			<TableListRow key="vscode-terminal-integration" label="VS Code Terminal">
				<TextButton
					style={{ paddingLeft: 0 }}
					onClick={(event) => {
						electron.ipcRenderer.send('add-vscode-terminal-config', site.id);
						event.target.setAttribute('disabled', 'true');
					}}
				>
					Add Terminal Environment to VS Code
				</TextButton>

				<p>
					<small>
						Configures VS Code terminal with PHP, MySQL, WP-CLI, and Composer paths.
						The configuration will be added to .vscode/settings.json in the site's app/public directory.
					</small>
				</p>
			</TableListRow>
		);
	});
}
