/*!
 * License: MIT
 * Author: Dominique Lopes
 * https://github.com/d-lopes/record-me
 */

// TODO: refactor to settings
var maxChars = 40;
const taWidth = "265px";

function loadSettings() {
    // ...
}

show = false;

function makeRecordable(innerDocument) {
    const recordableTextAreas = innerDocument.querySelectorAll("textarea");
    if (recordableTextAreas.length === 0) return false;

    // initialize form elements
    const ta = recordableTextAreas[0];
    const sendButton = Array.from(innerDocument.querySelectorAll("img.clickable")).filter(img => img.title == "Save")[0];
    const actionButtons = innerDocument.querySelectorAll("button.record-me");
    const inputControlWatermark = ta.parentNode.querySelectorAll(".input-control-watermark")[0]

    // adjust UI
    if (ta.disabled == true) {
      ta.style.width = "100%";
      ta.value = "";
      ta.innerHTML = "";
      if (actionButtons.length > 0) {
        actionButtons[0].style.display = "none";
      }

      return false;

    } else {
      ta.style.width = taWidth;
      ta.style.float = "left";
      ta.style.paddingTop = "8px";
      ta.style.height = "30px";
      if (actionButtons.length > 0) {
        actionButtons[0].style.display = "block";
      }
  
      ta.parentNode.style.height = "30px";
      inputControlWatermark.style.width = taWidth;  
    }

    // ******************************************************************************************
    // * Guard: stop processing here, if form elements and event listeners were already setup 
    // ******************************************************************************************
    if (actionButtons.length > 0) return false;

    // 1. Prepare with the DropDown with the latest descriptions  
    let select = document.createElement("select");
    select.style.display = "none";
    select.style.width = taWidth;
    select.style.border = "none";
    select.style.float = "left";
    select.style.height = "30px";

    populateSelectBox(select);
    select.addEventListener ("change", function() {
      ta.value = select.options[select.selectedIndex].value;
      ta.innerHTML = select.options[select.selectedIndex].value;

      toggleView(button, select, ta, inputControlWatermark, true);

      // needed in order to take over the data into the internal data model
      ta.dispatchEvent(new Event("change"));
    });

    ta.parentNode.appendChild(select);

    // 2. Create the button if not exist    
    let button = document.createElement("button");
    button.style.float = "left";
    button.style.margin = "5px 0 0";
    button.style.width = "55px";
    button.classList = "record-me";
    toggleView(button, select, ta, inputControlWatermark, true)

    button.addEventListener ("click", function(e) {
      toggleView(button, select, ta, inputControlWatermark, true);

      // needed to avoid firing the onSubmit event listener from below
      if (e.preventDefault) e.preventDefault();
      return false;
    });

    ta.parentNode.appendChild(button);
    
    // 3. add event listner to form to capture latest input
    sendButton.addEventListener("click", function(e) {
      storeLastestInput(ta.value);
      populateSelectBox(select);
      //toggleView(button, select, ta, inputControlWatermark, false);
    });
}

function toggleView(button, select, ta, inputControlWatermark, changeMode) {
  if (show == true) {
    button.innerHTML = "Hide";
    select.style.display = "block";
    ta.style.display = "none";
    inputControlWatermark.style.display = "none";
  } else {

    // disallow selection as long as there is no latest value available
    if(loadLastestInput().length == 0) {
      button.disabled = true;  
      button.title = "Disabled since you do not have recorded any descriptions yet";
    } else {
      button.disabled = false;
      button.title = "Click here to select from your latest descriptions";
    }

    button.innerHTML = "Latest";
    select.style.display = "none";
    ta.style.display = "block";
    if (ta.innerHTML === "") {
      inputControlWatermark.style.display = "block";
    }
  }

  // only influence the toggleControl when changemode is true
  if (changeMode == true) { show = !show; }
}

function populateSelectBox(select) {
  // remove children
  select.innerHTML = "";
  
  // default text as a sort of placeholder/hint but not considered a valid value
  var option = document.createElement("option");
  option.innerHTML = "Choose here";
  option.selected = true;
  option.disabled = true;
  option.hidden = true;
  select.appendChild(option);

  // render all existing options
  var latestArr = loadLastestInput();
  latestArr.forEach(txt => {
      var option = document.createElement("option");
      option.innerHTML = txt;
      select.appendChild(option);
  });
}

// TODO: load from chrome global store
function loadLastestInput() {

  var lastestInput = localStorage["lastestInput"]; 
  if (typeof lastestInput === 'undefined') {
    return [];
  }

  return lastestInput.split(",").filter(onlyUnique);

}

// TODO: store in chrome global store
function storeLastestInput(input) {
  
  var lastestInput = loadLastestInput();
  lastestInput.unshift(input);
  lastestInput = lastestInput.filter(onlyUnique);

  localStorage["lastestInput"] = lastestInput;

}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

record = () => {
  
  makeRecordable(document);

};

const colorizeInterval = setInterval(() => {
  loadSettings();
  window.requestAnimationFrame(record);
}, 1000);
