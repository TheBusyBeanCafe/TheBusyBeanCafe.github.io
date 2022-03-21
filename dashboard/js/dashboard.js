const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";
// const API_URL = "http://127.0.0.1:5000/";

const COFFEE_TYPES = ["Hot Chocolate", "Flat White", "Espresso", "Americano", "Cappuccino", "Long Black", "Piccolo", "Mocha", "Cookie"];

var pass;

async function fetchData() {
	const response = await fetch(API_URL + "transactions", {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + pass
		}
	});

	responseJSON = await response.json();

	return responseJSON;
}

let currentDate = Date.now();

function getRevenuePerDay(response, period, paid) {
	var res = new Array(period);
	let tempDate = new Date();

	for (let item of response) {
		var ix = Math.floor((tempDate - (new Date(item["date"])).setHours(0, 0, 0, 0)) / 86400000)



		if (ix < period) {
			if (res[ix] == undefined) {
				res[ix] = [];
			} else {
				res[ix].push(item)
			}
		}
	}

	console.log(res);


	let revenueArray = new Array(period);

	for (var i = 0; i < res.length; i++) {
		if (res[i] !== undefined) {
			if (paid) {
				// revenueArray[i] = (res[i].map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur, 0)));	

				revenueArray[i] = (res[i].map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5))).reduce((prev, cur) => prev + cur, 0);
			} else {
				revenueArray[i] = (res[i].map(x => (x["payment"] == 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur, 0)));
			}
			
		} else {
			revenueArray[i] = 0;
		}

	}

	revenueArray.reverse()

	return revenueArray;
}

function getRange(response, range) {
	return (response.filter(x => x["date"] <= currentDate && x["date"] >= (currentDate - range)))
}

function getCoffeesSold(response, days) {		

	return getRange(response, 86_400_000*days).length // todo link custom date
}

function getItemAll(response) {
	const curYear = new Date().getFullYear()

	return response.filter(x => (new Date(x["date"]).getFullYear()) == curYear).length;
}

function getRevenueAll(response) {
	const curYear = new Date().getFullYear()


	return response.filter(x=> (new Date(x["date"]).getFullYear()) == curYear).map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur));
}

function getRevenue(response) {
	return getRange(response, 604_800_000).map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur));
}

function getFreeCoffeeAmount(response) {
	return getRange(response, 604_800_000).map(x => (x["payment"] == 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur));
}

function getDays(period) {
	let currentDate = new Date();
	let tempDate = new Date();

	let res = [];

	for (let i = 0; i < period; i++) {
		let temp = new Date(tempDate.setDate(currentDate.getDate() - i)).toLocaleDateString("en-NZ", { weekday: 'short'});
		res.push(temp);
	}

	res.reverse();
	return res;
}

function getItemTypes(response) {
	const occs = response.map(x => x["index"]).reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});

	var sorted = [];
	for (var coffee in occs) {
		sorted.push([coffee, occs[coffee]])
	}

	sorted.sort((a, b) => b[1] - a[1]);

	return [sorted.map(x => COFFEE_TYPES[x[0]]), sorted.map(x => x[1])]
}

function getNumberPerDay(response, range, amount) {
	var paid = new Array(range);
	var free = new Array(range);
	let tempDate = new Date();

	for (let item of response) {
		var ix = Math.floor((tempDate - (new Date(item["date"])).setHours(0, 0, 0, 0)) / amount)

		if (ix < range) {
			if (paid[ix] == undefined) {
				paid[ix] = [];
			} else if (item["payment"] != 3) {
				paid[ix].push(item);
			} 

			if (free[ix] == undefined) {
				free[ix] = [];
			} else if (item["payment"] == 3) {
				free[ix].push(item);
			}
		}

		// PAID

	}
	
	let paidFinal = paid.map(x => x.length);
	let freeFinal = free.map(x => x.length);
	
	return [paidFinal.reverse(), freeFinal.reverse()];
}

function getPercentageEftpos(response) {
	const afterEftposIntroduction = response.filter(x => (x["date"] >= 1646068442000))

	const eftposCount = afterEftposIntroduction.filter(x => x["payment"] == 1).length
	const totalCount = afterEftposIntroduction.filter(x => x["payment"] != 1).length
	
	let res = (eftposCount / totalCount).toFixed(2);



	return res;
}

function getPercentageLarge(response) {
	const largeOrders = response.filter(x => x["large"]).length
	const totalNum = response.length


	return (largeOrders / totalNum).toFixed(2);
}

