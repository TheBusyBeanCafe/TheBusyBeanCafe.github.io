const API_SHIFT_URL = "https://thebusybeancafeapi.azurewebsites.net/shifts"
// const API_SHIFT_URL = "http://127.0.0.1:5000/shifts";
const API_URL = "https://thebusybeancafeapi.azurewebsites.net/"
// const API_URL = "http://127.0.0.1:5000/";

function getCurrentDate() {

	return [hour, day]

}

var pass

function getPass() {
	passmodal = document.getElementById("pass-modal");
	passmodal.style.display = "flex"
}

function authed() {
		getIntroText(API_SHIFT_URL);
		shiftNavigation();
}

async function getMenuItems(url) {
	const response = await fetch(url,
		{
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			}
		});
	if (response.status == 401) {
		return false
	}
}

async function donepwclicked() {
	pass = btoa(document.getElementById("password").value)
	// TODO use shifts not this
	var res = await getMenuItems(API_URL + "menu")
	if ( res === false) {
		document.getElementById("password").value = ''
		document.getElementById("password").classList.add("pw-invalid")
	} else {
		passmodal.style.display = "none"
		sessionStorage.setItem('pass', pass);
		authed()
	}
}

if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}


async function getIntroText(url) {
	function getShiftSub() {

		var currentDate = new Date();
		var hour = currentDate.getHours();
		var day = currentDate.getDay();

		// hour = 13;

		var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
		
		
		function getShiftName(hour) {
			if (hour >= 7 && hour <= 9) {
				return ", Morning Shift";
			} else if (hour >= 12 && hour <= 14) {
				return ", Lunch Shift";
			} else {
				return ", (No Shift Selected)";
			}
		}

		return weekday + getShiftName(hour);
	}

	document.getElementById("shift-sub").textContent = getShiftSub();

	


	var currentDate = new Date();
	var hour = currentDate.getHours();
	var day = currentDate.getDay();
	
	// hour = 13;

	var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
	


	// intro text message
	var dateMessage = "";
	var currentShift = true;
	var shiftNumber = 0;


	introText = "";

	// define intro text
	if (hour >= 7 && hour <= 9) {
		dateMessage = "Good Morning,"
	} else if (hour >= 12 && hour <= 14) {
		dateMessage = "Good Afternoon,"
		shiftNumber = 1
	} else {
		currentShift = false
		dateMessage = "Hello!"
	}

	introText += dateMessage;



	// define name message
	var nameMessage = "";

	if (day != 0 && day != 6) {
		if (currentShift) {
			const response = await fetch(url);
			json = await response.json()

			nameMessage += json[day-1][shiftNumber][0] + " & " + json[day-1][shiftNumber][1];
		}
	} 


	document.getElementById("main-heading").innerHTML = `<h1><span style="font-family:visbyround-bold">${dateMessage}</span> ${nameMessage}</h1>`



	return introText
}


function shiftNavigation() {
	var startShift = document.getElementById('shift-rectangle');
	
	startShift.style.cursor = 'pointer';
	startShift.onclick = function() {
		window.location.href = "./orderpage.html";
	};

}



window.addEventListener("load", () => {
	pass = window.sessionStorage.getItem("pass")
	if (pass == null) {
		getPass()
	} else {
		authed()
	}
});



