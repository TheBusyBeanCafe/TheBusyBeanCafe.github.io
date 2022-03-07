const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";
// const API_URL = "http://127.0.0.1:5000/";





var menu, drink_addons, modal, pass, passmodal, g_api_key, sheets_total_row;

var sugarCount = 0;
let orderedCoffees = [];
var topc = [];



var doneOrders = [];
var donePreorders = [];


if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}


function getPass() {
	passmodal = document.getElementById("pass-modal");
	passmodal.style.display = "flex"
}


async function updateSheetTotalRows() {
	const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1K17iXi_wg8tW_xEf82RiBrYhgW0eKNgPTrIiy6x7VbE?key=' + g_api_key)
	var json = await response.json();
	sheets_total_row = json.sheets[0].properties.gridProperties.rowCount;
}

/*
	0: (IGNORE) timestamp
	1: ORDER NAME
	2: ORDER DATE
	3: ORDER TIME (morning/lunch)
	4: MORNING PICKUP TIME
	5: LUNCH PICKUP TIME
	6: COFFEE
	7: SIZE
	8: MILKS
	9: SYRUPS
	10: SUGARS
*/


async function donepwclicked() {
	pass = btoa(document.getElementById("password").value)
	var res = await getMenuItems(API_URL + "menu")
	if ( res === false) {
		console.log("wrong pass")
		document.getElementById("password").value = ''
		document.getElementById("password").classList.add("pw-invalid")
	} else {
		passmodal.style.display = "none"
		const response = await fetch(API_URL + "g_api_key",
			{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + pass
				}
			});
		g_api_key = await response.json()


		updateSheetTotalRows()

		setInterval(async () => {
			const response2 = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1K17iXi_wg8tW_xEf82RiBrYhgW0eKNgPTrIiy6x7VbE/values/A2:K' + sheets_total_row + '?key=' + g_api_key)
			var json = await response2.json();


			const todayDate = new Date();

			function getCurrentShift(date) {
				let hour = date.getHours();


				if (hour >= 7 && hour <= 9) {
					return "Morning";
				} else if (hour >= 12 && hour <= 14) {
					return "Lunch";
				}
				return "";
			}

			let currentShift = getCurrentShift(todayDate);
			console.log(currentShift);


			console.log(json.values)

			topc = json.values.filter(x => ((new Date(x[x[2] == "" ? 0 : 2])).setHours(0, 0, 0, 0).valueOf() === todayDate.setHours(0, 0, 0, 0).valueOf()) && x[3] == currentShift)


			for (x of json.values) {

				console.log(x[0])
				console.log(x[2])
				console.log(todayDate);
				console.log(new Date(x[x[2] == "" ? 0 : 2]));

				console.log(new Date(x[x[2] == "" ? 0 : 2]).setHours(0, 0, 0, 0) === todayDate.setHours(0, 0, 0, 0))
			}

			console.log(topc)



			if (topc.length > donePreorders.length) {
				let difference = (topc.length - donePreorders.length);

				
				for (var i = 0; i < difference; i++) {
					donePreorders.push(false)
				}
			}


			updPreOrderList();


		}, 10 * 1000);
		// console.log(sheets_total_row)
		// console.log("right pass")
	}
}

