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