function getAdditionalItems(response) {
	let tempDate = new Date();

	res = new Array(14);

	for (let item of response) {
		var ix = Math.floor((tempDate - (new Date(item["date"])).setHours(0, 0, 0, 0)) / 86400000)

		
		if (ix < 14) {
			if (res[ix] == undefined) {
				res[ix] = [];
			} else {
				res[ix].push(item);
			}
		}
	}

	final = res.map(y => y.filter(x => (x["milk"] != 0 && x["milk"] != null) || x["sugar"] != 0 || x["syrup"] != null).length);

	final = final.filter(x => x != undefined)

	count = final.reduce((prev, cur) => prev + cur, 0)




	return [count, final]
}





function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}



function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}











pass = window.sessionStorage.getItem("pass")
if (pass == null) {
	window.location.href = "../index.html"
}

let fetchedData = fetchData();

window.addEventListener("load", () => {



	var dailyRevenue;
	var freeRevenue;
	var dayNames;



	fetchedData.then(value => {
		dailyRevenue = getRevenuePerDay(value, 14, true);
		freeRevenue = getRevenuePerDay(value, 14, false);
		document.getElementById("revenue-week").innerHTML = "$" + getRevenue(value);	
		document.getElementById("coffees-sold-week").innerHTML = getCoffeesSold(value, 7);	
		document.getElementById("free-week").innerHTML = "$" + getFreeCoffeeAmount(value);
		document.getElementById("revenue-all").innerHTML = "$" + getRevenueAll(value);
		document.getElementById("coffees-sold-all").innerHTML = getItemAll(value);

		const dayNames = getDays(14);

		const coffeeTypes = getItemTypes(value);

		const coffeeNumbers = getNumberPerDay(value, 14, 86400000);

		const eftposPercentage = getPercentageEftpos(value);

		const largePercentage = getPercentageLarge(value);

		const additionalItems = getAdditionalItems(value);

		document.getElementById("items-sold-fortnight").innerHTML = getCoffeesSold(value, 14);	

		const titles = {
			id: "id",
			index: "item-index",
			large: "large",
			date: "date",
			
			sugar: "sugar",

			milk: "milk-type",
			payment: "payment-type",
			syrup: "syrup-type"
			
		};

		document.getElementById("export-button").addEventListener("click", () => {
			exportCSVFile(titles, value, "thebusybeancafe-data-export");
		});


		(function($) {
			'use strict';
			$(function() {
				if ($("#performaneLine").length) {
					var graphGradient = document.getElementById("performaneLine").getContext('2d');
					var graphGradient2 = document.getElementById("performaneLine").getContext('2d');
		
					var saleGradientBg = graphGradient.createLinearGradient(5, 0, 5, 100);

					saleGradientBg.addColorStop(0, 'rgba(210, 120, 66, 0.18)');
					saleGradientBg.addColorStop(1, 'rgba(210, 120, 66, 0.02)');
		
					var saleGradientBg2 = graphGradient2.createLinearGradient(100, 0, 50, 150);
		
					saleGradientBg2.addColorStop(0, 'rgba(204, 149, 67, 0.08)');
					saleGradientBg2.addColorStop(1, 'rgba(204, 149, 67, 0.04)');
		
		
					var salesTopData = {
							labels: dayNames,
		
							datasets: [{
									label: 'Earnt Revenue',
									data: dailyRevenue,
									backgroundColor: saleGradientBg,
									borderColor: ['#d27842'],
									borderWidth: 1.5,
									fill: true, // 3: no fill
									pointBorderWidth: 1,
									pointRadius: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
									pointHoverRadius: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
									pointBackgroundColor: ['#d27842', '#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842','#d27842'],
									pointBorderColor: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff',],
							}, {
								label: 'Free Coffees Worth',
								data: freeRevenue,
								backgroundColor: saleGradientBg2,
								borderColor: ['#cc9543'],
								borderWidth: 1.5,
								fill: true, // 3: no fill
								pointBorderWidth: 1,
								pointRadius: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
								pointHoverRadius: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								pointBackgroundColor: ['#cc9543', '#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543','#cc9543'],
									pointBorderColor: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff',],
						}]
					};
			
					var salesTopOptions = {
						responsive: true,
						maintainAspectRatio: false,
							scales: {
									yAxes: [{
											gridLines: {
													display: true,
													drawBorder: false,
													color:"#F0F0F0",
													zeroLineColor: '#F0F0F0',
											},
											ticks: {
												beginAtZero: false,
												autoSkip: true,
												maxTicksLimit: 4,
												fontSize: 10,
												color:"#6B778C"
											}
									}],
									xAxes: [{
										gridLines: {
												display: false,
												drawBorder: false,
										},
										ticks: {
											beginAtZero: false,
											autoSkip: true,
											maxTicksLimit: 15,
											fontSize: 10,
											color:"#6B778C"
										}
								}],
							},
							legend:false,
							legendCallback: function (chart) {
								var text = [];
								text.push('<div class="chartjs-legend"><ul>');
								for (var i = 0; i < chart.data.datasets.length; i++) {
									text.push('<li>');
									text.push('<span style="background-color:' + chart.data.datasets[i].borderColor + '">' + '</span>');
									text.push(chart.data.datasets[i].label);
									text.push('</li>');
								}
								text.push('</ul></div>');
								return text.join("");
							},
							
							elements: {
									line: {
											tension: 0.4,
									}
							},
							tooltips: {	backgroundColor: 'rgba(210, 202, 193, 0.9)' }
					}
					var salesTop = new Chart(graphGradient, {
							type: 'line',
							data: salesTopData,
							options: salesTopOptions
					});
					document.getElementById('performance-line-legend').innerHTML = salesTop.generateLegend();
				}
		
		
				if ($("#status-summary").length) {
					var statusSummaryChartCanvas = document.getElementById("status-summary").getContext('2d');;
					var statusData = {
						labels: ["SUN", "MON", "TUE", "WED", "THU", "FRI"],
						datasets: [{
							label: '# of Votes',
							data: additionalItems[1],
							backgroundColor: "#ffcc00",
							borderColor: [
								'#d43d51',
							],
							borderWidth: 2,
							fill: false, // 3: no fill
							pointBorderWidth: 0,
							pointRadius: [0, 0, 0, 0, 0, 0],
							pointHoverRadius: [0, 0, 0, 0, 0, 0],
						}]
					};

					document.getElementById("additional-items").innerHTML = additionalItems[0]
				
					var statusOptions = {
					  responsive: true,
					  maintainAspectRatio: false,
						scales: {
							yAxes: [{
							  display:false,
								gridLines: {
									display: false,
									drawBorder: false,
									color:"#F0F0F0"
								},
								ticks: {
								  beginAtZero: false,
								  autoSkip: true,
								  maxTicksLimit: 4,
								  fontSize: 10,
								  color:"#6B778C"
								}
							}],
							xAxes: [{
							  display:false,
							  gridLines: {
								  display: false,
								  drawBorder: false,
							  },
							  ticks: {
								beginAtZero: false,
								autoSkip: true,
								maxTicksLimit: 7,
								fontSize: 10,
								color:"#6B778C"
							  }
						  }],
						},
						legend:false,
						
						elements: {
							line: {
								tension: 0.4,
							}
						},
						tooltips: {	backgroundColor: 'rgba(210, 202, 193, 0.9)' }
					}
					var statusSummaryChart = new Chart(statusSummaryChartCanvas, {
						type: 'line',
						data: statusData,
						options: statusOptions
					});
				  }
				
		
				if ($('#totalVisitors').length) {
					var bar = new ProgressBar.Circle(totalVisitors, {
						color: '#fff',
						strokeWidth: 15,
						trailWidth: 15, 
						easing: 'easeInOut',
						duration: 1400,
						text: {
							autoStyleContainer: false
						},
						from: {
							color: '#81c784',
							width: 15
						},
						to: {
							color: '#66bb6a',
							width: 15
						},
						// Set default step function for all animate calls
						step: function(state, circle) {
							circle.path.setAttribute('stroke', state.color);
							circle.path.setAttribute('stroke-width', state.width);
			
							var value = Math.round(circle.value() * 100);
							if (value === 0) {
								circle.setText('');
							} else {
								circle.setText(value);
							}
			
						}
					});
			
					bar.text.style.fontSize = '0rem';
					bar.animate(eftposPercentage); // Number from 0.0 to 1.0
					document.getElementById("eftposPercent").innerHTML = eftposPercentage*100 + "%"
				}
		
				if ($('#visitperday').length) {
					var bar = new ProgressBar.Circle(visitperday, {
						color: '#fff',
						// This has to be the same size as the maximum width to
						// prevent clipping
						strokeWidth: 15,
						trailWidth: 15,
						easing: 'easeInOut',
						duration: 1400,
						text: {
							autoStyleContainer: false
						},
						from: {
							color: '#34B1AA',
							width: 15
						},
						to: {
							color: '#677ae4',
							width: 15
						},
						// Set default step function for all animate calls
						step: function(state, circle) {
							circle.path.setAttribute('stroke', state.color);
							circle.path.setAttribute('stroke-width', state.width);
			
							var value = Math.round(circle.value() * 100);
							if (value === 0) {
								circle.setText('');
							} else {
								circle.setText(value);
							}
			
						}
					});
			
					bar.text.style.fontSize = '0rem';
					bar.animate(largePercentage); // Number from 0.0 to 1.0
					document.getElementById("largePercent").innerHTML = largePercentage*100 + "%"
				}
		
				if ($("#marketingOverview").length) {
					var marketingOverviewChart = document.getElementById("marketingOverview").getContext('2d');
					var marketingOverviewData = {
							labels: ["Mon","Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon","Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
							datasets: [{
									label: 'Free Items',
									data: coffeeNumbers[1],
									backgroundColor: "#cc9543",
									borderColor: [
											'#cc9543',
									],
									borderWidth: 0,
									fill: true, // 3: no fill
									
							},{
								label: 'Paid Items',
								data: coffeeNumbers[0],
								backgroundColor: "#d27842",
								borderColor: [
										'#d27842',
								],
								borderWidth: 0,
								fill: true, // 3: no fill
						}]
					};
			
					var marketingOverviewOptions = {
						responsive: true,
						maintainAspectRatio: false,
							scales: {
									yAxes: [{
											gridLines: {
													display: true,
													drawBorder: false,
													color:"#F0F0F0",
													zeroLineColor: '#F0F0F0',
											},
											ticks: {
												beginAtZero: true,
												autoSkip: true,
												maxTicksLimit: 5,
												fontSize: 10,
												color:"#6B778C"
											}
									}],
									xAxes: [{
										stacked: false,
										barPercentage: 0.5,
										gridLines: {
												display: false,
												drawBorder: false,
										},
										ticks: {
											beginAtZero: false,
											autoSkip: true,
											maxTicksLimit: 15,
											fontSize: 10,
											color:"#6B778C"
										}
								}],
							},
							legend:false,
							legendCallback: function (chart) {
								var text = [];
								text.push('<div class="chartjs-legend"><ul>');
								for (var i = 0; i < chart.data.datasets.length; i++) {
									text.push('<li class="text-muted text-small">');
									text.push('<span style="background-color:' + chart.data.datasets[i].borderColor + '">' + '</span>');
									text.push(chart.data.datasets[i].label);
									text.push('</li>');
								}
								text.push('</ul></div>');
								return text.join("");
							},
							
							elements: {
									line: {
											tension: 0.4,
									}
							},
							tooltips: {	backgroundColor: 'rgba(210, 202, 193, 0.9)' }
					}
					var marketingOverview = new Chart(marketingOverviewChart, {
							type: 'bar',
							data: marketingOverviewData,
							options: marketingOverviewOptions
					});
					document.getElementById('marketing-overview-legend').innerHTML = marketingOverview.generateLegend();
				}
		




				/* PIE CHART */




				if ($("#doughnutChart").length) {
					var doughnutChartCanvas = $("#doughnutChart").get(0).getContext("2d");
					var doughnutPieData = {
						datasets: [{
							data: coffeeTypes[1],
							backgroundColor: ["#968269", "#b4a594", "#d2cac1", "#f1f1f1", "#f0b8b8", "#e67f83", "#d43d51"],
							borderColor: ["#968269", "#b4a594", "#d2cac1", "#f1f1f1", "#f0b8b8", "#e67f83", "#d43d51"],
						}],
			
						labels: coffeeTypes[0]
					};

					var doughnutPieOptions = {
						cutoutPercentage: 50,
						animationEasing: "easeOutBounce",
						animateRotate: true,
						animateScale: false,
						responsive: true,
						maintainAspectRatio: true,
						showScale: true,
						legend: false,
						legendCallback: function (chart) {
							var text = [];
							text.push('<div id="piechart-legend" class="chartjs-legend" style="flex-wrap: wrap;"><ul class="justify-content-center">');
							for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
								text.push('<li><span style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
								text.push('</span>');
								if (chart.data.labels[i]) {
									text.push(chart.data.labels[i]);
								}
								text.push('</li>');
							}
							text.push('</div></ul>');
							return text.join("");
						},
						
						layout: {
							padding: {
								left: 0,
								right: 0,
								top: 0,
								bottom: 0
							}
						},
						tooltips: {
							callbacks: {
								title: function(tooltipItem, data) {
									return data['labels'][tooltipItem[0]['index']];
								},
								label: function(tooltipItem, data) {
									return data['datasets'][0]['data'][tooltipItem['index']];
								}
							},
								
							backgroundColor: '#fff',
							titleFontSize: 14,
							titleFontColor: '#0B0F32',
							bodyFontColor: '#737F8B',
							bodyFontSize: 11,
							displayColors: false
						}
					};
					var doughnutChart = new Chart(doughnutChartCanvas, {
						type: 'doughnut',
						data: doughnutPieData,
						options: doughnutPieOptions
					});
					document.getElementById('doughnut-chart-legend').innerHTML = doughnutChart.generateLegend();
				}
			});
		})(jQuery);
	})
})
