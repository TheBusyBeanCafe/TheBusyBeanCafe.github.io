// const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";
// const API_URL = "http://127.0.0.1:5000/";

var pass;


async function submitStockUse() {
	object = {
		date: Date.now()
	};
	
	let selectedOption = document.getElementById("current-stock-use").selectedOptions[0].value
	let val = document.getElementById("current-stock-use-count").valueAsNumber

	
	const response = await fetch(API_URL + "stock", {
		headers: {
			'Authorization': 'Basic ' + pass
		}
	});

	let json = await response.json();
	
	const currentStock = json[selectedOption]
	let newStock = currentStock - val;


	object[selectedOption] = newStock;




	if (newStock < 0) {
		document.getElementById("current-stock-use-count").value = ""
		alert("WARNING: stock level less than 0! stock not input")
	}

	if (!isNaN(newStock) && newStock >= 0) {
		document.getElementById("current-stock-use-count").value = ""
		fetch(API_URL + "stock", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			},
			body: JSON.stringify(object)
		})


		document.getElementById("count-" + Object.keys(object)[1]).innerHTML = Object.values(object)[1]
		// ^ this is temporary solution to updating when submit pressed: i couldn't get updStock to update because of async garbage :(
	}
}


// async function getInventory() {
// 	const response = await fetch(API_URL + "stock", {
// 		method: "GET",
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': 'Basic ' + pass
// 		}
// 	});

// 	responseJSON = await response.json();
	
// 	console.log(responseJSON)

// 	return responseJSON;
	
// }

// let inventory = getInventory();

// console.log(inventory);



/* DOESN'T FUCKING WORK AND I DON'T KNOW WHY */
// const titles = {
// 	id: "id",
// 	date: "date",

	
// 	milk_reg: "regular-milk (bottles)",
// 	milk_lite: "lite-milk (bottles)",
// 	milk_oat: "oat-milk (bottles)",
// 	milk_almond: "almond-milk (bottles)",
	
// 	beans: "coffee-beans (bags)",
// 	hc_powder: "hot-chocolate-powder (bags)",

// 	cookies_dark: "dark chocolate cookies (boxes)",
// 	cookies_white: "white chocolate cookies (boxes",

// 	cups_regular: "regular cups (stacks)",
// 	cups_large: "large cups (stacks)",
// 	coffee_holder: "coffee holders (stacks)",

// 	marshmallows: "marshmallows (bags)",
	
// 	cost: "cost"
// };


async function submitStockNew() {
	const response = await fetch(API_URL + "stock", {
		headers: {
			'Authorization': 'Basic ' + pass
		}
	});

	let json = await response.json();


	object = {
		date: Date.now()
	};
	let val = document.getElementById("current-stock-new-count").valueAsNumber
	let val2 = document.getElementById("current-stock-new-cost").valueAsNumber
	
	let selectedOption = document.getElementById("current-stock-new").selectedOptions[0].value;




	




	const currentStock = await json[selectedOption];

	let newStock = await currentStock + val;





	object[selectedOption] = newStock;




	object.cost = val2
	if (!isNaN(newStock) && !isNaN(val2)) {
		document.getElementById("current-stock-new-count").value = ""
		document.getElementById("current-stock-new-cost").value = ""
		


		fetch(API_URL + "stock", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			},
			body: JSON.stringify(object)
		})


		document.getElementById("count-" + Object.keys(object)[1]).innerHTML = Object.values(object)[1];
	}
}

async function updStock() {
	// console.log("updated stock?")
	const resp = await fetch(API_URL + "stock", {
		headers: {
			'Authorization': 'Basic ' + pass
		}
	});
	let json = await resp.json()
	// console.log(json)
	for (var item in json) {
		// console.log(item)
		document.getElementById("count-" + item).innerText = json[item]
		
		if (json[item] <= 1) {
			document.getElementById("dot-" + item).style.backgroundColor = "#e53935";
		} else if (json[item] >= 2 && json[item] <= 5) {
			document.getElementById("dot-" + item).style.backgroundColor = "#fbc02d";
		} else {
			document.getElementById("dot-" + item).style.backgroundColor = "#388e3c";
		}

	}
}


window.addEventListener("load", () => {

	pass = window.sessionStorage.getItem("pass")


	document.getElementById("export-button").addEventListener('click', () => {
		// console.log("p[resssed")
	})

	if (pass == null) {

		window.location.href = "/index.html"
	} else {
		updStock()
	}
})
