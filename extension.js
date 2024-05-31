const vscode = require('vscode');
const yaml = require('js-yaml');

// Função para analisar o arquivo YAML e extrair as propriedades com suas posições
function parseYamlWithPositions(document) {
    const yamlContent = document.getText();
    const lines = yamlContent.split(/\r?\n/);
    const symbols = [];
    const indentPattern = /^\s*/;

    lines.forEach((line, index) => {
        const indentMatch = line.match(indentPattern);
        const indent = indentMatch ? indentMatch[0].length : 0;
        const trimmedLine = line.trim();

        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const match = trimmedLine.match(/^([^:]+):/);
            if (match && indent === 0) {  // Considera apenas propriedades de primeiro nível
                const key = match[1].trim();
                const start = new vscode.Position(index, 0);

                // Encontrar o final do bloco atual
                let endLine = index;
                for (let i = index + 1; i < lines.length; i++) {
                    const nextLine = lines[i].trim();
                    const nextIndentMatch = lines[i].match(indentPattern);
                    const nextIndent = nextIndentMatch ? nextIndentMatch[0].length : 0;

                    if (nextLine && !nextLine.startsWith('#') && nextIndent === 0) {
                        endLine = i - 1;
                        break;
                    }
                    endLine = i;
                }

                const end = new vscode.Position(endLine, lines[endLine].length);
                const range = new vscode.Range(start, end);

                symbols.push({
                    name: key,
                    kind: vscode.SymbolKind.Field,
                    location: new vscode.Location(document.uri, range),
                    containerName: ''
                });
            }
        }
    });

    return symbols;
}

// Provedor de símbolos para arquivos YAML
class YamlDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        return parseYamlWithPositions(document).map(symbol => new vscode.SymbolInformation(
            symbol.name,
            symbol.kind,
            symbol.containerName,
            symbol.location
        ));
    }
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
            const properties = parseYamlWithPositions(document).map(symbol => symbol.name);
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

    // Registro do provedor de símbolos para arquivos YAML
    const yamlDocumentSymbolProvider = new YamlDocumentSymbolProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { language: 'yaml' },
            yamlDocumentSymbolProvider
        )
    );
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
