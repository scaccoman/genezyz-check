// var soundAlert = new Audio();        // create the audio object
// 	soundAlert.src = "./sounds/bomb_sirene_short.mp3";
var sound = {
	file: new Audio(),
	mute: false
}
	sound.file.src = "./sounds/bomb_sirene_short.mp3"
var lastQueueName = "";

setSound();

//listens for messages coming from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.notify) {
    	sendResponse({success: true, message: "notification triggered"});
    	notify(request.notify.queueName);
    } else if (request.sound){
    	sendResponse({success: true, message: "sound settings changed"});
    	sound.mute = request.sound.mute;
    	console.log(sound.mute);
    }
});

//create the notification
function notify(queueName){
	chrome.notifications.create(
    queueName,{   
    type: 'basic', 
    iconUrl: './images/alert.png', 
    title: "Call in the queue!", 
    message: "There is a new call in " + queueName
    },
	function(queueName) {
		// play the alert and focus on genesys tab
		if (queueName !== lastQueueName && sound.mute === false){
			sound.file.play();
		}
		lastQueueName = queueName;
		chrome.notifications.onClicked.addListener(function(queueName){
			sound.file.pause();
			sound.file.currentTime = 0;
			focusOnGenesysTab();
		})
	} 
	);
}

//try to not spam the user with notifications - TODO: implement more specific logic to store timestamp of notification
setInterval(function(){
	lastQueueName = "";
}, 100000);

//check open tabs and focus on the Genesys one
function focusOnGenesysTab(){
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].url === "https://netsuite-wwe-usw1.genesyscloud.com/ui/ad/v1/index.html"){
				var updateProperties = {"active": true};
				chrome.tabs.update(tabs[i].id, updateProperties, function(tab){ console.log("focused on tab: " + tab.id)});
				return;
			}
		}
	});
}

function setSound(){
    chrome.storage.sync.get(["sound"], function(items){
        if (items.sound) {
            sound.mute = items.sound.mute;
        }
    });
}