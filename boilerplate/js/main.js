// CO2 SECTION CHART DATA: replace these sample rows with imported data using year, avgTemperature, and co2Level.
// all this data is being used rn for the placeholders
// we will place our clean datasets here to render the visuals later on
const temperatureCo2Data = [
	{ year: 2000, avgTemperature: 52.4, co2Level: 370 },
	{ year: 2003, avgTemperature: 52.8, co2Level: 376 },
	{ year: 2006, avgTemperature: 53.1, co2Level: 382 },
	{ year: 2009, avgTemperature: 52.9, co2Level: 387 },
	{ year: 2012, avgTemperature: 54.3, co2Level: 394 },
	{ year: 2015, avgTemperature: 53.8, co2Level: 401 },
	{ year: 2018, avgTemperature: 54.0, co2Level: 408 },
	{ year: 2021, avgTemperature: 54.5, co2Level: 416 },
	{ year: 2024, avgTemperature: 54.2, co2Level: 424 }
];

const eventData = [
	{ label: "Pacific heat wave", type: "heat", x: 70, y: 64, severity: 82 },
	{ label: "Western wildfire season", type: "wildfire", x: 25, y: 54, severity: 72 },
	{ label: "Atlantic hurricane", type: "storm", x: 48, y: 61, severity: 88 },
	{ label: "Horn of Africa drought", type: "drought", x: 61, y: 47, severity: 66 },
	{ label: "European heat wave", type: "heat", x: 52, y: 34, severity: 58 },
	{ label: "Australian bushfire", type: "wildfire", x: 78, y: 72, severity: 74 },
	{ label: "South Asian flood storm", type: "storm", x: 69, y: 43, severity: 69 },
	{ label: "Central U.S. drought", type: "drought", x: 34, y: 42, severity: 54 }
];

// CORRELATION SECTION CHART DATA: replace these sample rows with your yearly disaster dataset.
// Suggested columns: year, co2Level, disasterCount, peopleAffected, avgEconomicCost.
const correlationDisasterData = [
	{ year: 2000, co2Level: 370, disasterCount: 42, peopleAffected: 8.1, avgEconomicCost: 4.2 },
	{ year: 2003, co2Level: 376, disasterCount: 51, peopleAffected: 10.4, avgEconomicCost: 6.0 },
	{ year: 2006, co2Level: 382, disasterCount: 58, peopleAffected: 14.7, avgEconomicCost: 7.5 },
	{ year: 2009, co2Level: 387, disasterCount: 62, peopleAffected: 19.2, avgEconomicCost: 8.1 },
	{ year: 2012, co2Level: 394, disasterCount: 77, peopleAffected: 32.5, avgEconomicCost: 14.8 },
	{ year: 2015, co2Level: 401, disasterCount: 84, peopleAffected: 41.3, avgEconomicCost: 18.9 },
	{ year: 2018, co2Level: 408, disasterCount: 92, peopleAffected: 47.8, avgEconomicCost: 26.5 },
	{ year: 2021, co2Level: 416, disasterCount: 109, peopleAffected: 68.2, avgEconomicCost: 35.4 },
	{ year: 2024, co2Level: 424, disasterCount: 118, peopleAffected: 74.0, avgEconomicCost: 42.0 }
];

const exposureData = [
	{ region: "North America", deaths: 8.3, access: 99 },
	{ region: "Europe", deaths: 12.5, access: 100 },
	{ region: "Latin America", deaths: 6.7, access: 97 },
	{ region: "South Asia", deaths: 18.4, access: 91 },
	{ region: "Sub-Saharan Africa", deaths: 15.6, access: 48 }
];

const colors = {
	heat: "#c84b31",
	storm: "#4b83a6",
	drought: "#d9a441",
	wildfire: "#38664f"
};

function clearChart(selector) {
	d3.select(selector).selectAll("*").remove();
}

function getChartSize(selector, minHeight = 380) {
	const node = document.querySelector(selector);
	return {
		width: node.clientWidth,
		height: Math.max(minHeight, node.clientHeight || minHeight)
	};
}

