const {dialog} = require('electron').remote
const fs       = require('fs');

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
})

function setView(viewName) {
  document.body.setAttribute('data-view', viewName);
  document.title = (viewName === "form") ? 'FlowTyper' : `${sessionTitle} - FlowTyper`;
}

function setLastActivity () {
  lastActivity = now();
}

function cleanArea () {
  writerArea.blur();
  let cleanInterval = setInterval(function() {
    writerArea.value = writerArea.value.slice(0,-1);
    if ( writerArea.value.length <= 0 ) {
      window.clearInterval(cleanInterval);
      writerArea.focus();
    }
  }, 1);
}

function startSession () {
  setView('writer');
  writerArea.value = '';
  writerArea.focus();

  setLastActivity();
  mainArea.addEventListener('keyup', setLastActivity);

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
  mainArea.removeEventListener('keyup', setLastActivity);
  writerArea.blur();

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
