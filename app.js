

const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";





var menu, drink_addons, modal, pass, passmodal;

let orderedCoffees = [];

addEventListener("load", () => {
})

function getPass() {
	passmodal = document.getElementById("pass-modal");
	passmodal.style.display = "flex"
}

function donePwclicked() {
	getMenuItems(API_URL + "menu");
}


function getOrderSubText() {
	var currentDate = new Date();
	var hour = currentDate.getHours();
	var day = currentDate.getDay();
	
	/* ****************** */

	/*
	day = 4;
	hour = 8;
	*/
	
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

function postCoffee(coffee) {
	console.log(coffee)
	fetch(API_URL + "transactions", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic Q8xTy1zafJmh4R/p9bh11eOcUad/gjoRIeeU214lgtw='
		},
		body: JSON.stringify(coffee)
	})
}



function diagButtonClick(elem) {
	var type = elem.getAttribute("data-button-group");
	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group='" + type + "'].dialog-button-selected")).forEach(function(element) {
			element.classList.remove("dialog-button-selected")
		})
	elem.classList.add("dialog-button-selected")
}


var dialogShownObj


function doneclicked() {
	modal.style.display = 'none';
	var choice;

	var newobj = dialogShownObj["id"] == null;

	console.log(newobj);

	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group='milk']"))
		.every( (el, idx) => {
			if (el.classList.contains("dialog-button-selected")) {
				choice = idx
				return false
			}
			return true
		}
	)
	
	dialogShownObj["date"] = Date.now()
	
	dialogShownObj["milk"] = choice;

	dialogShownObj["large"] = document.getElementById("drink-options-content").querySelectorAll("[data-button-group='size']")[1].classList.contains("dialog-button-selected");


	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group].dialog-button-selected")).forEach(function(element) {
			element.classList.remove("dialog-button-selected")
		});


	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-default='true'")).forEach(function(element) {
			element.classList.add("dialog-button-selected")
		});



	if (newobj) {
		dialogShownObj["id"] = uuidv4()
		orderedCoffees.push(dialogShownObj);
		console.log(dialogShownObj);

		fetch(API_URL + "transactions", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic Q8xTy1zafJmh4R/p9bh11eOcUad/gjoRIeeU214lgtw='
			},
			body: JSON.stringify(dialogShownObj)
		});
	} else {
		fetch(API_URL + "transaction/" + dialogShownObj["id"], {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic Q8xTy1zafJmh4R/p9bh11eOcUad/gjoRIeeU214lgtw='
			},
			body: JSON.stringify(dialogShownObj)
		});
	}

	updCurTransList()
}



function coffeeClicked(idx) {
	item = menu[idx]
	if (item.is_drink) {
		modal.style.display = "flex"

		dialogShownObj = {
			index: idx,
			count: 1, // TODO also do post
			is_done: false
		}

		document.getElementById("dialog-drink-title").innerHTML = getCurrentOrderItem(idx);
    } else {
		orderedCoffees.push({index: idx, date: Date.now()});
		updCurTransList()
	}
}


function getCurrentDate() {
	var currentDate = new Date();
	var date = currentDate.getHours();
	
	if (date > 7 && date < 9) {
		return "Good Morning, "
	} else if (date > 12 && date < 2) {
		return "Good Afternoon, "
	} else {
		return "Hello!"
	}
}

function getCurrentName() {
	data = asyncFetch(API_URL + "shift");
	console.log(data);
}

async function asyncFetch(url) {
	const response = await fetch(url);
	json = await response.json()
	
	return json
}

function getIntroText() {
	var introText = "";
	introText += getCurrentDate()
	
	getCurrentName();
}

async function getMenuItems(url) {
	const response = await fetch(url,
		{
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic Q8xTy1zafJmh4R/p9bh11eOcUad/gjoRIeeU214lgtw='
			}
		});
	json = await response.json();
	menu = json["menu"]
	drink_addons = json["drink_addons"]
	
	displayData(menu);
}

