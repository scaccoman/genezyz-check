//Global variables
var payload   = {};
var queueShow = false;
var helpShow  = false;
var selectedQueues = [];
var startTime = "";
var endTime   = "";

//init functions
setMonitoringTime();
setSound();
setOptions();
setPreselectedQueues();
setInterval(function() {
    if (queueShow === false){
        setOptions();
    }
}, 10000);
//check the stored time, determine spinner visibility
checkTimeRange();
setInterval(checkTimeRange, 5000);

//============================================
//======= START: User event listeners ========
//============================================

//START: Event listeners
document.getElementById("resetBtn").addEventListener("click", function(){
    resetTime();
    addWarning();
});

//submit time range
document.getElementById("submitBtn").addEventListener("click", function(){
    saveTimeRange();
});

//listen for enter key press
document.getElementById("startTime").addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
      saveTimeRange();
    }
});

//listen for enter key press
document.getElementById("endTime").addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
      saveTimeRange();
    }
});

//get the queue list - TODO: implement logic to run script manually on content.js
document.getElementById("refreshQueuesBtn").addEventListener("click", function(){
    setOptions();
    setPreselectedQueues();
});

//button to save the selected queue to the synched storage
document.getElementById("saveQueuesBtn").addEventListener("click", function(){
    getSelectedQueues();
});


//hide show panel
document.getElementById("selectBtn").addEventListener('click', function () {
    if (queueShow === false) {
        document.getElementById("select-queue").classList.remove("closed");
        document.getElementById("selectBtn").value = " Save";
        document.getElementById("refreshQueuesBtn").style.display = "inline-block";
        document.getElementById("saveQueuesBtn").style.display = "inline-block";
        document.getElementById("muteHideShow").style.display = "inline-block";
        setPreselectedQueues();
        queueShow = true;
    } else {
        document.getElementById("select-queue").classList.add("closed");
        document.getElementById("selectBtn").value = " Queues";
        document.getElementById("refreshQueuesBtn").style.display = "none";
        document.getElementById("saveQueuesBtn").style.display = "none";
        document.getElementById("muteHideShow").style.display = "none";
        queueShow = false;
        getSelectedQueues();
    }
});

//hide show help
document.getElementById("help").addEventListener('click', function () {
    if (helpShow === false) {
        if (queueShow === true){
            document.getElementById("select-queue").classList.add("closed");
            document.getElementById("selectBtn").value = " Queues";
            document.getElementById("refreshQueuesBtn").style.display = "none";
            document.getElementById("saveQueuesBtn").style.display = "none";
            document.getElementById("muteHideShow").style.display = "none";
            queueShow = false;
            //DISABLED SAVE ON DROPDOWN-CLOSE
            // getSelectedQueues();
        }
        document.getElementById("helpContent").classList.remove("closed");
        helpShow = true;
    } else {
        document.getElementById("helpContent").classList.add("closed");
        helpShow = false;
    }
});

//sends message to server.js to mute the sound notifications
document.getElementById("muteBtn").addEventListener("click", function(){
    var sound = { mute: document.getElementById("muteBtn").checked };
    console.log(sound);
    chrome.runtime.sendMessage({sound: sound},
        function (response) {
            console.log(response);
        });
    chrome.storage.sync.set({ "sound": sound }, function(){
        console.log("data saved to synched storage");
    });
});


//============================================
//========= END: User event listeners ========
//============================================

//============================================
//======= START: Time calculation ============
//============================================

function resetTime() {
    var currentTime = getCurrentTime();
    document.getElementById("startTime").value = currentTime;
    document.getElementById("endTime").value   = currentTime;
}

//get current time
function getCurrentTime() {
  var d = new Date();
  var h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  var s = addZero(d.getSeconds());
  return h + ":" + m + ":" + s;

  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
}

function getStoredTime() {
    chrome.storage.sync.get(["timeStart", "timeEnd"], function(items){
        if (items) {
            if (items.timeStart && items.timeEnd) {
                if (items.timeStart !== "" && items.timeEnd !== "") {
                    document.getElementById("startTime").value = items.timeStart;
                    document.getElementById("endTime").value   = items.timeEnd;
                } else if (startTime === "" && endTime === "") {
                    resetTime();
                }
            }
        }
    });
}

//TODO: remove this function
function setMonitoringTime() {
    getStoredTime();
}


//============================================
//========= END: Time calculation ============
//============================================

//============================================
//======= START: Time range saving ===========
//============================================

//save time range to chrome synched storage
function saveTimeRange() {
    payload.start = document.getElementById("startTime").value;
    payload.end   = document.getElementById("endTime").value;
    if (IsValidTime(payload.start) === true && IsValidTime(payload.end) === true) {
        if (payload.start !== "" && payload.start !== null && payload.start !== undefined &&
            payload.end   !== "" && payload.end   !== null && payload.end   !== undefined ) {
            // sendData(payload);
            chrome.storage.sync.set({ "timeStart": payload.start, "timeEnd": payload.end }, function(){
                addSuccess();
                // console.log("data saved to synched storage");
            });
            getStoredTime();
            checkTimeRange();
        }
    } else {
        addError();
        console.error("please enter a valid Start and End monitoring time")
    }
}