function updPreOrderList() {
	let display = ``;

	const ORDER_SUBTEXT = `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">`

	for (coffee of topc) {
		tempBlock = `
		<p onclick="completePreorder(${topc.indexOf(coffee)})" id="preorder${topc.indexOf(coffee)}" class="order-block" style="background: ${donePreorders[topc.indexOf(coffee)] ? "#A5D6A7" : "white"}; word-break: break-all; border-radius: 0.4vw; padding: 0.4vw; margin-top: 0.8vw; margin-bottom: 0.8vw;"><span style="font-weight: 900; margin-left: 0.5vw; margin-right: 1.4vw;">${(coffee[5]) == "Large" ? "L" : "R"}</span>${coffee[6]}
		`

		/* ORDER NAME */
		tempBlock += (ORDER_SUBTEXT + `→ Name: ${coffee[1]}</span>`);
		tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; color: #1976d2; margin-top: 0vw; margin-bottom: 0.5vw;">→ Pickup Time: ${coffee[coffee[3] == "Morning" ? 4 : 5]}</span>`
		
		/* ADDITIONAL INFO */
		// MILK
		if (coffee.length >= 9 && coffee[8] != 0) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">→ Milk: ${coffee[8]}</span>`
		}

		// SYRUP
		if (coffee.length >= 10 && coffee[9] != "") {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">→ Syrup: ${coffee[9]}</span>`
		}

		// SUGARS
		if (coffee.length >= 11 && (coffee[10] != 0 || coffee[10] != "")) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">→ Sugars: ${[coffee[10]]}</span>`
		}
		
		
		
		
		tempBlock += `</p>`

		display += tempBlock;

		document.getElementById("pre-order-list").innerHTML = display;
	}

} 

function completePreorder(index) {
	donePreorders[index] = !donePreorders[index]
	let order = "preorder" + index;

	document.getElementById(order).style.background = donePreorders[index] ? "#A5D6A7" : "white";
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
	fetch(API_URL + "transactions", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + pass
		},
		body: JSON.stringify(coffee)
	})
}



function diagButtonClick(elem) {
	var optional = elem.getAttribute("data-button-optional")
	console.log(optional)
	var type = elem.getAttribute("data-button-group");
	if (optional && elem.classList.contains("dialog-button-selected")) {
		elem.classList.remove("dialog-button-selected")
	} else {
		[].slice.call(document.getElementById("drink-options-content")
			.querySelectorAll("[data-button-group='" + type + "'].dialog-button-selected")).forEach(function(element) {
				element.classList.remove("dialog-button-selected")
			})

		elem.classList.add("dialog-button-selected")
	}
}


var dialogShownObj

function deleteclicked() {
	modal.style.display = 'none';

	fetch(API_URL + "transaction/" + dialogShownObj.id, {
		method: "DELETE",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + pass
		}
	});
	orderedCoffees = orderedCoffees.filter(item => item.id != dialogShownObj.id)
	updCurTransList()
}


function doneclicked() {
	modal.style.display = 'none';
	var choice;

	var newobj = dialogShownObj["id"] == null;

	if (menu[dialogShownObj.index].has_milk) {
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
	}
	
	dialogShownObj["milk"] = choice;

	dialogShownObj["large"] = document.getElementById("drink-options-content").querySelectorAll("[data-button-group='size']")[1].classList.contains("dialog-button-selected");

	dialogShownObj["sugar"] = sugarCount;

	var payelem = document.getElementById("modal-hstack-small2-left").querySelector("[data-button-group='payment'].dialog-button-selected");
	if (payelem) {
		dialogShownObj["payment"] = parseInt(payelem.getAttribute("data-button-value"))
	} else {
		dialogShownObj["payment"] = 0
	}

	var syrupelem = document.getElementById("syrup-container").querySelector("[data-button-group='syrup'].dialog-button-selected");
	if (syrupelem) {
		dialogShownObj["syrup"] = parseInt(syrupelem.getAttribute("data-button-value"))
	} else {
		dialogShownObj["syrup"] = null
	}
	

	sugarCount = 0;

	resetModal();

	doneOrders.push(false);


	if (newobj) {
		dialogShownObj["id"] = uuidv4()
		orderedCoffees.push(dialogShownObj);

		fetch(API_URL + "transactions", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			},
			body: JSON.stringify(dialogShownObj)
		});
	} else {
		fetch(API_URL + "transaction/" + dialogShownObj["id"], {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			},
			body: JSON.stringify(dialogShownObj)
		});
	}

	console.log(dialogShownObj)

	updCurTransList()
}




