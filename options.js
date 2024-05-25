
/******************************************************************************/

(( ) => {

/******************************************************************************/

const reComment = /^\s*#\s*/;

const directiveFromLine = function(line) {
    const match = reComment.exec(line);
    return match === null
        ? line.trim()
        : line.slice(match.index + match[0].length).trim();
};

/******************************************************************************/

CodeMirror.defineMode("ubo-whitelist-directives", function() {
    const reRegex = /^\/.+\/$/;

    return {
        token: function(stream) {
            const line = stream.string.trim();
            stream.skipToEnd();
            if ( reBadHostname === undefined ) {
                return null;
            }
            if ( reComment.test(line) ) {
                return whitelistDefaultSet.has(directiveFromLine(line))
                    ? 'keyword comment'
                    : 'comment';
            }
            if ( line.indexOf('/') === -1 ) {
                if ( reBadHostname.test(line) ) { return 'error'; }
                if ( whitelistDefaultSet.has(line.trim()) ) {
                    return 'keyword';
                }
                return null;
            }
            if ( reRegex.test(line) ) {
                try {
                    new RegExp(line.slice(1, -1));
                } catch(ex) {
                    return 'error';
                }
                return null;
            }
            if ( reHostnameExtractor.test(line) === false ) {
                return 'error';
            }
            if ( whitelistDefaultSet.has(line.trim()) ) {
                return 'keyword';
            }
            return null;
        }
    };
});

let reBadHostname;
let reHostnameExtractor;
let whitelistDefaultSet = new Set();

/******************************************************************************/

const noopFunc = function(){};

let cachedWhitelist = '';

const cmEditor = new CodeMirror(
    document.getElementById('whitelist'),
    {
        autofocus: true,
        lineNumbers: true,
        lineWrapping: true,
        styleActiveLine: true,
    }
);

/******************************************************************************/

const getEditorText = function() {
    let text = cmEditor.getValue().replace(/\s+$/, '');
    return text === '' ? text : text + '\n';
};

const setEditorText = function(text) {
    cmEditor.setValue(text.replace(/\s+$/, '') + '\n');
};

/******************************************************************************/

const whitelistChanged = function() {
    const whitelistElem = uDom.nodeFromId('whitelist');
    const bad = whitelistElem.querySelector('.cm-error') !== null;
    const changedWhitelist = getEditorText().trim();
    const changed = changedWhitelist !== cachedWhitelist;
    uDom.nodeFromId('whitelistApply').disabled = !changed || bad;
    uDom.nodeFromId('whitelistRevert').disabled = !changed;
    CodeMirror.commands.save = changed && !bad ? applyChanges : noopFunc;
};

cmEditor.on('changes', whitelistChanged);

/******************************************************************************/

function promisify(fn){
    return new Promise((accept, cancel) => {
      fn(accept);
    })
  }
  
const sleep = async (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const renderWhitelist = async function() {
    const whitelistedSites = (await promisify((r)=>chrome.storage.sync.get('whitelistedSites', r))).whitelistedSites || [];
    const whitelistStr = whitelistedSites.join('\n').trim();
    cachedWhitelist = whitelistStr;
    setEditorText(whitelistStr);
};

/******************************************************************************/

const handleImportFilePicker = function() {
    const file = this.files[0];
    if ( file === undefined || file.name === '' ) { return; }
    if ( file.type.indexOf('text') !== 0 ) { return; }
    const fr = new FileReader();
    fr.onload = ev => {
        if ( ev.type !== 'load' ) { return; }
        setEditorText(
            [ getEditorText().trim(), fr.result.trim() ].join('\n').trim()
        );
    };
    fr.readAsText(file);
};

/******************************************************************************/

const startImportFilePicker = function() {
    const input = document.getElementById('importFilePicker');
    // Reset to empty string, this will ensure an change event is properly
    // triggered if the user pick a file, even if it is the same as the last
    // one picked.
    input.value = '';
    input.click();
};

/******************************************************************************/

const exportWhitelistToFile = function() {
    const val = getEditorText();
    if ( val === '' ) { return; }
    const filename = "whitelisted-sites-proxy.txt"
            .replace(/ +/g, '_');
    vAPI.download({
        'url': `data:text/plain;charset=utf-8,${encodeURIComponent(val + '\n')}`,
        'filename': filename
    });
};

/******************************************************************************/

const applyChanges = async function() {
    cachedWhitelist = getEditorText().trim();
    let whitelistedSites = cachedWhitelist.split("\n").map(e => e.trim().replace(/ +/g, ''));
    (await promisify((r)=>chrome.storage.sync.set({whitelistedSites}, r)));
    await sleep(200);
    await promisify(r => chrome.extension.sendMessage({ greeting: "refreshWhitelistedSites", }, r));
    renderWhitelist();
};

const revertChanges = function() {
    setEditorText(cachedWhitelist);
};

/******************************************************************************/

self.hasUnsavedData = function() {
    return getEditorText().trim() !== cachedWhitelist;
};

/******************************************************************************/

uDom('#importWhitelistFromFile').on('click', startImportFilePicker);
uDom('#importFilePicker').on('change', handleImportFilePicker);
uDom('#exportWhitelistToFile').on('click', exportWhitelistToFile);
uDom('#whitelistApply').on('click', ( ) => { applyChanges(); });
uDom('#whitelistRevert').on('click', revertChanges);

renderWhitelist();

/******************************************************************************/

})();