//check for time format validity
function IsValidTime(timeString) {
    var pattern = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
    if (timeString.match(pattern)) {
        // console.log(true);
        return true;
    } else {
        // console.log(false);
        return false;
    }
}

//============================================
//========= END: Time range saving ===========
//============================================

//============================================
//======= START: User visual feedback ========
//============================================
function addSuccess() {
    removeOutlines();
    document.querySelectorAll("input[type='text']")[0].classList.add("successSubmit");
    document.querySelectorAll("input[type='text']")[1].classList.add("successSubmit");
    setTimeout(removeOutlines, 1000);
}

function addError() {
    removeOutlines();
    document.querySelectorAll("input[type='text']")[0].classList.add("errorSubmit");
    document.querySelectorAll("input[type='text']")[1].classList.add("errorSubmit");
    setTimeout(removeOutlines, 1000);
}

function addWarning() {
    removeOutlines();
    document.querySelectorAll("input[type='text']")[0].classList.add("warningSubmit");
    document.querySelectorAll("input[type='text']")[1].classList.add("warningSubmit");
    setTimeout(removeOutlines, 1000);
}

function removeOutlines() {
    var input1 = document.querySelectorAll("input[type='text']")[0];
    var input2 = document.querySelectorAll("input[type='text']")[1];
    input1.classList.remove("successSubmit");
    input2.classList.remove("successSubmit");
    input1.classList.remove("errorSubmit");
    input2.classList.remove("errorSubmit");
    input1.classList.remove("warningSubmit");
    input2.classList.remove("warningSubmit");
}

//============================================
//======== END: User visual feedback =========
//============================================

//============================================
//======== START: Spinner visibility =========
//============================================

//toggle spinner visibility
function hideSpinner(value){
    if (value === false) {
        document.getElementsByClassName("spinner")[0].classList.remove("hidden");
    } else if (value === true) {
        document.getElementsByClassName("spinner")[0].classList.add("hidden");
    }
}

//get synched time data stored in chrome
// function getStoredTime() {
//   chrome.storage.sync.get(["timeStart", "timeEnd"], function(items){
//     if (items) {
//       if (items.timeStart && items.timeEnd) {
//         if (items.timeStart !== "" && items.timeEnd !== "") {
//           var timeRange = {
//                             start: items.timeStart,
//                             end: items.timeEnd
//                            };
//           checkTimeRange(timeRange);
//         }
//       }
//     }
//   });
// }

//check time range by comparing strings
function checkTimeRange(timeRange){
    chrome.storage.sync.get(["timeStart", "timeEnd"], function(items){
        if (items) {
          if (items.timeStart && items.timeEnd) {
            if (items.timeStart !== "" && items.timeEnd !== "") {
                var currentTime = getCurrentTime();
              if (currentTime >= items.timeStart && currentTime <= items.timeEnd ) {
                hideSpinner(false);
              } else {
                hideSpinner(true);
              }
            }
          }
        }
      });
    }

//============================================
//========= END: Spinner visibility ==========
//============================================

//============================================
//======== START: Queues selection ===========
//============================================

//saves to storage currently selected options
function getSelectedQueues() {
    selectedQueues = [];
    selectedQueues = Array.prototype.slice.call(document.querySelectorAll('#select-queue option:checked'),0).map(function(v,i,a) {
        return v.value;
    });
    // console.log(selectedQueues);
    chrome.storage.sync.remove(["queuesSelected"], function(){
        chrome.storage.sync.set({ "queuesSelected": selectedQueues }, function(){
            // console.log("selected queues recorded");
            setPreselectedQueues();
        });
    })   
}

//preselects queues to watch from storage
function setPreselectedQueues(){
  chrome.storage.sync.get(["queuesSelected"], function(items) {
    var splitValues = items.queuesSelected;
    var multiSelect = document.getElementById('select-queue');
    multiSelect.value = null; // Reset pre-selected options (just in case)
    for (var i = 0; i < multiSelect.options.length; i++) {
      if (splitValues.indexOf(multiSelect.options[i].value) >= 0) {
        multiSelect.options[i].selected = true;
      }
    }
    // console.log("selected queues: " + items.queuesSelected);
  })
}

//loop through array, get available queues and set them to html element
function setOptions() {
        chrome.storage.local.get(["queuesGlobal"], function(items) {
            if (items) {
                //load backup array
                if (!items.queuesGlobal) {
                    items.queuesGlobal = defaultQueues;
                }
                if (items.queuesGlobal) {
                    removeOptions(document.getElementById("select-queue"));
                    items.queuesGlobal.forEach(function(Queue) {
                        var x = document.getElementById("select-queue");
                        var option = document.createElement("option");
                        option.text = Queue.id + 1 + ". " + Queue.name;
                        x.add(option);
                    })
                }
            }
        });

        //remove all items from dropdown
        function removeOptions(multiselect) {
            for (var i = multiselect.options.length - 1 ; i >= 0 ; i--) {
                multiselect.remove(i);
            }
        }
}

//============================================
//========== END: Queues selection ===========
//============================================

function setSound(){
    chrome.storage.sync.get(["sound"], function(items){
        if (items.sound) {
            document.getElementById("muteBtn").checked = items.sound.mute;
        }
    });
}

//Backup queue list
var defaultQueues =  [];