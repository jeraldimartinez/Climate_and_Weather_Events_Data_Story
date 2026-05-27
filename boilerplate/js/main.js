const tempData = [
	{ year: 1850, anomaly: -0.22 },
	{ year: 1880, anomaly: -0.16 },
	{ year: 1910, anomaly: -0.42 },
	{ year: 1940, anomaly: 0.08 },
	{ year: 1970, anomaly: -0.04 },
	{ year: 1990, anomaly: 0.45 },
	{ year: 2000, anomaly: 0.62 },
	{ year: 2010, anomaly: 0.89 },
	{ year: 2020, anomaly: 1.18 }
];

const co2Data = [
	{ year: 1850, ppm: 285 },
	{ year: 1880, ppm: 290 },
	{ year: 1910, ppm: 300 },
	{ year: 1940, ppm: 311 },
	{ year: 1970, ppm: 326 },
	{ year: 1990, ppm: 354 },
	{ year: 2000, ppm: 370 },
	{ year: 2010, ppm: 390 },
	{ year: 2020, ppm: 414 }
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

function drawTemperatureChart() {
	clearChart("#temperature-chart");

	const { width, height } = getChartSize("#temperature-chart");
	const margin = { top: 24, right: 24, bottom: 46, left: 54 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const svg = d3.select("#temperature-chart")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	const chart = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear()
		.domain(d3.extent(tempData, d => d.year))
		.range([0, innerWidth]);

	const y = d3.scaleLinear()
		.domain([-0.5, 1.3])
		.nice()
		.range([innerHeight, 0]);

	chart.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""))
		.select(".domain")
		.remove();

	chart.append("path")
		.datum(tempData)
		.attr("fill", "none")
		.attr("stroke", "#c84b31")
		.attr("stroke-width", 4)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", d3.line()
			.x(d => x(d.year))
			.y(d => y(d.anomaly))
			.curve(d3.curveMonotoneX));

	chart.selectAll("circle")
		.data(tempData)
		.join("circle")
		.attr("cx", d => x(d.year))
		.attr("cy", d => y(d.anomaly))
		.attr("r", 5)
		.attr("fill", "#17212b");

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));

	chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d} C`));
}

function drawCO2Chart() {
	clearChart("#co2-chart");

	const { width, height } = getChartSize("#co2-chart");
	const margin = { top: 24, right: 28, bottom: 46, left: 58 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const svg = d3.select("#co2-chart")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("aria-hidden", "true");

	const chart = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const x = d3.scaleLinear()
		.domain(d3.extent(co2Data, d => d.year))
		.range([0, innerWidth]);

	const y = d3.scaleLinear()
		.domain([270, d3.max(co2Data, d => d.ppm) + 18])
		.range([innerHeight, 0]);

	chart.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""))
		.select(".domain")
		.remove();

	const area = d3.area()
		.x(d => x(d.year))
		.y0(innerHeight)
		.y1(d => y(d.ppm))
		.curve(d3.curveMonotoneX);

	const line = d3.line()
		.x(d => x(d.year))
		.y(d => y(d.ppm))
		.curve(d3.curveMonotoneX);

	chart.append("path")
		.datum(co2Data)
		.attr("fill", "#38664f")
		.attr("fill-opacity", 0.2)
		.attr("d", area);

	chart.append("path")
		.datum(co2Data)
		.attr("fill", "none")
		.attr("stroke", "#38664f")
		.attr("stroke-width", 4)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line);

	chart.selectAll("circle")
		.data(co2Data)
		.join("circle")
		.attr("cx", d => x(d.year))
		.attr("cy", d => y(d.ppm))
		.attr("r", 5)
		.attr("fill", "#17212b");

	chart.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));

	chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d} ppm`));
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
	drawTemperatureChart();
	drawCO2Chart();
	drawEventChart(document.querySelector(".filter-button.active")?.dataset.type || "all");
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
