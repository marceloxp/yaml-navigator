const vscode = require('vscode');

function parseKeyLine(line, lineIndex) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
        return null;
    }

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch[1].length;

    let rest = trimmed;
    let isListItem = false;
    if (rest.startsWith('- ')) {
        isListItem = true;
        rest = rest.slice(2).trim();
    }

    let key;
    let keyStartInLine;

    if (rest.startsWith('"') || rest.startsWith("'")) {
        const quote = rest[0];
        const endQuote = rest.indexOf(quote, 1);
        if (endQuote > 0 && rest[endQuote + 1] === ':') {
            key = rest.slice(1, endQuote);
            keyStartInLine = line.indexOf(quote);
        }
    } else {
        const match = rest.match(/^([^:]+):/);
        if (!match) {
            return null;
        }
        key = match[1].trim();
        keyStartInLine = line.indexOf(key);
    }

    if (!key || keyStartInLine < 0) {
        return null;
    }

    return {
        indent,
        key,
        lineIndex,
        keyStartInLine,
        keyEndInLine: keyStartInLine + key.length,
        isListItem
    };
}

function findBlockEnd(lines, startIndex, blockIndent) {
    let endLine = startIndex;

    for (let i = startIndex + 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed || trimmed.startsWith('#')) {
            endLine = i;
            continue;
        }

        const indent = lines[i].match(/^(\s*)/)[1].length;
        if (indent <= blockIndent) {
            endLine = i - 1;
            break;
        }
        endLine = i;
    }

    return endLine;
}

function parseYamlWithPositions(document, token) {
    const lines = document.getText().split(/\r?\n/);
    const entries = [];

    for (let index = 0; index < lines.length; index++) {
        if (token?.isCancellationRequested) {
            return [];
        }

        const parsed = parseKeyLine(lines[index], index);
        if (parsed) {
            entries.push(parsed);
        }
    }

    const root = [];
    const stack = [{ indent: -1, children: root }];

    for (const entry of entries) {
        if (token?.isCancellationRequested) {
            return [];
        }

        while (stack.length > 1 && stack[stack.length - 1].indent >= entry.indent) {
            stack.pop();
        }

        const endLine = findBlockEnd(lines, entry.lineIndex, entry.indent);
        const range = new vscode.Range(
            new vscode.Position(entry.lineIndex, 0),
            new vscode.Position(endLine, lines[endLine].length)
        );
        const selectionRange = new vscode.Range(
            entry.lineIndex,
            entry.keyStartInLine,
            entry.lineIndex,
            entry.keyEndInLine
        );

        const symbol = new vscode.DocumentSymbol(
            entry.key,
            entry.isListItem ? 'list item' : '',
            vscode.SymbolKind.Field,
            range,
            selectionRange
        );
        symbol.children = [];

        stack[stack.length - 1].children.push(symbol);
        stack.push({ indent: entry.indent, children: symbol.children });
    }

    return root;
}

class YamlDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        return parseYamlWithPositions(document, token);
    }
}

function activate(context) {
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