function displayData(data) {
	function addClickListener() {
		for (let i = 0; i <= data.length; i++) {
			if (i == 8) { // cookie
				console.log("cookie");
			} else if (i == 9) {  //extras menu
				console.log("extras menu");
			} else {
				let coffeeButton = document.getElementById("hstack-item" + i);
				
				coffeeButton.style.cursor = 'pointer';
				coffeeButton.onclick = function () {
					coffeeClicked(i)
				}
			}
		}
	}
	
	function setFunc() {
		data.forEach(function(element, index) { 
			let itemName = "hstack-item" + index;
			
			console.log(itemName);
			
			if (index > 1 && index != 8 && index != 9) {
				document.getElementById(itemName).innerHTML = `
				<p class="button-title-small">${element.short_name}</p>
				<p class="button-sub-small">${element.long_name}</p>
				`
			} else if (index == 8) {
				document.getElementById(itemName).innerHTML = `
				<p class="button-title-big">${element.short_name}</p>
				<p class="button-sub-big">${element.long_name}</p>
				`
				
				
				itemName = "hstack-item" + (index + 1);
				document.getElementById(itemName).innerHTML = `
				<p class="button-sub-big">Other</p>
				`
				
			} else {
				document.getElementById(itemName).innerHTML = `
				<p class="button-title-big">${element.short_name}</p>
				<p class="button-sub-big">${element.long_name}</p>
				`
			}
		})
	}
	
	
	if ( document.readyState == 'complete' ) {
		setFunc();
		addClickListener();
	} else {
		addEventListener("load", () => {
			setFunc();
			addClickListener();
		})
	}
}


function getCurrentOrderItem(index) {
	return menu[index].long_name;
}

function updCurTransList() {
	var display = '';
	//var total = 0;
	
	function getMilkType(ix) {
		if (ix==0) {
			return "";
		} else {
			return "→ Milk: " + ["Full", "Lite", "Almond", "Oat", "Trim", "Soy"][ix];
		}
	}


	orderedCoffees.forEach(function(element, index) { 
		tempBlock = `
		<p onclick="completeOrder(${index})" id="order${index}" class="order-block" style="background: white; border-radius: 0.4vw; padding: 0.4vw; margin-top: 0.8vw; margin-bottom: 0.8vw;"><span style="font-weight: 900; margin-left: 0.5vw; margin-right: 1.4vw;">${(element.large) ? "L" : "R"}</span>${menu[element.index].long_name}
		`;
		
		
		if (getMilkType(element.milk)!=0) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">${getMilkType(element.milk)}</span>`
		} else {
			tempBlock += `</p>`
		}



		display += tempBlock;
		
	});

	
	document.getElementById("order-list").innerHTML = display;

/*
		let elementId = "order" + element.index;


		let tempOrderBlock = document.getElementById(elementId);
		tempOrderBlock.addEventListener("click", () => {
			tempOrderBlock.style.background="green";
		})
*/
}

function completeOrder(idx) {
	modal.style.display = "flex"

	dialogShownObj = orderedCoffees[idx];

	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group].dialog-button-selected")).forEach(function(element) {
			element.classList.remove("dialog-button-selected")
		});

	document.getElementById("drink-options-content").querySelectorAll("[data-button-group='milk']")[dialogShownObj.milk].classList.add("dialog-button-selected")
	document.getElementById("drink-options-content").querySelectorAll("[data-button-group='size']")[ + dialogShownObj.large].classList.add("dialog-button-selected");

	
	/*
	if (el.is_done) {
		el.style.background="white";
	} else {
		if (el.style.background.split(" ")[0] == "white") {
			el.is_done = true;
			el.style.background="#A5D6A7";
		}
	}
	*/
}


function endShift() {
	document.getElementById("endshift-button").addEventListener("click", () => {
		

		document.getElementById("endshift-button").style.display = "none";
		document.getElementById("preorders-button").style.display = "none";

		document.getElementById("confirm-endshift-button").style.display = "block";
		document.getElementById("cancel-endshift-button").style.display = "block";

		console.log("pressed")
	})
}

function confirmCancelEnd() {
	document.getElementById("confirm-endshift-button").addEventListener("click", () => {
		alert("shift ended!");
		window.location.href = "./index.html";
	})

	document.getElementById("cancel-endshift-button").addEventListener("click", () => {
		document.getElementById("endshift-button").style.display = "block";
		document.getElementById("preorders-button").style.display = "block";

		document.getElementById("confirm-endshift-button").style.display = "none";
		document.getElementById("cancel-endshift-button").style.display = "none";
	})
}

window.addEventListener("load", () => {
	if (pass == null) {
		getPass()
	}


	getCurrentDate();
	modal = document.getElementById("drink-options-modal");
	


	document.getElementById("order-sub").innerHTML = getOrderSubText();
	
	

	let buttons = document.getElementsByClassName("bar-button")
	for (button of buttons) {
		button.style.cursor = "pointer";
	}

	endShift();

	confirmCancelEnd();

	// for (button of document.getElementsByClassName("dialog-button")) {
	// 	console.log(button);

	// 	button.classList.remove("hover-effect");
	// }
	
	

});

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}
