//global variables
var checkCalls = false;
var queuesGlobal = [];
var queuesSelected = [];

//init functions
getStoredTime();
getSelectedQueues();
setInterval(checkCallsWaiting, 5000);
setInterval(extractQueueNames, 10000);

//============================================
//==========START: notifications =============
//============================================

// request notification permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Please use Chrome.'); 
    return;
  }
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

//show chrome notification (send message to server.js)
function notifyMe(queueName) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    chrome.runtime.sendMessage({notify: {queueName: queueName}}, function(response) {
      console.log(response);
    });
    
    //create new notification
    // var notification = new Notification('Call in the queue!', {
    //   icon: 'https://image.ibb.co/bQurum/alert.png',
    //   body: "There is a new call in " + queueName,
    // });
    // console.log(notification);
    // notification.onclick = function () {
    //   window.open("https://netsuite-wwe-usw1.genesyscloud.com/ui/ad/v1/index.html");      
    // };
  }
}

//check if calls waiting in selected queues
function checkCallsWaiting() {
  getStoredTime();
  getSelectedQueues();
	if (document.getElementById("wwe-workspace-tab-4") && document.getElementById("wwe-workspace-tab-4").getAttribute("tabindex") === '0' && checkCalls === true && queuesSelected !== []) {
    console.log("--checking--");
    for (var i = 0; i < queuesSelected.length; i++){
      console.log("queuesSelected[i].id - " + queuesSelected[i].id);
      if (document.querySelectorAll("tr[role='row']")[queuesSelected[i].id] 
          && document.querySelectorAll("tr[role='row']")[queuesSelected[i].id].children[1].children[0].children[3].innerHTML !== "0" 
          && document.querySelectorAll("tr[role='row']")[queuesSelected[i].id].children[1].children[0].children[3].innerHTML !== "-") {
            notifyMe(queuesSelected[i].name);
            document.getElementById("agent-desktop-container").style.background = "red";
      } else {
      document.getElementById("agent-desktop-container").style.background = "white";
      }
	  }
  }
}

//============================================
//============ END: notifications ============
//============================================

//============================================
//=========== START: time management =========
//============================================

//get synched time data stored in chrome
function getStoredTime() {
  chrome.storage.sync.get(["timeStart", "timeEnd"], function(items){
    if (items) {
      if (items.timeStart && items.timeEnd) {
        if (items.timeStart !== "" && items.timeEnd !== "") {
          var timeRange = {
                            start: items.timeStart,
                            end: items.timeEnd
                           };
          // console.log(timeRange);
          if (checkTimeRange(timeRange) === true) {
            checkCalls = true;
          } else {
            checkCalls = false;
          }
        }
      }
    }
  });
}

//check time range by comparing strings
function checkTimeRange(timeRange){
  if (timeRange && timeRange.start && timeRange.end) {
    timeRange.current = getCurrentTime();
    if (timeRange.start && timeRange.end) {
      if (timeRange.current >= timeRange.start && timeRange.current <= timeRange.end ) {
        return true;
      }
    }
  }
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

//============================================
//========== END: time management ============
//============================================

//============================================
//===== START: handle queue selection ========
//============================================

//get the queue names from the page and store them locally
function extractQueueNames() {
  if (document.getElementById("wwe-workspace-tab-4") && document.getElementById("wwe-workspace-tab-4").getAttribute("tabindex") === '0') {
    queuesGlobal = [];
    var trList  = document.querySelectorAll("tr[role='row']");
    // -5 to cut off useless html elements
    for (var i = 0; i < trList.length - 5; i++) {
      var name = trList[i].children[0].innerHTML;
      queuesGlobal.push(new Queue(name, i));
    }
    chrome.storage.local.remove(["queuesGlobal"], function(){
      chrome.storage.local.set({ "queuesGlobal": queuesGlobal }, function(){
      // console.log("--extracted queue names--");
      });
    });
  }
}

//Queue object prototype
function Queue(name, id) {
  this.name = name;
  this.id   = id;
}

//pull out selected queues
function getSelectedQueues(){
  chrome.storage.sync.get(["queuesSelected"], function(items) {
    queuesSelected = [];
    if (items.queuesSelected){
      items.queuesSelected.forEach(function(queue){
        var Qvalues = queue.split(". ");
        queuesSelected.push(new Queue(Qvalues[1], Qvalues[0] - 1));
      })
    }
  })
}

//============================================
//====== END: handle queue selection =========
//============================================