function coffeeClicked(idx) {
	item = menu[idx]
	if (item.is_drink) {
		modal.style.display = "flex"

		dialogShownObj = {
			index: idx,
			count: 1, // TODO also do post
			sugar: 0,
			date: Date.now(),
			is_done: false
		};
		
		document.getElementById("milk-subtitle").setAttribute("disabled", !item.has_milk);
		document.getElementById("modal-hstack-small1-left").setAttribute("disabled", !item.has_milk);

		document.getElementById("dialog-drink-title").innerHTML = getCurrentOrderItem(idx);
		document.getElementById("add-or-edit-title").innerHTML = "New Order"
		document.getElementById("delete").style.display = "none";
    } else {
		orderedCoffees.push({index: idx, date: Date.now(), id: uuidv4()});
		updCurTransList()
	}
}

function sugarClicked() {
	sugarCount += 1
	
	console.log(sugarCount)

	document.getElementById("sugar-title").innerHTML = `<h2 id="sugar-title" class="button-short-name">S<span style="font-size: 2.4vh">x${sugarCount}</span></h2>`

	if (sugarCount != 0) {
		document.getElementById("sugar-counter-minus").style.display = "block";
	}
}

function sugarMinused() {
	sugarCount = Math.max(sugarCount-1, 0)
	
	console.log(sugarCount)

	document.getElementById("sugar-title").innerHTML = `<h2 id="sugar-title" class="button-short-name">S<span style="font-size: 2.4vh">x${sugarCount}</span></h2>`

	if (sugarCount == 0) {
		document.getElementById("sugar-counter-minus").style.display = "none";
		document.getElementById("sugar-title").innerHTML = `<h2 id="sugar-title" class="button-short-name">S</h2>`
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
				'Authorization': 'Basic ' + pass
			}
		});
	if (response.status == 401) {
		return false
	}
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
				let coffeeButton = document.getElementById("hstack-item" + i);
				
				coffeeButton.style.cursor = 'pointer';
				coffeeButton.onclick = function () {
					coffeeClicked(i)
				}
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
		if (ix==0 || ix == null) {
			return "";
		} else {
			return "→ Milk: " + ["Full", "Lite", "Almond", "Oat", "Trim", "Soy"][ix];
		}
	}

	function getSyrupType(syrup) {
		if (syrup == null) {
			return "";
		} else {
			return "→ Syrup: " + ["Vanilla", "Caramel"][syrup];
		}
	}


	orderedCoffees.forEach(function(element, index) { 
		var orderColour = "white"
		if (doneOrders[index]) {
			orderColour = "#A5D6A7"
		}

		

		tempBlock = `
		<p onclick="completeOrder(${index})" id="order${index}" class="order-block" style="background: ${orderColour}; border-radius: 0.4vw; padding: 0.4vw; margin: 0px; flex-grow: 6;"><span style="font-weight: 900; margin-left: 0.5vw; margin-right: 1.4vw;">${(element.large) ? "L" : "R"}</span>${menu[element.index].long_name}
		`;
		
		
		if (getMilkType(element.milk)!=0) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">${getMilkType(element.milk)}</span>`
		} 

		if (element.syrup != null) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">${getSyrupType(element.syrup)}</span>`
		} 

		if (element.sugar != null && element.sugar != 0) {
			tempBlock += `<br><span style="font-weight: 500; margin-left: 3.2vw; font-size: 1.35vw; margin-top: 0vw; margin-bottom: 0.5vw;">→ Sugars: ${element.sugar}</span>`
		}

		tempBlock += `</p>`;


		outerHflex = `
			<div class="order-hflex">
				${tempBlock}

				<p onclick="editOrder(${index})" class="mdi mdi-36px mdi-pencil edit-text" style="background: #EBEBEB; margin: 0px; border-radius: 0.4vw; padding: 0.4vw;"></p>
			</div>
		`


		display += outerHflex;
		
	});

	
	
	document.getElementById("order-list").innerHTML = display;

	// for (var i = 0; i < (orderedCoffees.length); i++) {
	// 	console.log("RUN")
	// 	console.log(orderedCoffees.length)

	// 	const orderId = "order" + (i);

	// 	console.log(orderId);

		

	// 	var coffeeElement = document.getElementById(orderId);

	// 	console.log(coffeeElement);

	// 	coffeeElement.addEventListener("click", completeOrder(i));
	// 	coffeeElement.addEventListener("long-press", editOrder(i))
	// }
}