// CO2 SECTION CHART: renders the two-line temperature/CO2 chart into #co2-chart.
// This is the chart in section "co2 levels"
function drawCO2Chart() {
	clearChart("#co2-chart");

	const { width, height } = getChartSize("#co2-chart", 420);
	const isCompact = width < 540;
	const margin = { top: isCompact ? 86 : 64, right: 72, bottom: 56, left: 66 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const tempColor = "#c84b31";
	const co2Color = "#17212b";
	const getYear = d => Number(d.year);
	const getTemperature = d => Number(d.avgTemperature);
	const getCo2 = d => Number(d.co2Level);

	const svg = d3.select("#co2-chart")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	const chart = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear()
		.domain(d3.extent(temperatureCo2Data, getYear))
		.range([0, innerWidth]);

	const yTemperature = d3.scaleLinear()
		.domain(d3.extent(temperatureCo2Data, getTemperature))
		.nice()
		.range([innerHeight, 0]);

	const yCo2 = d3.scaleLinear()
		.domain(d3.extent(temperatureCo2Data, getCo2))
		.nice()
		.range([innerHeight, 0]);

	const temperatureLine = d3.line()
		.defined(d => Number.isFinite(getTemperature(d)))
		.x(d => x(getYear(d)))
		.y(d => yTemperature(getTemperature(d)))
		.curve(d3.curveMonotoneX);

	const co2Line = d3.line()
		.defined(d => Number.isFinite(getCo2(d)))
		.x(d => x(getYear(d)))
		.y(d => yCo2(getCo2(d)))
		.curve(d3.curveMonotoneX);

	chart.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(yTemperature).tickSize(-innerWidth).tickFormat(""))
		.select(".domain")
		.remove();

	chart.append("path")
		.datum(temperatureCo2Data)
		.attr("fill", "none")
		.attr("stroke", tempColor)
		.attr("stroke-width", 4)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", temperatureLine);

	chart.append("path")
		.datum(temperatureCo2Data)
		.attr("fill", "none")
		.attr("stroke", co2Color)
		.attr("stroke-width", 4)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", co2Line);

	chart.selectAll("circle.temperature-point")
		.data(temperatureCo2Data.filter(d => Number.isFinite(getTemperature(d))))
		.join("circle")
		.attr("class", "temperature-point")
		.attr("cx", d => x(getYear(d)))
		.attr("cy", d => yTemperature(getTemperature(d)))
		.attr("r", 4)
		.attr("fill", tempColor);

	chart.selectAll("circle.co2-point")
		.data(temperatureCo2Data.filter(d => Number.isFinite(getCo2(d))))
		.join("circle")
		.attr("class", "co2-point")
		.attr("cx", d => x(getYear(d)))
		.attr("cy", d => yCo2(getCo2(d)))
		.attr("r", 4)
		.attr("fill", co2Color);

	const latestPoint = temperatureCo2Data.at(-1);

	chart.append("text")
		.attr("x", x(getYear(latestPoint)) - 8)
		.attr("y", yTemperature(getTemperature(latestPoint)) - 12)
		.attr("fill", tempColor)
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.attr("text-anchor", "end")
		.text("avg U.S. temperature");

	chart.append("text")
		.attr("x", x(getYear(latestPoint)) - 8)
		.attr("y", yCo2(getCo2(latestPoint)) + 20)
		.attr("fill", co2Color)
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.attr("text-anchor", "end")
		.text("CO2 levels");

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));

	chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(yTemperature).ticks(5).tickFormat(d => `${d} F`));

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(${innerWidth},0)`)
		.call(d3.axisRight(yCo2).ticks(5).tickFormat(d => `${d} ppm`));

	chart.append("text")
		.attr("x", 0)
		.attr("y", -14)
		.attr("fill", tempColor)
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.text("Avg U.S. temperature");

	chart.append("text")
		.attr("x", innerWidth)
		.attr("y", -14)
		.attr("fill", co2Color)
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.attr("text-anchor", "end")
		.text("CO2 level");

	const legend = svg.append("g")
		.attr("class", "chart-legend")
		.attr("transform", `translate(${margin.left},24)`);

	[
		{ label: "Avg U.S. temperature", color: tempColor },
		{ label: "CO2 levels", color: co2Color }
	].forEach((item, index) => {
		const legendItem = legend.append("g")
			.attr("transform", isCompact ? `translate(0,${index * 22})` : `translate(${index * 190},0)`);

		legendItem.append("line")
			.attr("x1", 0)
			.attr("x2", 28)
			.attr("y1", 0)
			.attr("y2", 0)
			.attr("stroke", item.color)
			.attr("stroke-width", 4)
			.attr("stroke-linecap", "round");

		legendItem.append("text")
			.attr("x", 38)
			.attr("y", 4)
			.attr("fill", "#344350")
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.text(item.label);
	});
}

function drawEventChart(type = "all") {
	clearChart("#event-chart");

	const { width, height } = getChartSize("#event-chart", 430);
	const data = type === "all" ? eventData : eventData.filter(d => d.type === type);

	const svg = d3.select("#event-chart")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("rx", 8)
		.attr("fill", "#eef4f2");

	svg.append("path")
		.attr("d", `M${width * 0.1},${height * 0.55} C${width * 0.28},${height * 0.28} ${width * 0.42},${height * 0.68} ${width * 0.58},${height * 0.42} S${width * 0.84},${height * 0.32} ${width * 0.92},${height * 0.58}`)
		.attr("fill", "none")
		.attr("stroke", "#cad9d6")
		.attr("stroke-width", 12)
		.attr("stroke-linecap", "round");

	const radius = d3.scaleSqrt()
		.domain(d3.extent(eventData, d => d.severity))
		.range([16, 42]);

	const group = svg.selectAll("g.event")
		.data(data, d => d.label)
		.join("g")
		.attr("class", "event")
		.attr("transform", d => `translate(${(d.x / 100) * width},${(d.y / 100) * height})`);

	group.append("circle")
		.attr("r", d => radius(d.severity))
		.attr("fill", d => colors[d.type])
		.attr("fill-opacity", 0.78)
		.attr("stroke", "#fff")
		.attr("stroke-width", 2);

	group.append("text")
		.attr("text-anchor", "middle")
		.attr("dy", 5)
		.attr("fill", "#fff")
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.text(d => d.severity);

	group.append("title")
		.text(d => `${d.label}: ${d.severity} severity`);
}

// CORRELATION SECTION CHART: renders the bubble scatter plot into #correlation-visual.
//shows the correlations between CO2 levels and weather events thru
// number/intensity (avg cost that year),people affected by these events each year
function drawCorrelationChart() {
	clearChart("#correlation-visual");

	const { width, height } = getChartSize("#correlation-visual", 440);
	const isCompact = width < 620;
	const margin = {
		top: isCompact ? 96 : 48,
		right: isCompact ? 28 : 190,
		bottom: 62,
		left: 72
	};
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const getYear = d => Number(d.year);
	const getCo2Level = d => Number(d.co2Level);
	const getDisasterCount = d => Number(d.disasterCount);
	const getPeopleAffected = d => Number(d.peopleAffected);
	const getEconomicCost = d => Number(d.avgEconomicCost);

	const svg = d3.select("#correlation-visual")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	const chart = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear()
		.domain(d3.extent(correlationDisasterData, getCo2Level))
		.nice()
		.range([0, innerWidth]);

	const y = d3.scaleLinear()
		.domain([0, d3.max(correlationDisasterData, getDisasterCount) * 1.16])
		.nice()
		.range([innerHeight, 0]);

	const radius = d3.scaleSqrt()
		.domain(d3.extent(correlationDisasterData, getPeopleAffected))
		.range(isCompact ? [5, 18] : [6, 28]);

	const costColor = d3.scaleLinear()
		.domain(d3.extent(correlationDisasterData, getEconomicCost))
		.range(["#cfe8d6", "#16633f"]);

	const sortedData = [...correlationDisasterData].sort((a, b) => getCo2Level(a) - getCo2Level(b));

	chart.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""))
		.select(".domain")
		.remove();

	chart.append("path")
		.datum(sortedData)
		.attr("fill", "none")
		.attr("stroke", "#17212b")
		.attr("stroke-width", 3)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("stroke-opacity", 0.72)
		.attr("d", d3.line()
			.x(d => x(getCo2Level(d)))
			.y(d => y(getDisasterCount(d)))
			.curve(d3.curveMonotoneX));

	chart.selectAll("circle.disaster-year")
		.data(sortedData)
		.join("circle")
		.attr("class", "disaster-year")
		.attr("cx", d => x(getCo2Level(d)))
		.attr("cy", d => y(getDisasterCount(d)))
		.attr("r", d => radius(getPeopleAffected(d)))
		.attr("fill", d => costColor(getEconomicCost(d)))
		.attr("fill-opacity", 0.88)
		.attr("stroke", "#ffffff")
		.attr("stroke-width", 2)
		.append("title")
		.text(d => `${getYear(d)}: ${getCo2Level(d)} ppm CO2, ${getDisasterCount(d)} events, ${getPeopleAffected(d)}M people affected, $${getEconomicCost(d)}B avg cost`);

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(isCompact ? 4 : 7));

	chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(y).ticks(5));

	chart.append("text")
		.attr("x", innerWidth / 2)
		.attr("y", innerHeight + 48)
		.attr("fill", "#64717f")
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.attr("text-anchor", "middle")
		.text("CO2 level (ppm)");

	chart.append("text")
		.attr("x", -innerHeight / 2)
		.attr("y", -48)
		.attr("fill", "#64717f")
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.text("Extreme weather events");

	chart.append("text")
		.attr("x", innerWidth * 0.58)
		.attr("y", y(d3.max(correlationDisasterData, getDisasterCount)) - 18)
		.attr("fill", "#17212b")
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.text("higher CO2 years show higher disaster impact");

	const legend = svg.append("g")
		.attr("transform", isCompact ? `translate(${margin.left},22)` : `translate(${margin.left + innerWidth + 34},${margin.top + 10})`);

	legend.append("text")
		.attr("fill", "#17212b")
		.attr("font-size", 12)
		.attr("font-weight", 800)
		.text("Legend");

	const sizeLegendValues = [
		d3.min(correlationDisasterData, getPeopleAffected),
		d3.mean(correlationDisasterData, getPeopleAffected),
		d3.max(correlationDisasterData, getPeopleAffected)
	];

	sizeLegendValues.forEach((value, index) => {
		const item = legend.append("g")
			.attr("transform", isCompact ? `translate(${index * 86},28)` : `translate(0,${34 + index * 40})`);

		item.append("circle")
			.attr("cx", 12)
			.attr("cy", 12)
			.attr("r", radius(value))
			.attr("fill", "#7faa8a")
			.attr("fill-opacity", 0.72)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 2);

		item.append("text")
			.attr("x", isCompact ? 34 : 48)
			.attr("y", 16)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.text(`${Math.round(value)}M`);
	});

	if (!isCompact) {
		legend.append("text")
			.attr("x", 0)
			.attr("y", 176)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.attr("font-weight", 800)
			.text("Avg economic cost");

		[d3.min(correlationDisasterData, getEconomicCost), d3.mean(correlationDisasterData, getEconomicCost), d3.max(correlationDisasterData, getEconomicCost)].forEach((value, index) => {
			const item = legend.append("g")
				.attr("transform", `translate(0,${194 + index * 26})`);

			item.append("rect")
				.attr("width", 22)
				.attr("height", 14)
				.attr("rx", 3)
				.attr("fill", costColor(value));

			item.append("text")
				.attr("x", 32)
				.attr("y", 11)
				.attr("fill", "#64717f")
				.attr("font-size", 11)
				.text(`$${Math.round(value)}B`);
		});
	}
}

function drawExposureChart() {
	clearChart("#exposure-chart");

	const { width, height } = getChartSize("#exposure-chart");
	const margin = { top: 22, right: 34, bottom: 92, left: 58 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const svg = d3.select("#exposure-chart")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	const chart = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleBand()
		.domain(exposureData.map(d => d.region))
		.range([0, innerWidth])
		.padding(0.26);

	const yDeaths = d3.scaleLinear()
		.domain([0, d3.max(exposureData, d => d.deaths) * 1.18])
		.range([innerHeight, 0]);

	const yAccess = d3.scaleLinear()
		.domain([0, 100])
		.range([innerHeight, 0]);

	chart.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(yDeaths).tickSize(-innerWidth).tickFormat(""))
		.select(".domain")
		.remove();

	chart.selectAll("rect")
		.data(exposureData)
		.join("rect")
		.attr("x", d => x(d.region))
		.attr("y", d => yDeaths(d.deaths))
		.attr("width", x.bandwidth())
		.attr("height", d => innerHeight - yDeaths(d.deaths))
		.attr("rx", 5)
		.attr("fill", "#4b83a6");

	chart.append("path")
		.datum(exposureData)
		.attr("fill", "none")
		.attr("stroke", "#c84b31")
		.attr("stroke-width", 3)
		.attr("d", d3.line()
			.x(d => x(d.region) + x.bandwidth() / 2)
			.y(d => yAccess(d.access)));

	chart.selectAll("circle.access")
		.data(exposureData)
		.join("circle")
		.attr("class", "access")
		.attr("cx", d => x(d.region) + x.bandwidth() / 2)
		.attr("cy", d => yAccess(d.access))
		.attr("r", 5)
		.attr("fill", "#c84b31");

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-34)");

	chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(yDeaths).ticks(5));

	chart.append("text")
		.attr("x", 0)
		.attr("y", -8)
		.attr("fill", "#64717f")
		.attr("font-size", 12)
		.text("Heat deaths per 100k");

	chart.append("text")
		.attr("x", innerWidth - 150)
		.attr("y", -8)
		.attr("fill", "#c84b31")
		.attr("font-size", 12)
		.text("Electricity access line");
}

function setActiveNav() {
	const sections = [...document.querySelectorAll("header[id], section[id]")];
	const links = [...document.querySelectorAll(".nav-links a")];
	const current = sections
		.filter(section => section.getBoundingClientRect().top < window.innerHeight * 0.45)
		.at(-1);

	links.forEach(link => {
		link.classList.toggle("active", current && link.getAttribute("href") === `#${current.id}`);
	});
}

function drawAllCharts() {
	drawCO2Chart();
	drawEventChart(document.querySelector(".filter-button.active")?.dataset.type || "all");
	drawCorrelationChart();
	drawExposureChart();
}

document.querySelectorAll(".filter-button").forEach(button => {
	button.addEventListener("click", () => {
		document.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
		button.classList.add("active");
		drawEventChart(button.dataset.type);
	});
});

document.querySelector("#reset-events").addEventListener("click", () => {
	document.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
	document.querySelector('[data-type="all"]').classList.add("active");
	drawEventChart("all");
});

window.addEventListener("resize", drawAllCharts);
window.addEventListener("scroll", setActiveNav);
drawAllCharts();
setActiveNav();
