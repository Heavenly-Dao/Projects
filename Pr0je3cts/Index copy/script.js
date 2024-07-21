let files = JSON.parse(localStorage.getItem('files')) || [];
let timeline = JSON.parse(localStorage.getItem('timeline')) || [];
let importMode = 'file'; // Default import mode
let filesToImport = [];

document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    loadFiles();
    removeDuplicates();
    displayFiles();
    displayTimeline();
});

function loadFiles() {
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
        files = JSON.parse(storedFiles);
    }
}

function toggleImportMode() {
    const importModeRadios = document.getElementsByName('import-mode');
    const fileInput = document.getElementById('file');

    importModeRadios.forEach(radio => {
        if (radio.checked) {
            importMode = radio.value;
        }
    });

    if (importMode === 'folder') {
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.removeAttribute('multiple');
    } else {
        fileInput.removeAttribute('webkitdirectory');
        fileInput.setAttribute('multiple', '');
    }
}

function prepareImport() {
    const fileInput = document.getElementById('file');
    filesToImport = Array.from(fileInput.files);

    if (filesToImport.length > 0) {
        const importSummaryList = document.getElementById('import-summary-list');
        importSummaryList.innerHTML = '';

        filesToImport.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const filePath = file.webkitRelativePath || file.name;
                const existingFileIndex = files.findIndex(f => f.name === filePath);

                if (existingFileIndex !== -1) {
                    if (files[existingFileIndex].content.join('\n') !== content) {
                        const summaryItem = document.createElement('div');
                        summaryItem.className = 'summary-item';
                        summaryItem.innerHTML = `<p>File: ${filePath} will be updated</p>`;
                        importSummaryList.appendChild(summaryItem);
                    }
                } else {
                    const summaryItem = document.createElement('div');
                    summaryItem.className = 'summary-item';
                    summaryItem.innerHTML = `<p>File: ${filePath} will be added</p>`;
                    importSummaryList.appendChild(summaryItem);
                }
            };
            reader.readAsText(file);
        });

        document.getElementById('tag-modal').style.display = 'block';
    } else {
        alert('Please select a file/folder.');
    }
}

function confirmImport() {
    scanForConflicts();

    filesToImport.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            if (isTextContent(content)) {
                const lines = content.split('\n');
                const filePath = file.webkitRelativePath || file.name;

                if (isPartOfExistingFolder(filePath) || isSubfolderOfExistingFolder(filePath)) {
                    console.warn(`The file or folder ${filePath} is part of an existing folder and will not be imported.`);
                    return;
                }

                const existingFileIndex = files.findIndex(f => f.name === filePath);

                if (existingFileIndex !== -1) {
                    if (files[existingFileIndex].content.join('\n') !== content) {
                        updateTimeline('updated', filePath);
                        files[existingFileIndex] = {
                            name: filePath,
                            content: lines
                        };
                    }
                } else {
                    // Check if a file with the same name exists at the root level
                    const fileName = filePath.split('/').pop();
                    const rootFileIndex = files.findIndex(f => f.name === fileName);

                    if (rootFileIndex !== -1) {
                        // Remove the root level file
                        files.splice(rootFileIndex, 1);
                    }

                    updateTimeline('added', filePath);
                    files.push({
                        name: filePath,
                        content: lines
                    });
                }
                saveFiles();
                displayFiles();
            } else {
                console.warn(`The file ${file.name} does not contain text content.`);
            }
        };
        reader.readAsText(file);
    });

    closeModal();
}

function scanForConflicts() {
    const conflicts = [];

    filesToImport.forEach(file => {
        const filePath = file.webkitRelativePath || file.name;
        const existingFileIndex = files.findIndex(f => f.name === filePath);

        if (existingFileIndex !== -1) {
            conflicts.push({
                action: 'update',
                filePath: filePath,
                existingFileIndex: existingFileIndex
            });
        } else {
            const fileName = filePath.split('/').pop();
            const rootFileIndex = files.findIndex(f => f.name === fileName);

            if (rootFileIndex !== -1) {
                conflicts.push({
                    action: 'replace',
                    filePath: filePath,
                    rootFileIndex: rootFileIndex
                });
            }
        }
    });

    if (conflicts.length > 0) {
        console.log('Conflicts found:', conflicts);
        conflicts.forEach(conflict => {
            if (conflict.action === 'update') {
                console.log(`File ${conflict.filePath} will be updated.`);
            } else if (conflict.action === 'replace') {
                console.log(`File ${conflict.filePath} will replace the root level file.`);
            }
        });
    } else {
        console.log('No conflicts found.');
    }
}

