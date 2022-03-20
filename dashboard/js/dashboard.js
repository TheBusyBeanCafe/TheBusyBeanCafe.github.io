const API_URL = "https://thebusybeancafeapi.azurewebsites.net/";
//const API_URL = "http://127.0.0.1:5000/";

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

		if (res[ix] == undefined) res[ix] = [];
		if (ix < period) res[ix].push(item);
	}


	let revenueArray = new Array(period);

	for (var i = 0; i < res.length; i++) {
		if (res[i] !== undefined) {
			if (paid) {
				revenueArray[i] = (res[i].map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur)));	
			} else {
				revenueArray[i] = (res[i].map(x => (x["payment"] == 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur)));
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

function getCoffeesSold(response) {		
	return getRange(response, 604_800_000).length // todo link custom date
}

function getItemAll(response) {
	return response.length;
}

function getRevenueAll(response) {
	return response.map(x => (x["payment"] != 3) * ((x["index"] == 0 ? 2.0 : 2.5) + (((x["milk"] != 0) && (x["milk"] !== null)) + (x["large"]) + (x["syrup"] !== null)) * 0.5)).reduce((prev, cur) => (prev + cur));
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

		// PAID
		if (paid[ix] == undefined) paid[ix] = [];
		if (ix < range && item["payment"] != 3) paid[ix].push(item);

		// FREE
		if (free[ix] == undefined) free[ix] = [];
		if (ix < range && item["payment"] == 3) free[ix].push(item);

	}
	
	let paidFinal = paid.map(x => x.length);
	let freeFinal = free.map(x => x.length);
	
	return [paidFinal.reverse(), freeFinal.reverse()];
}


// console.log(getRevenuePerDay(fetchData(), 14));


pass = window.sessionStorage.getItem("pass")
console.log(pass)
if (pass == null) {
	console.log("uh o")
	window.location.href = "../index.html"
}

let fetchedData = fetchData();

window.addEventListener("load", () => {



	var dailyRevenue;
	var freeRevenue;
	var dayNames;

	console.log(fetchedData);


	fetchedData.then(value => {
		dailyRevenue = getRevenuePerDay(value, 14, true);
		freeRevenue = getRevenuePerDay(value, 14, false);
		document.getElementById("revenue-week").innerHTML = "$" + getRevenue(responseJSON);	
		document.getElementById("coffees-sold-week").innerHTML = getCoffeesSold(responseJSON);	
		document.getElementById("free-week").innerHTML = "$" + getFreeCoffeeAmount(responseJSON);
		document.getElementById("revenue-all").innerHTML = "$" + getRevenueAll(responseJSON);
		document.getElementById("coffees-sold-all").innerHTML = getItemAll(responseJSON);

		dayNames = getDays(14);

		coffeeTypes = getItemTypes(value);

		coffeeNumbers = getNumberPerDay(value, 14, 86400000);

		console.log(coffeeNumbers);

		(function($) {
			'use strict';
			$(function() {
				if ($("#performaneLine").length) {
					var graphGradient = document.getElementById("performaneLine").getContext('2d');
					var graphGradient2 = document.getElementById("performaneLine").getContext('2d');
		
					var saleGradientBg = graphGradient.createLinearGradient(5, 0, 5, 100);
		
					saleGradientBg.addColorStop(0, 'rgba(26, 115, 232, 0.18)');
					saleGradientBg.addColorStop(1, 'rgba(26, 115, 232, 0.02)');
		
					var saleGradientBg2 = graphGradient2.createLinearGradient(100, 0, 50, 150);
		
					saleGradientBg2.addColorStop(0, 'rgba(0, 208, 255, 0.19)');
					saleGradientBg2.addColorStop(1, 'rgba(0, 208, 255, 0.03)');
		
		
					var salesTopData = {
							labels: dayNames,
		
							datasets: [{
									label: 'Earnt Revenue',
									data: dailyRevenue,
									backgroundColor: saleGradientBg,
									borderColor: [
											'#1F3BB3',
									],
									borderWidth: 1.5,
									fill: true, // 3: no fill
									pointBorderWidth: 1,
									pointRadius: [4, 4, 4, 4, 4,4, 4, 4, 4, 4,4, 4, 4],
									pointHoverRadius: [2, 2, 2, 2, 2,2, 2, 2, 2, 2,2, 2, 2],
									pointBackgroundColor: ['#1F3BB3', '#1F3BB3', '#1F3BB3', '#1F3BB3','#1F3BB3', '#1F3BB3', '#1F3BB3', '#1F3BB3','#1F3BB3', '#1F3BB3', '#1F3BB3', '#1F3BB3','#1F3BB3'],
									pointBorderColor: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff',],
							}, {
								label: 'Free Coffees Worth',
								data: freeRevenue,
								backgroundColor: saleGradientBg2,
								borderColor: [
										'#52CDFF',
								],
								borderWidth: 1.5,
								fill: true, // 3: no fill
								pointBorderWidth: 1,
								pointRadius: [0, 0, 0, 4, 0],
								pointHoverRadius: [0, 0, 0, 2, 0],
								pointBackgroundColor: ['#52CDFF', '#52CDFF', '#52CDFF', '#52CDFF','#52CDFF', '#52CDFF', '#52CDFF', '#52CDFF','#52CDFF', '#52CDFF', '#52CDFF', '#52CDFF','#52CDFF'],
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
									console.log(chart.data.datasets[i]); // see what's inside the obj.
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
							tooltips: {
									backgroundColor: 'rgba(31, 59, 179, 1)',
							}
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
									data: [50, 68, 70, 10, 12, 80],
									backgroundColor: "#ffcc00",
									borderColor: [
											'#01B6A0',
									],
									borderWidth: 2,
									fill: false, // 3: no fill
									pointBorderWidth: 0,
									pointRadius: [0, 0, 0, 0, 0, 0],
									pointHoverRadius: [0, 0, 0, 0, 0, 0],
							}]
					};
			
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
							tooltips: {
									backgroundColor: 'rgba(31, 59, 179, 1)',
							}
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
							color: '#52CDFF',
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
					bar.animate(.64); // Number from 0.0 to 1.0
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
					bar.animate(.34); // Number from 0.0 to 1.0
				}
		
				if ($("#marketingOverview").length) {
					var marketingOverviewChart = document.getElementById("marketingOverview").getContext('2d');
					var marketingOverviewData = {
							labels: ["Mon","Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon","Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
							datasets: [{
									label: 'Free Items',
									data: coffeeNumbers[1],
									backgroundColor: "#52CDFF",
									borderColor: [
											'#52CDFF',
									],
									borderWidth: 0,
									fill: true, // 3: no fill
									
							},{
								label: 'Paid Items',
								data: coffeeNumbers[0],
								backgroundColor: "#1F3BB3",
								borderColor: [
										'#1F3BB3',
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
									console.log(chart.data.datasets[i]); // see what's inside the obj.
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
							tooltips: {
									backgroundColor: 'rgba(31, 59, 179, 1)',
							}
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




// console.log(response);

