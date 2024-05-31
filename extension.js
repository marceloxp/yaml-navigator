const vscode = require('vscode');
const yaml = require('js-yaml');

// Função para analisar o arquivo YAML e extrair as propriedades
function parseYaml(document) {
    try {
        const yamlContent = document.getText();
        const parsedYaml = yaml.load(yamlContent);
        return extractProperties(parsedYaml);
    } catch (error) {
        console.error('Erro ao analisar o arquivo YAML:', error);
        return [];
    }
}

// Função recursiva para extrair as propriedades do objeto YAML
function extractProperties(obj, prefix = '') {
    const properties = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            properties.push(key);
        }
    }
    return properties;
}

function activate(context) {
    // Criação do ícone na Editor Toolbar
    const yamlMenuIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    yamlMenuIcon.text = '$(file-code) umstudio'; // Ícone a ser exibido
    yamlMenuIcon.tooltip = 'Abrir Menu YAML'; // Tooltip ao passar o mouse sobre o ícone
    yamlMenuIcon.command = 'extension.showYamlMenu'; // Comando a ser executado quando o ícone é clicado
    yamlMenuIcon.show();

    // Registro do ícone para que seja liberado automaticamente quando a extensão for desativada
    context.subscriptions.push(yamlMenuIcon);

    // Registro do ouvinte de eventos para detectar abertura de arquivo YAML
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((document) => {
        // Verifica se o documento aberto é um arquivo YAML
        if (document.languageId === 'yaml' || document.languageId === 'yml') {
            // Mostra o ícone na Editor Toolbar quando um arquivo YAML é aberto
            yamlMenuIcon.show();
        } else {
            // Esconde o ícone na Editor Toolbar quando um arquivo não é YAML
            yamlMenuIcon.hide();
        }
    }));

    // Registro do ouvinte de eventos para detectar o foco no editor de texto e verifica se o mesmo é um YAML
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'yaml' || document.languageId === 'yml') {
                yamlMenuIcon.show();
            } else {
                yamlMenuIcon.hide();
            }
        }
    }));

    // Registro do comando para mostrar o menu YAML
    context.subscriptions.push(vscode.commands.registerCommand('extension.showYamlMenu', () => {
        // Obter o documento atualmente ativo
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            // Analisar o arquivo YAML e extrair as propriedades
            const properties = parseYaml(document);
            // Criar os itens de menu dinamicamente
            const menuItems = properties.map(property => ({
                label: property,
                description: '',
                detail: '',
            }));
            // Mostrar os itens de menu em um QuickPick
            vscode.window.showQuickPick(menuItems).then(selectedItem => {
                if (selectedItem) {
                    vscode.window.showInformationMessage(`Propriedade selecionada: ${selectedItem.label}`);
                }
            });
        } else {
            vscode.window.showErrorMessage('Nenhum editor de texto ativo.');
        }
    }));
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
