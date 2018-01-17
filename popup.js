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
setInterval(getStoredTime, 5000);

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
//======= START: User event listeners ========
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
                }
            }
        }
    });
}

function setMonitoringTime() {
    getStoredTime();
    if (startTime === "" && endTime === "") {
        resetTime();
    } else {
        getStoredTime();
    }
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
function getStoredTime() {
  chrome.storage.sync.get(["timeStart", "timeEnd"], function(items){
    if (items) {
      if (items.timeStart && items.timeEnd) {
        if (items.timeStart !== "" && items.timeEnd !== "") {
          var timeRange = {
                            start: items.timeStart,
                            end: items.timeEnd
                           };
          checkTimeRange(timeRange);
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
        hideSpinner(false);
      } else {
        hideSpinner(true);
      }
    }
  }
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
//     [{
//          id: 0,
//          name: "Account_Administration_VQ"
//      },
//      {
//          id: 1,
//          name: "CRM_Marketing_VQ"
//      },
//      {
//          id: 2,
//          name: "CRM_Sales_Force_Automation_VQ"
//      },
//      {
//          id: 3,
//          name: "CRM_Support_Management_VQ"
//      },
//      {
//          id: 4,
//          name: "CSV_Imports_CRM_VQ"
//      },
//      {
//          id: 5,
//          name: "CSV_Imports_Custom_Records_VQ"
//      },
//      {
//          id: 6,
//          name: "CSV_Imports_ERP_and_Payroll_VQ"
//      },
//      {
//          id: 7,
//          name: "Customer_Service_VQ"
//      },
//      {
//          id: 8,
//          name: "ERP_Advanced_Accounting_and_One_World_VQ"
//      },
//      {
//          id: 9,
//          name: "ERP_Basic_Accounting_VQ"
//      },
//      {
//          id: 10,
//          name: "ERP_Manufacturing_VQ"
//      },
//      {
//          id: 11,
//          name: "ERP_NS_Financial_Planning_VQ"
//      },
//      {
//          id: 12,
//          name: "ERP_NS_SRP_VQ"
//      },
//      {
//          id: 13,
//          name: "ERP_Order_to_Cash_VQ"
//      },
//      {
//          id: 14,
//          name: "ERP_Procure_to_Pay_VQ"
//      },
//      {
//          id: 15,
//          name: "ERP_Supply_Chain_Management_VQ"
//      },
//      {
//          id: 16,
//          name: "ERP_Warehouse_Management_System_VQ"
//      },
//      {
//          id: 17,
//          name: "Gold_Customer_Service_VQ"
//      },
//      {
//          id: 18,
//          name: "Japanese_VQ"
//      },
//      {
//          id: 19,
//          name: "Mobile_Devices_VQ"
//      },
//      {
//          id: 20,
//          name: "Monexa_VQ"
//      },
//      {
//          id: 21,
//          name: "NewHire_VQ"
//      },
//      {
//          id: 22,
//          name: "NS_Performance_VQ"
//      },
//      {
//          id: 23,
//          name: "ODBC_VQ"
//      },
//      {
//          id: 24,
//          name: "OMXSupport_VQ"
//      },
//      {
//          id: 25,
//          name: "OpenAir_VQ"
//      },
//      {
//          id: 26,
//          name: "Payroll_VQ"
//      },
//      {
//          id: 27,
//          name: "Platinum_NS_VQ"
//      },
//      {
//          id: 28,
//          name: "Platinum_OpenAir_VQ"
//      },
//      {
//          id: 29,
//          name: "Platinum_Team_1_APAC_VQ"
//      },
//      {
//          id: 30,
//          name: "Platinum_Team_1_NoAm_Eastern_VQ"
//      },
//      {
//          id: 31,
//          name: "Platinum_Team_2_AU_VQ"
//      },
//      {
//          id: 32,
//          name: "Platinum_Team_2_NoAm_Eastern_VQ"
//      },
//      {
//          id: 33,
//          name: "Platinum_Team_3_AU_VQ"
//      },
//      {
//          id: 34,
//          name: "Platinum_Team_3_NoAm_Central_VQ"
//      },
//      {
//          id: 35,
//          name: "Platinum_Team_3_NoAm_Eastern_VQ"
//      },
//      {
//          id: 36,
//          name: "Platinum_Team_4_NoAm_Central_VQ"
//      },
//      {
//          id: 37,
//          name: "Platinum_Team_4_NoAm_Mountain_VQ"
//      },
//      {
//          id: 38,
//          name: "Platinum_Team_4_UK-EMEA_VQ"
//      },
//      {
//          id: 39,
//          name: "Platinum_Team_5_NoAm_Mountain_VQ"
//      },
//      {
//          id: 40,
//          name: "Platinum_Team_5_NoAm_Pacific_VQ"
//      },
//      {
//          id: 41,
//          name: "Platinum_Team_6_NoAm_Pacific_VQ"
//      },
//      {
//          id: 42,
//          name: "Point_of_Sale_VQ"
//      },
//      {
//          id: 43,
//          name: "Premiere_Payroll_VQ"
//      },
//      {
//          id: 44,
//          name: "RPAccount_Administration_VQ"
//      },
//      {
//          id: 45,
//          name: "RPCRM_Marketing_VQ"
//      },
//      {
//          id: 46,
//          name: "RPCRM_Sales_Force_Automation_VQ"
//      },
//      {
//          id: 47,
//          name: "RPCRM_Support_Management_VQ"
//      },
//      {
//          id: 48,
//          name: "RPCSV_Imports_CRM_VQ"
//      },
//      {
//          id: 49,
//          name: "RPCSV_Imports_Custom_Records_VQ"
//      },
//      {
//          id: 50,
//          name: "RPCSV_Imports_ERP_and_Payroll_VQ"
//      },
//      {
//          id: 51,
//          name: "RPCustomer_Service_VQ"
//      },
//      {
//          id: 52,
//          name: "RPERP_Advanced_Accounting_and_One_World_VQ"
//      },
//      {
//          id: 53,
//          name: "RPERP_Basic_Accounting_VQ"
//      },
//      {
//          id: 54,
//          name: "RPERP_Manufacturing_VQ"
//      },
//      {
//          id: 55,
//          name: "RPERP_NS_Financial_Planning_VQ"
//      },
//      {
//          id: 56,
//          name: "RPERP_NS_SRP_VQ"
//      },
//      {
//          id: 57,
//          name: "RPERP_Order_to_Cash_VQ"
//      },
//      {
//          id: 58,
//          name: "RPERP_Procure_to_Pay_VQ"
//      },
//      {
//          id: 59,
//          name: "RPERP_Supply_Chain_Management_VQ"
//      },
//      {
//          id: 60,
//          name: "RPERP_Warehouse_Management_System_VQ"
//      },
//      {
//          id: 61,
//          name: "RPGold_Customer_Service_VQ"
//      },
//      {
//          id: 62,
//          name: "RPMobile_Devices_VQ"
//      },
//      {
//          id: 63,
//          name: "RPNS_Performance_VQ"
//      },
//      {
//          id: 64,
//          name: "RPODBC_VQ"
//      },
//      {
//          id: 65,
//          name: "RPPayroll_VQ"
//      },
//      {
//          id: 66,
//          name: "RPPoint_of_Sale_VQ"
//      },
//      {
//          id: 67,
//          name: "RPSiteBuilder_and_Basic_WebStore_VQ"
//      },
//      {
//          id: 68,
//          name: "RPSuiteBuilder_VQ"
//      },
//      {
//          id: 69,
//          name: "RPSuiteCommerceAdvanced_VQ"
//      },
//      {
//          id: 70,
//          name: "RPSuiteCommerceInStore_VQ"
//      },
//      {
//          id: 71,
//          name: "RPSuiteFlow_VQ"
//      },
//      {
//          id: 72,
//          name: "RPSuiteScript_SuiteTalk_SuiteBundler_including_SSO_VQ"
//      },
//      {
//          id: 73,
//          name: "SiteBuilder_and_Basic_WebStore_VQ"
//      },
//      {
//          id: 74,
//          name: "SuiteBuilder_VQ"
//      },
//      {
//          id: 75,
//          name: "SuiteCommerceAdvanced_VQ"
//      },
//      {
//          id: 76,
//          name: "SuiteCommerceInStore_VQ"
//      },
//      {
//          id: 77,
//          name: "SuiteFlow_VQ"
//      },
//      {
//          id: 78,
//          name: "SuiteScript_SuiteTalk_SuiteBundler_including_SSO_VQ"
//      },
//      {
//          id: 79,
//          name: "SuiteWorld_VQ"
//      },
//      {
//          id: 80,
//          name: "TSANet_VQ"
//      },
//      {
//          id: 81,
//          name: "VendaSupport_VQ"
//      }
//  ]