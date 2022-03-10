const API_URL = "http://127.0.0.1:5000/";

var pass;


function submitStockUse() {
	console.log('hi')
	object = {
		date: Date.now()
	};
	object[document.getElementById("current-stock-use").selectedOptions[0].value] = document.getElementById("current-stock-use-count").valueAsNumber
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



function submitStockNew() {
	console.log('hi')
	object = {
		date: Date.now()
	};
	object[document.getElementById("current-stock-use").selectedOptions[0].value] = document.getElementById("current-stock-use-count").valueAsNumber
	object.cost = document.getElementById("current-stock-new-cost").valueAsNumber
	fetch(API_URL + "stock", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + pass
		},
		body: JSON.stringify(object)
	})
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
