const {dialog}  = require('electron').remote
const fs        = require('fs');
const SimpleMDE = require('simplemde');

const editor = new SimpleMDE({
  autoDownloadFontAwesome: false,
  toolbar: false,
  spellChecker: false
});

const sessionFormElem = document.getElementById('sessionForm');
const writerElem      = document.getElementById('writer');
const writerArea      = document.getElementById('mainArea');

let checkInterval;
let lastActivity;

let sessionTitle;
let sessionDuration;
let sessionDelay;

setView('form');

sessionFormElem.addEventListener('submit', function(ev){
  ev.preventDefault();

  sessionTitle    = ev.target[0].value || 'No name';
  sessionDuration = +ev.target[1].value || 5;
  sessionDelay    = +ev.target[2].value || 5;
  sessionDelay    *= 1000;

  startSession();
});

editor.codemirror.on("change", setLastActivity);

function setView(viewName) {
  document.body.setAttribute('data-view', viewName);
  document.title = (viewName === "form") ? 'FlowTyper' : `${sessionTitle} - FlowTyper`;
}

function setLastActivity () {
  lastActivity = now();
}

function cleanArea () {
  document.body.focus();

  let cleanInterval = setInterval(function() {
    let val = editor.value();
    editor.value( val.slice(0, -1) );
    if ( val.length <= 1 ) {
      window.clearInterval(cleanInterval);
      editor.codemirror.focus();
    }
  }, 1);
}

function startSession () {
  setView('writer');
  editor.value("");
  editor.codemirror.focus();

  setLastActivity();

  checkInterval = setInterval(function(){
    const diff = now() - lastActivity;
    if ( diff > sessionDelay ) {
      cleanArea();
    }
  }, 1000);

  setTimeout(stopSession, sessionDuration * 60 * 1000);
}

function stopSession () {
  window.clearInterval(checkInterval);
  document.body.focus();

  setTimeout(function(){
    alert("The session is over!");
    if ( writerArea.value.length > 0 ) {
      saveSession();
    }
    setView('form');
  }, 500);
}

function saveSession () {
  dialog.showSaveDialog({title: "Save your session"}, function (fileName) {
    if (fileName === undefined){
      console.log("You didn't save the file");
      return;
    }

    fs.writeFile(fileName, writerArea.value, function (err) {
      if(err){
        alert("An error ocurred creating the file "+ err.message)
      }

      alert("The file has been succesfully saved");
    });
  });
}

function now () {
  return (new Date());
}
