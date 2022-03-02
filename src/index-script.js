const API_SHIFT_URL = "http://127.0.0.1:5000/shifts";

function getCurrentDate() {

	return [hour, day]

}



async function getIntroText(url) {
	var introText = "";

	var currentDate = new Date();
	var hour = currentDate.getHours();
	var day = currentDate.getDay();
	
	/* *********************/

	/*
	day = 4;
	hour = 8;
	*/

	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	var weekday = weekdays[day]


	function getShiftName(hour) {
		if (hour >= 7 && hour <= 9) {
			return "Morning Shift";
		} else if (hour >= 12 && hour <= 14) {
			return "Lunch Shift";
		} else {
			return "";
		}
	}

	var shift = getShiftName(hour);


	document.getElementById("shift-sub").textContent = weekday + ", " + shift;

	

	// sunday = 0 saturday = 6

	




	var dateMessage = "";

	var currentShift = true;
	var shiftNumber = 0;

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


	var nameMessage = "";


	if (day != 0 && day != 6) {
		if (currentShift) {
			const response = await fetch(url);
			json = await response.json()

			nameMessage += json[day-1][shiftNumber][0] + " & " + json[day-1][shiftNumber][1];
		}
	} else {
		console.log("saturday sunday")
	}


	document.getElementById("main-heading").innerHTML = `<h1><span style="font-family:visbyround-bold">${dateMessage}</span> ${nameMessage}</h1>`


	console.log(dateMessage)

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



