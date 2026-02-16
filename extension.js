// VS Code Extension - Agent Workflow Builder
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Agent Workflow Builder extension activated');

    // Register the command
    const command = vscode.commands.registerCommand('workflowBuilder.open', () => {
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel(
            'workflowBuilder',
            'Agent Workflow Builder',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        // Set the HTML content
        panel.webview.html = getWebviewContent();
    });

    context.subscriptions.push(command);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Workflow Builder</title>
    <style>
        :root {
            --bg-primary: #0D0D12;
            --bg-secondary: #16161D;
            --bg-tertiary: #1E1E28;
            --accent-primary: #00D4AA;
            --accent-secondary: #7B61FF;
            --accent-tertiary: #FF6B4A;
            --accent-quaternary: #FFD93D;
            --text-primary: #F4F4F6;
            --text-secondary: #8B8B9A;
            --border: #2A2A36;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 20px;
            height: 100vh;
        }
        h1 { font-size: 24px; margin-bottom: 20px; color: var(--accent-primary); }
        .toolbar { display: flex; gap: 10px; margin-bottom: 20px; }
        button {
            padding: 8px 16px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        button:hover { border-color: var(--accent-primary); }
        .node-types { display: flex; gap: 12px; margin-bottom: 20px; }
        .node-btn {
            padding: 12px 20px;
            border-radius: 12px;
            border: 2px solid var(--border);
            background: var(--bg-secondary);
            cursor: pointer;
            transition: all 0.2s;
        }
        .node-btn:hover { transform: scale(1.02); }
        .node-btn.agent { border-left: 4px solid var(--accent-primary); }
        .node-btn.groupchat { border-left: 4px solid var(--accent-secondary); }
        .node-btn.sequential { border-left: 4px solid var(--accent-tertiary); }
        .node-btn.parallel { border-left: 4px solid var(--accent-quaternary); }
        .canvas {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            min-height: 400px;
            padding: 20px;
        }
        .node {
            display: inline-block;
            padding: 12px 20px;
            background: var(--bg-tertiary);
            border: 2px solid var(--accent-primary);
            border-radius: 10px;
            margin: 10px;
            cursor: move;
        }
        .node.groupchat { border-color: var(--accent-secondary); }
        .node.sequential { border-color: var(--accent-tertiary); }
        .node.parallel { border-color: var(--accent-quaternary); }
        .node-title { font-weight: 600; margin-bottom: 4px; }
        .node-type { font-size: 12px; color: var(--text-secondary); }
        pre {
            background: var(--bg-secondary);
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>🤖 Agent Workflow Builder</h1>
    
    <div class="toolbar">
        <button onclick="generateCode()">📋 Generate JSON</button>
        <button onclick="clearCanvas()">🗑️ Clear</button>
    </div>

    <div class="node-types">
        <button class="node-btn agent" onclick="addNode('agent')">
            <span>👤</span> Agent Node
        </button>
        <button class="node-btn groupchat" onclick="addNode('groupchat')">
            <span>👥</span> Group Chat
        </button>
        <button class="node-btn sequential" onclick="addNode('sequential')">
            <span>➡️</span> Sequential
        </button>
        <button class="node-btn parallel" onclick="addNode('parallel')">
            <span>🔀</span> Parallel
        </button>
    </div>

    <div class="canvas" id="canvas">
        <p style="color: var(--text-secondary);">Click above to add nodes</p>
    </div>

    <pre id="output">// Generated JSON will appear here</pre>

    <script>
        const nodes = [];
        const nodeTypes = {
            agent: { label: 'Agent Node', color: '#00D4AA' },
            groupchat: { label: 'Group Chat', color: '#7B61FF' },
            sequential: { label: 'Sequential', color: '#FF6B4A' },
            parallel: { label: 'Parallel', color: '#FFD93D' }
        };

        function addNode(type) {
            const id = nodes.length + 1;
            const node = { id, type, name: \`new_\${type}_\${id}\` };
            nodes.push(node);
            render();
        }

        function render() {
            const canvas = document.getElementById('canvas');
            if (nodes.length === 0) {
                canvas.innerHTML = '<p style="color: var(--text-secondary);">Click above to add nodes</p>';
                return;
            }
            canvas.innerHTML = nodes.map(n => \`
                <div class="node \${n.type}">
                    <div class="node-title">\${n.name}</div>
                    <div class="node-type">\${nodeTypes[n.type].label}</div>
                </div>
            \`).join('');
        }

        function generateCode() {
            const workflow = {
                schema_version: '2.0',
                workflow_id: \`workflow-\${Date.now()}\`,
                agents: nodes.filter(n => n.type === 'agent').map(n => ({
                    name: n.name,
                    class: 'AssistantAgent',
                    system_message: '',
                    llm_config: { model: 'gpt-4', temperature: 0.3 },
                    tools: []
                })),
                orchestration: {
                    type: 'Sequential',
                    agents: nodes.map(n => n.name)
                }
            };
            document.getElementById('output').textContent = JSON.stringify(workflow, null, 2);
        }

        function clearCanvas() {
            nodes.length = 0;
            render();
            document.getElementById('output').textContent = '// Generated JSON will appear here';
        }
    </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