function completeOrder(idx) {
	doneOrders[idx] = !doneOrders[idx]

	const orderId = "order" + idx

	console.log(orderId);

	document.getElementById(orderId).style.background = (doneOrders[idx] ? "#A5D6A7" : "white");
}



function editOrder(idx) {
	modal.style.display = "flex"

	dialogShownObj = orderedCoffees[idx];

	document.getElementById("dialog-drink-title").innerHTML = getCurrentOrderItem(dialogShownObj.index);
	document.getElementById("add-or-edit-title").innerHTML = "Edit Order";

	document.getElementById("delete").style.display = "block";

	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group].dialog-button-selected")).forEach(function(element) {
			element.classList.remove("dialog-button-selected")
		});

	document.getElementById("milk-subtitle").setAttribute("disabled", !menu[dialogShownObj.index].has_milk);
	document.getElementById("modal-hstack-small1-left").setAttribute("disabled", !menu[dialogShownObj.index].has_milk);

	if (dialogShownObj.milk != null) {
		document.getElementById("drink-options-content").querySelectorAll("[data-button-group='milk']")[dialogShownObj.milk].classList.add("dialog-button-selected")
	}
	document.getElementById("drink-options-content").querySelectorAll("[data-button-group='size']")[ + dialogShownObj.large].classList.add("dialog-button-selected");
	if (dialogShownObj.syrup !== null ) {
		document.getElementById("syrup-container").querySelectorAll("[data-button-group='syrup']")[dialogShownObj.syrup].classList.add("dialog-button-selected");
	}
	console.log(dialogShownObj.payment)
	// -1 because 0 is cash
	document.getElementById("modal-hstack-small2-left").querySelectorAll("[data-button-group='payment']")[dialogShownObj.payment - 1].classList.add("dialog-button-selected");
	
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

function showPreOrders() {
	document.getElementById("preorders-button").addEventListener("click", () => {
		document.getElementById("pre-orders").style.display = "flex";
		document.getElementById("orders").style.display = "none"
	})
}


function showNormalOrders() {
	document.getElementById("preorders-return-button").addEventListener("click", () => {
		document.getElementById("pre-orders").style.display = "none";
		document.getElementById("orders").style.display = "flex"
	})
}



function endShift() {
	document.getElementById("endshift-button").addEventListener("click", () => {
		

		document.getElementById("endshift-button").style.display = "none";
		document.getElementById("preorders-button").style.display = "none";

		document.getElementById("confirm-endshift-button").style.display = "block";
		document.getElementById("cancel-endshift-button").style.display = "block";

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
	document.getElementById("preorder-sub").innerHTML = getOrderSubText();
	
	

	let buttons = document.getElementsByClassName("bar-button")
	for (button of buttons) {
		button.style.cursor = "pointer";
	}

	endShift();
	confirmCancelEnd();
	showPreOrders();
	showNormalOrders();

	

	

	// for (button of document.getElementsByClassName("dialog-button")) {
	// 	console.log(button);

	// 	button.classList.remove("hover-effect");
	// }
	
	

});

function resetModal() {
	document.getElementById("sugar-counter-minus").style.display = "none";
	document.getElementById("sugar-title").innerHTML = `<h2 id="sugar-title" class="button-short-name">S</h2>`;


	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-group].dialog-button-selected")).forEach(function(element) {
			element.classList.remove("dialog-button-selected")
		});


	[].slice.call(document.getElementById("drink-options-content")
		.querySelectorAll("[data-button-default='true'")).forEach(function(element) {
			element.classList.add("dialog-button-selected")
		});
}

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
		resetModal();
	}
}
