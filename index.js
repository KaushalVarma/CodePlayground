document.addEventListener('DOMContentLoaded', function() {
    initCodeEditor();

    document.getElementById('Get_question').addEventListener('click', onGetQuestionButtonClick);
    document.getElementById('Execute').addEventListener('click', onExecuteButtonClick);
    document.getElementById('Clear_Console').addEventListener('click', clearConsole);
    document.getElementById('fileInput').addEventListener('change', handleFileInputChange);
});

async function readJSONFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Error fetching JSON: ${response.status}`);
    }
    return response.json();
}

function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonContent = e.target.result;
            const data = JSON.parse(jsonContent);
            console.log(data);
        };
        reader.readAsText(file);
    } else {
        console.error('No file selected');
    }
}

function fetchProblemText(url) {
    const proxyUrl = `http://localhost:3000/proxy${url.replace('https://parikh.club', '')}`;
    return fetch(proxyUrl)
        .then(response => response.text())
        .then(htmlContent => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            const problemElement = doc.querySelector(".problem-description");

            if (problemElement) {
                const problemText = problemElement.textContent.trim();
                document.getElementById('questions_data').innerText = problemText;
                return problemText;
            } else {
                console.error("Problem text element not found!");
                return null;
            }
        })
        .catch(error => {
            console.error("Error fetching problem content:", error);
            return null;
        });
}

function onGetQuestionButtonClick() {
    console.log('Get_question button clicked');
    getProblemText();
}

function getProblemText() {
    return readJSONFile("Data_files/DSA_PROBLEMS.json")
        .then(data => {
            if (data.InitialStartups && data.InitialStartups.length > 0) {
                const url = data.InitialStartups[0].problemUrl;
                if (url) {
                    return fetchProblemText(url);
                } else {
                    throw new Error("Problem URL not found in JSON data");
                }
            } else {
                throw new Error("No InitialStartups found in JSON data");
            }
        })
        .catch(error => {
            console.error("Error getting problem text:", error);
            return null;
        });
}

function initCodeEditor(language = 'javascript') {
    initMonacoEditor('code-editor', '', language);
}

function initMonacoEditor(containerId, defaultValue, language = 'plaintext') {
    require.config({ paths: { 'vs': "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.23.0/min/vs" }});
    require(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.getElementById(containerId), {
            value: defaultValue,
            language: language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false
        });
        editor.layout();
        window.editorInstance = editor; // Store the editor instance globally
    });
}

function clearConsole() {
    const consoleElement = document.getElementById('console');
    if(consoleElement){
        consoleElement.innerText = '';
    }else{
        console.error('Console element not found');
    }
}

function onExecuteButtonClick() {
    const code = window.editorInstance.getValue();
    executeCode(code);
}

function executeCode(code) {
    // Create a new function that captures console.log
    const consoleOutput = [];
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        consoleOutput.push(args.join(' '));
        originalConsoleLog.apply(console, args);
    };

    try {
        new Function(code)();
    } catch (error) {
        consoleOutput.push('Error executing code: ' + error.message);
    }

    // Restore the original console.log
    console.log = originalConsoleLog;

    updateConsole(consoleOutput.join('\n'));
}

function updateConsole(output) {
    const consoleElement = document.getElementById('console');
    if (consoleElement) {
        consoleElement.innerText += output + '\n';
    } else {
        console.error('Console element not found');
    }
}
