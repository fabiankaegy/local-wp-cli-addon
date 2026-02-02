"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const local_components_1 = require("@getflywheel/local-components");
function default_1(context) {
    const { hooks, electron } = context;
    hooks.addContent('siteInfoUtilities', (site) => {
        return (react_1.default.createElement(local_components_1.TableListRow, { key: "vscode-terminal-integration", label: "VS Code Terminal" },
            react_1.default.createElement(local_components_1.TextButton, { style: { paddingLeft: 0 }, onClick: (event) => {
                    electron.ipcRenderer.send('add-vscode-terminal-config', site.id);
                    event.target.setAttribute('disabled', 'true');
                } }, "Add Terminal Environment to VS Code"),
            react_1.default.createElement("p", null,
                react_1.default.createElement("small", null, "Configures VS Code terminal with PHP, MySQL, WP-CLI, and Composer paths. The configuration will be added to .vscode/settings.json in the site's app/public directory."))));
    });
}
exports.default = default_1;
//# sourceMappingURL=renderer.js.map