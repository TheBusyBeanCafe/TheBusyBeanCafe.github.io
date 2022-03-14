const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";

var pass;


function submitStockUse() {
	console.log('hi')
	object = {
		date: Date.now()
	};
	let val = document.getElementById("current-stock-use-count").valueAsNumber
	object[document.getElementById("current-stock-use").selectedOptions[0].value] = val
	if (!isNaN(val)) {
		console.log(val)
		document.getElementById("current-stock-use-count").value = ""
		fetch(API_URL + "stock", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + pass
			},
			body: JSON.stringify(object)
		})
		console.log(object)
	}
}



function submitStockNew() {
	console.log('hi')
	object = {
		date: Date.now()
	};
	let val = document.getElementById("current-stock-new-count").valueAsNumber
	let val2 = document.getElementById("current-stock-new-cost").valueAsNumber
	
	object[document.getElementById("current-stock-new").selectedOptions[0].value] = val
	object.cost = val2
	if (!isNaN(val) && !isNaN(val2)) {
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
	}
}




window.addEventListener("load", () => {
	console.log('balls')
	pass = window.sessionStorage.getItem("pass")
	console.log(pass)
	if (pass == null) {
		console.log("uh o")
		window.location.href = "/index.html"
	} else {
		initpreorder()
		getMenuItems(API_URL + "menu")
	}
})
