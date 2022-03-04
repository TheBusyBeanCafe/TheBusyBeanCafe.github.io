// const API_SHIFT_URL = "https://thebusybeancafeapi.azurewebsites.net/shifts"
const API_SHIFT_URL = "http://127.0.0.1:5000/shifts";

function getCurrentDate() {

	return [hour, day]

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
	getIntroText(API_SHIFT_URL);
	shiftNavigation();
});