function isPartOfExistingFolder(filePath) {
    const filePathParts = filePath.split('/');
    for (let i = 1; i < filePathParts.length; i++) {
        const folderPath = filePathParts.slice(0, i).join('/');
        if (files.some(f => f.name === folderPath)) {
            return true;
        }
    }
    return false;
}

function isSubfolderOfExistingFolder(filePath) {
    return files.some(f => filePath.startsWith(f.name + '/'));
}

function isTextContent(content) {
    return /^[\x00-\x7F]*$/.test(content);
}

function displayFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <h3>${file.name}</h3>
            <p>Path: ${file.name}</p>
            <button onclick="removeFile(${files.indexOf(file)})">Remove</button>
        `;
        fileList.appendChild(fileItem);
    });
}

function searchFiles() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    if (searchInput === '') {
        displayFiles();
    } else {
        files.forEach(file => {
            file.content.forEach((line, index) => {
                if (line.toLowerCase().includes(searchInput)) {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `<h3>${file.name}</h3><p>line ${index + 1}</p><p>${line}</p>`;
                    fileList.appendChild(fileItem);
                }
            });
        });
    }
}

function removeFile(index) {
    const removedFile = files.splice(index, 1)[0];
    updateTimeline('removed', removedFile.name);
    saveFiles();
    displayFiles();
}

function saveFiles() {
    localStorage.setItem('files', JSON.stringify(files));
}

function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    const textSize = document.getElementById('text-size').value;
    const fontFamily = document.getElementById('font-family').value;

    const settings = {
        bgColor,
        textColor,
        textSize,
        fontFamily
    };

    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    closeSettings();
}

function applySettings() {
    const settings = JSON.parse(localStorage.getItem('settings'));

    if (settings) {
        document.body.style.backgroundColor = settings.bgColor;
        document.body.style.color = settings.textColor;
        document.body.style.fontSize = `${settings.textSize}px`;
        document.body.style.fontFamily = settings.fontFamily;
    }
}

function updateTimeline(action, fileName) {
    const timestamp = new Date().toLocaleString();
    const timelineEntry = {
        action,
        fileName,
        timestamp
    };
    timeline.push(timelineEntry);
    localStorage.setItem('timeline', JSON.stringify(timeline));
    displayTimeline();
}

function displayTimeline() {
    const timelineContainer = document.getElementById('timeline-entries');
    timelineContainer.innerHTML = '';

    timeline.forEach(entry => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-entry';
        timelineItem.innerHTML = `
            <p><strong>${entry.action.toUpperCase()}</strong>: ${entry.fileName}</p>
            <p>${entry.timestamp}</p>
        `;
        timelineContainer.appendChild(timelineItem);
    });
}

function clearTimeline() {
    if (confirm('Are you sure you want to clear the timeline?')) {
        timeline = [];
        localStorage.setItem('timeline', JSON.stringify(timeline));
        displayTimeline();
    }
}

function closeModal() {
    document.getElementById('tag-modal').style.display = 'none';
}

function removeDuplicates() {
    const fileMap = new Map();

    files.forEach((file, index) => {
        const filePathParts = file.name.split('/');
        const fileName = filePathParts.pop();
        const folderPath = filePathParts.join('/');
        const folderLevel = filePathParts.length;

        const fileKey = `${folderPath}/${fileName}`;

        if (!fileMap.has(fileKey)) {
            fileMap.set(fileKey, { index, folderPath, folderLevel, content: file.content.join('\n') });
        } else {
            const existingFile = fileMap.get(fileKey);
            if (folderLevel < existingFile.folderLevel) {
                // Higher level folder, replace existing
                files[existingFile.index] = file;
                fileMap.set(fileKey, { index, folderPath, folderLevel, content: file.content.join('\n') });
            } else if (folderLevel === existingFile.folderLevel) {
                // Same level, check content
                if (existingFile.content !== file.content.join('\n')) {
                    // Different content, update existing
                    files[existingFile.index] = file;
                    fileMap.set(fileKey, { index, folderPath, folderLevel, content: file.content.join('\n') });
                } else {
                    // Same content, remove duplicate
                    files.splice(index, 1);
                }
            } else {
                // Lower level folder, remove current file
                files.splice(index, 1);
            }
        }
    });

    saveFiles();
    displayFiles();
}