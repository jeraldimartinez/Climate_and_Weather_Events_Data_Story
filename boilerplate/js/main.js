const climateCsvPath = "data/climate.csv";
const disastersCsvPath = "data/disasters.csv";
const usaCountryNames = new Set(["USA", "United States", "United States of America"]);
const weatherDisasterGroups = new Set(["Climatological", "Hydrological", "Meteorological"]);
let temperatureCo2Data = [];
let co2Correlation = null;
let correlationWeatherData = [];
let temperatureWeatherEventsCorrelation = null;
let economicDamageData = [];
let humanImpactData = [];
let co2TrendVis;
let eventExplorerVis;
let correlationVis;
let economicImpactVis;
let humanImpactVis;

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

function readNumber(value) {
	const parsed = typeof value === "number"
		? value
		: Number(String(value ?? "").replace(/,/g, "").trim());

	return Number.isFinite(parsed) ? parsed : NaN;
}

function formatNumber(value, digits = 1) {
	return Number(value).toFixed(digits).replace(/\.0$/, "");
}

function getPaddedDomain(values, paddingRatio = 0.12) {
	const numericValues = values.filter(Number.isFinite);
	const [min, max] = d3.extent(numericValues);

	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return [0, 1];
	}

	const span = max - min || Math.abs(max) || 1;
	return [min - span * paddingRatio, max + span * paddingRatio];
}

function getPearsonCorrelation(data, firstAccessor, secondAccessor) {
	const pairs = data
		.map(d => [firstAccessor(d), secondAccessor(d)])
		.filter(([first, second]) => Number.isFinite(first) && Number.isFinite(second));

	if (pairs.length < 2) {
		return null;
	}

	const firstMean = d3.mean(pairs, d => d[0]);
	const secondMean = d3.mean(pairs, d => d[1]);
	const numerator = d3.sum(pairs, d => (d[0] - firstMean) * (d[1] - secondMean));
	const firstVariance = d3.sum(pairs, d => Math.pow(d[0] - firstMean, 2));
	const secondVariance = d3.sum(pairs, d => Math.pow(d[1] - secondMean, 2));
	const denominator = Math.sqrt(firstVariance * secondVariance);

	return denominator === 0 ? null : numerator / denominator;
}

function getLinearRegression(data, xAccessor, yAccessor) {
	const pairs = data
		.map(d => [xAccessor(d), yAccessor(d)])
		.filter(([xValue, yValue]) => Number.isFinite(xValue) && Number.isFinite(yValue));

	if (pairs.length < 2) {
		return null;
	}

	const xMean = d3.mean(pairs, d => d[0]);
	const yMean = d3.mean(pairs, d => d[1]);
	const denominator = d3.sum(pairs, d => Math.pow(d[0] - xMean, 2));

	if (denominator === 0) {
		return null;
	}

	const slope = d3.sum(pairs, d => (d[0] - xMean) * (d[1] - yMean)) / denominator;
	const intercept = yMean - slope * xMean;
	const [x1, x2] = d3.extent(pairs, d => d[0]);

	return {
		x1,
		x2,
		y1: slope * x1 + intercept,
		y2: slope * x2 + intercept
	};
}

function prepareTemperatureCo2Data(rows) {
	const parsedRows = rows
		.map(row => ({
			year: readNumber(row.Year),
			country: String(row.Country ?? "").trim(),
			avgTemperature: readNumber(row["Avg Temperature (°C)"]),
			co2Emissions: readNumber(row["CO2 Emissions (Tons/Capita)"])
		}))
		.filter(row =>
			usaCountryNames.has(row.country) &&
			Number.isFinite(row.year) &&
			Number.isFinite(row.avgTemperature) &&
			Number.isFinite(row.co2Emissions)
		);

	return d3.rollups(
		parsedRows,
		values => ({
			avgTemperature: d3.mean(values, d => d.avgTemperature),
			co2Emissions: d3.mean(values, d => d.co2Emissions),
			observations: values.length
		}),
		d => d.year
	)
		.map(([year, values]) => ({
			year,
			avgTemperature: values.avgTemperature,
			co2Emissions: values.co2Emissions,
			observations: values.observations
		}))
		.sort((a, b) => a.year - b.year);
}

function prepareWeatherDisasterData(rows) {
	const parsedRows = rows
		.map(row => ({
			year: readNumber(row.Year),
			country: String(row.Country ?? "").trim(),
			subgroup: String(row["Disaster Subroup"] ?? "").trim(),
			disasterType: String(row["Disaster Type"] ?? "").trim(),
			totalEvents: readNumber(row["Total Events"]),
			totalAffected: readNumber(row["Total Affected"]),
			totalDeaths: readNumber(row["Total Deaths"]),
			totalDamage: readNumber(row["Total Damage (USD, adjusted)"])
		}))
		.filter(row =>
			usaCountryNames.has(row.country) &&
			weatherDisasterGroups.has(row.subgroup) &&
			Number.isFinite(row.year)
		);

	return d3.rollups(
		parsedRows,
		values => ({
			disasterEvents: d3.sum(values, d => d.totalEvents || 0),
			peopleAffected: d3.sum(values, d => d.totalAffected || 0),
			totalDeaths: d3.sum(values, d => d.totalDeaths || 0),
			totalDamage: d3.sum(values, d => d.totalDamage || 0),
			rows: values.length
		}),
		d => d.year
	)
		.map(([year, values]) => ({
			year,
			disasterEvents: values.disasterEvents,
			peopleAffected: values.peopleAffected,
			peopleAffectedMillions: values.peopleAffected / 1000000,
			totalDeaths: values.totalDeaths,
			totalDamage: values.totalDamage,
			totalDamageBillions: values.totalDamage / 1000000000,
			rows: values.rows
		}))
		.sort((a, b) => a.year - b.year);
}

function prepareCorrelationWeatherData(climateRows, disasterRows) {
	const climateByYear = new Map(
		prepareTemperatureCo2Data(climateRows).map(row => [row.year, row])
	);

	return prepareWeatherDisasterData(disasterRows)
		.filter(row => climateByYear.has(row.year))
		.map(row => ({
			...row,
			avgTemperature: climateByYear.get(row.year).avgTemperature,
			co2Emissions: climateByYear.get(row.year).co2Emissions,
			climateObservations: climateByYear.get(row.year).observations
		}))
		.sort((a, b) => a.year - b.year);
}

function prepareEconomicDamageData(rows) {
	const damageData = prepareWeatherDisasterData(rows)
		.filter(row => row.totalDamage > 0);
	const latestCompleteYear = new Date().getFullYear() - 1;
	const completeYears = damageData.filter(row => row.year <= latestCompleteYear);

	return (completeYears.length ? completeYears : damageData)
		.sort((a, b) => a.year - b.year);
}

function prepareHumanImpactData(rows) {
	const impactData = prepareWeatherDisasterData(rows)
		.filter(row => row.peopleAffected > 0 || row.totalDeaths > 0);
	const latestCompleteYear = new Date().getFullYear() - 1;
	const completeYears = impactData.filter(row => row.year <= latestCompleteYear);

	return (completeYears.length ? completeYears : impactData)
		.sort((a, b) => a.year - b.year);
}

function setText(selector, text) {
	const node = document.querySelector(selector);

	if (node) {
		node.textContent = text;
	}
}

/* * * * * * * * * * * * * *
*        Co2TrendVis        *
* * * * * * * * * * * * * */

class Co2TrendVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.correlation = options.correlation ?? null;
		this.loadState = options.loadState || "loading";
		this.tagElement = options.tagElement || null;
		this.tempColor = "#c84b31";
		this.co2Color = "#1c7c76";

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.wrangleData();
	}

	setData(data, options = {}) {
		let vis = this;

		vis.data = data;
		vis.correlation = options.correlation ?? vis.correlation;
		vis.loadState = options.loadState || vis.loadState;
		vis.loadError = options.loadError || null;
		vis.wrangleData();
	}
	showStatus(message) {
		let vis = this;

		clearChart("#" + vis.parentElement);
		d3.select("#" + vis.parentElement)
			.append("div")
			.attr("class", "chart-status")
			.text(message);
	}

	updateSummary() {
		let vis = this;
		const tag = document.querySelector("#" + vis.tagElement);
		const lineChart = document.querySelector("#" + vis.parentElement);

		if (vis.loadState === "error") {
			if (tag) {
				tag.textContent = "Data error";
			}

			setText("#co2-years", "--");
			setText("#co2-correlation", "--");
			setText("#co2-latest-label", "Latest year");
			setText("#co2-latest", "--");
			return;
		}

		if (!vis.data.length) {
			if (tag) {
				tag.textContent = vis.loadState === "ready" ? "No data" : "Loading data";
			}

			return;
		}

		const firstYear = vis.data[0].year;
		const latest = vis.data.at(-1);
		const hasCorrelation = Number.isFinite(vis.correlation);
		const correlationText = hasCorrelation ? `r = ${vis.correlation.toFixed(2)}` : "n/a";

		if (tag) {
			tag.textContent = `${firstYear}-${latest.year}`;
		}

		setText("#co2-years", `${firstYear}-${latest.year}`);
		setText("#co2-correlation", correlationText);
		setText("#co2-latest-label", `${latest.year} avg`);
		setText("#co2-latest", `${formatNumber(latest.avgTemperature)}°C / ${formatNumber(latest.co2Emissions)} t`);

		if (lineChart) {
			lineChart.setAttribute(
				"aria-label",
				`Two-line chart comparing average U.S. temperature and per-capita carbon dioxide emissions from ${firstYear} to ${latest.year}.`
			);
		}
	}

	wrangleData() {
		let vis = this;

		vis.updateSummary();

		if (vis.loadState === "loading") {
			vis.showStatus("Loading USA climate data...");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${climateCsvPath}. Serve the site locally so D3 can request the CSV.`);
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No usable USA temperature and CO2 rows were found in climate.csv.");
			return;
		}

		vis.displayData = vis.data;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const { width, height } = getChartSize("#" + vis.parentElement, 420);
		const isCompact = width < 600;
		const margin = { top: isCompact ? 92 : 64, right: isCompact ? 104 : 138, bottom: 56, left: 66 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;
		const getYear = d => Number(d.year);
		const getTemperature = d => Number(d.avgTemperature);
		const getCo2 = d => Number(d.co2Emissions);
		const formatPointLabel = d => `${getYear(d)}\nAverage temperature: ${formatNumber(getTemperature(d))}°C\nCO2 emissions: ${formatNumber(getCo2(d))} tons/person\nRows averaged: ${d.observations}`;

		const svg = d3.select("#" + vis.parentElement)
			.append("svg")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("aria-hidden", "true");

		const chart = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const x = d3.scaleLinear()
			.domain(d3.extent(vis.displayData, getYear))
			.range([0, innerWidth]);

		const yTemperature = d3.scaleLinear()
			.domain(getPaddedDomain(vis.displayData.map(getTemperature)))
			.nice()
			.range([innerHeight, 0]);

		const yCo2 = d3.scaleLinear()
			.domain(getPaddedDomain(vis.displayData.map(getCo2)))
			.nice()
			.range([innerHeight, 0]);

		const temperatureLine = d3.line()
			.defined(d => Number.isFinite(getTemperature(d)))
			.x(d => x(getYear(d)))
			.y(d => yTemperature(getTemperature(d)));

		const co2Line = d3.line()
			.defined(d => Number.isFinite(getCo2(d)))
			.x(d => x(getYear(d)))
			.y(d => yCo2(getCo2(d)));

		chart.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(yTemperature).tickSize(-innerWidth).tickFormat(""))
			.select(".domain")
			.remove();

		chart.append("path")
			.datum(vis.displayData)
			.attr("fill", "none")
			.attr("stroke", vis.tempColor)
			.attr("stroke-width", 4)
			.attr("stroke-linecap", "butt")
			.attr("stroke-linejoin", "miter")
			.attr("d", temperatureLine);

		chart.append("path")
			.datum(vis.displayData)
			.attr("fill", "none")
			.attr("stroke", vis.co2Color)
			.attr("stroke-width", 4)
			.attr("stroke-linecap", "butt")
			.attr("stroke-linejoin", "miter")
			.attr("d", co2Line);

		chart.selectAll("circle.temperature-point")
			.data(vis.displayData.filter(d => Number.isFinite(getTemperature(d))))
			.join("circle")
			.attr("class", "temperature-point")
			.attr("cx", d => x(getYear(d)))
			.attr("cy", d => yTemperature(getTemperature(d)))
			.attr("r", 4)
			.attr("fill", vis.tempColor)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1.5)
			.append("title")
			.text(formatPointLabel);

		chart.selectAll("circle.co2-point")
			.data(vis.displayData.filter(d => Number.isFinite(getCo2(d))))
			.join("circle")
			.attr("class", "co2-point")
			.attr("cx", d => x(getYear(d)))
			.attr("cy", d => yCo2(getCo2(d)))
			.attr("r", 4)
			.attr("fill", vis.co2Color)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1.5)
			.append("title")
			.text(formatPointLabel);

		const latestPoint = vis.displayData.at(-1);
		const latestX = x(getYear(latestPoint));
		const minLabelGap = 22;
		const labelMinY = 12;
		const labelMaxY = innerHeight - 12;
		const clampLabelY = value => Math.max(labelMinY, Math.min(labelMaxY, value));
		let tempLabelY = clampLabelY(yTemperature(getTemperature(latestPoint)));
		let co2LabelY = clampLabelY(yCo2(getCo2(latestPoint)));

		if (Math.abs(tempLabelY - co2LabelY) < minLabelGap) {
			if (tempLabelY <= co2LabelY) {
				tempLabelY = clampLabelY(tempLabelY - minLabelGap / 2);
				co2LabelY = tempLabelY + minLabelGap;

				if (co2LabelY > labelMaxY) {
					co2LabelY = labelMaxY;
					tempLabelY = co2LabelY - minLabelGap;
				}
			} else {
				co2LabelY = clampLabelY(co2LabelY - minLabelGap / 2);
				tempLabelY = co2LabelY + minLabelGap;

				if (tempLabelY > labelMaxY) {
					tempLabelY = labelMaxY;
					co2LabelY = tempLabelY - minLabelGap;
				}
			}
		}

		[
			{
				label: "avg temperature",
				color: vis.tempColor,
				pointY: yTemperature(getTemperature(latestPoint)),
				labelY: tempLabelY
			},
			{
				label: "CO2 emissions",
				color: vis.co2Color,
				pointY: yCo2(getCo2(latestPoint)),
				labelY: co2LabelY
			}
		].forEach(item => {
			chart.append("line")
				.attr("x1", latestX + 5)
				.attr("x2", innerWidth + 34)
				.attr("y1", item.pointY)
				.attr("y2", item.labelY)
				.attr("stroke", item.color)
				.attr("stroke-width", 1.5)
				.attr("stroke-opacity", 0.7);

			chart.append("text")
				.attr("x", innerWidth + 40)
				.attr("y", item.labelY)
				.attr("dy", "0.35em")
				.attr("fill", item.color)
				.attr("font-size", 12)
				.attr("font-weight", 800)
				.text(item.label);
		});

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(isCompact ? 4 : 6));

		chart.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(yTemperature).ticks(4).tickFormat(d => `${formatNumber(d)}°C`));

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(${innerWidth},0)`)
			.call(d3.axisRight(yCo2).ticks(4).tickFormat(d => `${formatNumber(d)} t`));

		chart.append("text")
			.attr("x", 0)
			.attr("y", -14)
			.attr("fill", vis.tempColor)
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.text("Avg temperature (°C)");

		chart.append("text")
			.attr("x", innerWidth)
			.attr("y", -14)
			.attr("fill", vis.co2Color)
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.attr("text-anchor", "end")
			.text("CO2 emissions (tons/person)");

		const legend = svg.append("g")
			.attr("class", "chart-legend")
			.attr("transform", `translate(${margin.left},24)`);

		[
			{ label: "Avg temperature", color: vis.tempColor },
			{ label: "CO2 emissions", color: vis.co2Color }
		].forEach((item, index) => {
			const legendItem = legend.append("g")
				.attr("transform", isCompact ? `translate(0,${index * 20})` : `translate(${index * 142},0)`);

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
}

/* * * * * * * * * * * * * *
*      EventExplorerVis     *
* * * * * * * * * * * * * */

class EventExplorerVis {
	constructor(parentElement, data) {
		this.parentElement = parentElement;
		this.data = data;
		this.selectedType = "all";

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.wrangleData();
	}

	setFilter(type) {
		let vis = this;

		vis.selectedType = type;
		vis.wrangleData();
	}

	wrangleData() {
		let vis = this;

		vis.displayData = vis.selectedType === "all"
			? vis.data
			: vis.data.filter(d => d.type === vis.selectedType);

		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const { width, height } = getChartSize("#" + vis.parentElement, 430);
		const radius = d3.scaleSqrt()
			.domain(d3.extent(vis.data, d => d.severity))
			.range([16, 42]);

		const svg = d3.select("#" + vis.parentElement)
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

		const group = svg.selectAll("g.event")
			.data(vis.displayData, d => d.label)
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
}

/* * * * * * * * * * * * * *
*       CorrelationVis      *
* * * * * * * * * * * * * */

class CorrelationVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.correlation = options.correlation ?? null;
		this.loadState = options.loadState || "loading";
		this.loadError = options.loadError || null;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.wrangleData();
	}

	setData(data, options = {}) {
		let vis = this;

		vis.data = data;
		vis.correlation = options.correlation ?? vis.correlation;
		vis.loadState = options.loadState || vis.loadState;
		vis.loadError = options.loadError || null;
		vis.wrangleData();
	}

	showStatus(message) {
		let vis = this;

		clearChart("#" + vis.parentElement);
		d3.select("#" + vis.parentElement)
			.append("div")
			.attr("class", "chart-status")
			.text(message);
	}

	wrangleData() {
		let vis = this;

		if (vis.loadState === "loading") {
			vis.showStatus("Loading climate and disaster data...");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${climateCsvPath} and ${disastersCsvPath}. Serve the site locally so D3 can request the CSVs.`);
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No overlapping climate and disaster years were found.");
			return;
		}

		vis.displayData = vis.data;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const { width, height } = getChartSize("#" + vis.parentElement, 440);
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
		const getTemperature = d => Number(d.avgTemperature);
		const getPeopleAffected = d => Number(d.peopleAffectedMillions);
		const getDamage = d => Number(d.totalDamageBillions);
		const formatComma = d3.format(",");

		const svg = d3.select("#" + vis.parentElement)
			.append("svg")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("aria-hidden", "true");

		const chart = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const x = d3.scaleLinear()
			.domain(getPaddedDomain(vis.displayData.map(getTemperature), 0.1))
			.nice()
			.range([0, innerWidth]);

		const y = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, d => d.disasterEvents) * 1.16])
			.nice()
			.range([innerHeight, 0]);

		const radius = d3.scaleSqrt()
			.domain(d3.extent(vis.displayData, getPeopleAffected))
			.range(isCompact ? [5, 18] : [6, 28]);

		const damageColor = d3.scaleLinear()
			.domain(d3.extent(vis.displayData, getDamage))
			.range(["#cfe8d6", "#16633f"]);

		const regression = getLinearRegression(
			vis.displayData,
			getTemperature,
			d => d.disasterEvents
		);

		chart.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""))
			.select(".domain")
			.remove();

		if (regression) {
			chart.append("line")
				.attr("x1", x(regression.x1))
				.attr("y1", y(regression.y1))
				.attr("x2", x(regression.x2))
				.attr("y2", y(regression.y2))
				.attr("stroke", "#17212b")
				.attr("stroke-width", 3)
				.attr("stroke-linecap", "round")
				.attr("stroke-dasharray", "7 5")
				.attr("stroke-opacity", 0.75);
		}

		chart.selectAll("circle.disaster-year")
			.data(vis.displayData)
			.join("circle")
			.attr("class", "disaster-year")
			.attr("cx", d => x(getTemperature(d)))
			.attr("cy", d => y(d.disasterEvents))
			.attr("r", d => radius(getPeopleAffected(d)))
			.attr("fill", d => damageColor(getDamage(d)))
			.attr("fill-opacity", 0.88)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 2)
			.append("title")
			.text(d => `${getYear(d)}: ${formatNumber(getTemperature(d))}°C avg temperature, ${formatComma(d.disasterEvents)} weather-related events, ${formatNumber(getPeopleAffected(d))}M people affected, ${formatComma(d.totalDeaths)} deaths, $${formatNumber(getDamage(d))}B adjusted damage`);

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x).tickFormat(d => `${formatNumber(d)}°C`).ticks(isCompact ? 4 : 6));

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
			.text("Average U.S. temperature (°C)");

		chart.append("text")
			.attr("x", -innerHeight / 2)
			.attr("y", -48)
			.attr("fill", "#64717f")
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.text("Weather-related disaster events");

		chart.append("text")
			.attr("x", innerWidth / 2)
			.attr("y", y(d3.max(vis.displayData, d => d.disasterEvents)) - 18)
			.attr("fill", "#17212b")
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.attr("text-anchor", "middle")
			.text("Temperature vs Extreme Weather Events");

		const legend = svg.append("g")
			.attr("transform", isCompact ? `translate(${margin.left},22)` : `translate(${margin.left + innerWidth + 34},${margin.top + 10})`);

		legend.append("text")
			.attr("fill", "#17212b")
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.text("Legend");

		const sizeLegendValues = [
			d3.min(vis.displayData, getPeopleAffected),
			d3.mean(vis.displayData, getPeopleAffected),
			d3.max(vis.displayData, getPeopleAffected)
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
				.text(`${formatNumber(value)}M affected`);
		});

		if (!isCompact) {
			legend.append("text")
				.attr("x", 0)
				.attr("y", 176)
				.attr("fill", "#64717f")
				.attr("font-size", 11)
				.attr("font-weight", 800)
				.text("Adjusted damage");

			[d3.min(vis.displayData, getDamage), d3.mean(vis.displayData, getDamage), d3.max(vis.displayData, getDamage)].forEach((value, index) => {
				const item = legend.append("g")
					.attr("transform", `translate(0,${194 + index * 26})`);

				item.append("rect")
					.attr("width", 22)
					.attr("height", 14)
					.attr("fill", damageColor(value));

				item.append("text")
					.attr("x", 32)
					.attr("y", 11)
					.attr("fill", "#64717f")
					.attr("font-size", 11)
					.text(`$${Math.round(value)}B`);
			});
		}
	}
}

/* * * * * * * * * * * * * *
*     EconomicImpactVis     *
* * * * * * * * * * * * * */

class EconomicImpactVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.loadState = options.loadState || "loading";
		this.loadError = options.loadError || null;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.wrangleData();
	}

	setData(data, options = {}) {
		let vis = this;

		vis.data = data;
		vis.loadState = options.loadState || vis.loadState;
		vis.loadError = options.loadError || null;
		vis.wrangleData();
	}

	showStatus(message) {
		let vis = this;

		clearChart("#" + vis.parentElement);
		d3.select("#" + vis.parentElement)
			.append("div")
			.attr("class", "chart-status")
			.text(message);
	}

	wrangleData() {
		let vis = this;

		if (vis.loadState === "loading") {
			vis.showStatus("Loading economic damage data...");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${disastersCsvPath}. Serve the site locally so D3 can request the CSV.`);
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No reported adjusted damage values were found in disasters.csv.");
			return;
		}

		vis.displayData = vis.data;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const { width, height } = getChartSize("#" + vis.parentElement, 360);
		const margin = { top: 56, right: 24, bottom: 58, left: 72 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;
		const getYear = d => Number(d.year);
		const getDamage = d => Number(d.totalDamageBillions);
		const formatComma = d3.format(",");
		const maxDamageYear = d3.greatest(vis.displayData, getDamage);

		const svg = d3.select("#" + vis.parentElement)
			.append("svg")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("aria-hidden", "true");

		const chart = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const x = d3.scaleBand()
			.domain(vis.displayData.map(getYear))
			.range([0, innerWidth])
			.padding(0.18);

		const y = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, getDamage) * 1.15])
			.nice()
			.range([innerHeight, 0]);
		const xTickValues = x.domain().filter((year, index) => index % 4 === 0);
		const lastYear = x.domain().at(-1);

		if (!xTickValues.includes(lastYear)) {
			const previousTick = xTickValues.at(-1);

			if (lastYear - previousTick < 3) {
				xTickValues.pop();
			}

			xTickValues.push(lastYear);
		}

		chart.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""))
			.select(".domain")
			.remove();

		chart.selectAll("rect.damage-bar")
			.data(vis.displayData)
			.join("rect")
			.attr("class", "damage-bar")
			.attr("x", d => x(getYear(d)))
			.attr("y", d => y(getDamage(d)))
			.attr("width", x.bandwidth())
			.attr("height", d => innerHeight - y(getDamage(d)))
			.attr("fill", d => d === maxDamageYear ? "#c84b31" : "#4b83a6")
			.attr("fill-opacity", 0.9)
			.append("title")
			.text(d => `${getYear(d)}: $${formatNumber(getDamage(d))}B adjusted damage, ${formatComma(d.disasterEvents)} weather-related events, ${formatNumber(d.peopleAffectedMillions)}M people affected, ${formatComma(d.totalDeaths)} deaths`);

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x)
				.tickValues(xTickValues)
				.tickFormat(d3.format("d")));

		chart.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${formatNumber(d, 0)}B`));

		chart.append("text")
			.attr("x", 0)
			.attr("y", -28)
			.attr("fill", "#17212b")
			.attr("font-size", 14)
			.attr("font-weight", 800)
			.text("Adjusted disaster damage by year");

		chart.append("text")
			.attr("x", 0)
			.attr("y", -10)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.attr("font-weight", 700)
			.text("Weather-related U.S. disasters, billions of adjusted USD");

		chart.append("text")
			.attr("x", x(getYear(maxDamageYear)) + x.bandwidth() / 2)
			.attr("y", y(getDamage(maxDamageYear)) - 10)
			.attr("fill", "#c84b31")
			.attr("font-size", 11)
			.attr("font-weight", 800)
			.attr("text-anchor", "middle")
			.text(`${getYear(maxDamageYear)}: $${formatNumber(getDamage(maxDamageYear))}B`);
	}
}

/* * * * * * * * * * * * * *
*      HumanImpactVis       *
* * * * * * * * * * * * * */

class HumanImpactVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.loadState = options.loadState || "loading";
		this.loadError = options.loadError || null;
		this.tagElement = options.tagElement || null;
		this.selectedYear = options.selectedYear ?? data.at(-1)?.year ?? null;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.wrangleData();
	}

	setData(data, options = {}) {
		let vis = this;

		vis.data = data;
		vis.loadState = options.loadState || vis.loadState;
		vis.loadError = options.loadError || null;

		if (!vis.data.some(row => row.year === vis.selectedYear)) {
			vis.selectedYear = vis.data.at(-1)?.year ?? null;
		}

		vis.wrangleData();
	}

	showStatus(message, tagText) {
		let vis = this;
		const tag = document.querySelector("#" + vis.tagElement);

		if (tag) {
			tag.textContent = tagText;
		}

		clearChart("#" + vis.parentElement);
		d3.select("#" + vis.parentElement)
			.append("div")
			.attr("class", "chart-status")
			.text(message);
	}

	wrangleData() {
		let vis = this;

		if (vis.loadState === "loading") {
			vis.showStatus("Loading human impact data...", "Loading");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${disastersCsvPath}. Serve the site locally so D3 can request the CSV.`, "Data error");
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No affected or death totals were found in disasters.csv.", "No data");
			return;
		}

		if (!vis.data.some(row => row.year === vis.selectedYear)) {
			vis.selectedYear = vis.data.at(-1).year;
		}

		vis.displayData = vis.data;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const container = d3.select("#" + vis.parentElement);
		const containerNode = document.getElementById(vis.parentElement);
		const tag = document.querySelector("#" + vis.tagElement);
		const selectedYearData = vis.displayData.find(row => row.year === vis.selectedYear);
		const firstYear = vis.displayData[0].year;
		const lastYear = vis.displayData.at(-1).year;
		const formatComma = d3.format(",");
		const getYear = d => Number(d.year);
		const getAffected = d => Number(d.peopleAffected);
		const getDeaths = d => Number(d.totalDeaths);
		const maxAffectedRow = d3.greatest(vis.displayData, getAffected);
		const maxDeathsRow = d3.greatest(vis.displayData, getDeaths);
		const maxDeaths = d3.max(vis.displayData, getDeaths) || 1;
		const width = containerNode.clientWidth || 760;
		const isCompact = width < 760;

		if (tag) {
			tag.textContent = `${firstYear}-${lastYear}`;
		}

		if (containerNode) {
			containerNode.setAttribute(
				"aria-label",
				`Linked view. Click a year in the deaths bar chart to update people affected. Selected year ${selectedYearData.year}: ${formatComma(selectedYearData.peopleAffected)} people affected and ${formatComma(selectedYearData.totalDeaths)} deaths.`
			);
		}

		const layout = container.append("div")
			.attr("class", "human-impact-layout");
		const chartWidth = Math.max(340, width);
		const affectedMargin = {
			top: 48,
			right: isCompact ? 26 : 34,
			bottom: 38,
			left: isCompact ? 48 : 56
		};
		const rowHeight = isCompact ? 15 : 16;
		const affectedHeight = affectedMargin.top + affectedMargin.bottom + vis.displayData.length * rowHeight;
		const innerWidth = chartWidth - affectedMargin.left - affectedMargin.right;
		const innerHeight = affectedHeight - affectedMargin.top - affectedMargin.bottom;
		const barHeight = Math.max(7, Math.min(11, rowHeight * 0.56));
		const x = d3.scaleLinear()
			.domain([0, maxDeaths])
			.nice()
			.range([0, innerWidth]);
		const y = d3.scaleBand()
			.domain(vis.displayData.map(getYear))
			.range([0, innerHeight])
			.padding(0.28);
		const deathColor = d3.scaleLinear()
			.domain([0, maxDeaths * 0.55, maxDeaths])
			.range(["#cfe8d6", "#d9a441", "#c84b31"]);
		const formatAffectedLabel = value => {
			if (value >= 1000000) {
				return `${formatNumber(value / 1000000)}M`;
			}

			if (value >= 1000) {
				return `${formatNumber(value / 1000)}K`;
			}

			return formatComma(value);
		};
		const formatDeathLabel = value => formatComma(value);
		const axisTicks = isCompact ? 3 : 4;

		const affectedPanel = layout.append("div")
			.attr("class", "affected-linked-panel");

		const svg = affectedPanel.append("svg")
			.attr("viewBox", `0 0 ${chartWidth} ${affectedHeight}`)
			.attr("aria-hidden", "true");

		svg.append("text")
			.attr("x", affectedMargin.left)
			.attr("y", 20)
			.attr("fill", "#17212b")
			.attr("font-size", 14)
			.attr("font-weight", 800)
			.text("Deaths from weather-related disasters");

		svg.append("text")
			.attr("x", affectedMargin.left)
			.attr("y", 36)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.attr("font-weight", 700)
			.text("Click a year to update the people affected card. Bar length shows total deaths.");

		const chart = svg.append("g")
			.attr("transform", `translate(${affectedMargin.left},${affectedMargin.top})`);

		const grid = chart.append("g")
			.attr("class", "grid human-impact-grid")
			.call(d3.axisBottom(x)
				.ticks(axisTicks)
				.tickSize(innerHeight)
				.tickFormat(""));

		grid.select(".domain").remove();

		const rows = chart.selectAll("g.impact-row")
			.data(vis.displayData, d => d.year)
			.join("g")
			.attr("class", d => `impact-row${d.year === vis.selectedYear ? " selected" : ""}`)
			.attr("tabindex", 0)
			.attr("role", "button")
			.attr("aria-label", d => `Select ${getYear(d)}: ${formatComma(getDeaths(d))} deaths and ${formatComma(d.peopleAffected)} people affected`)
			.on("click", function(event, d) {
				selectYear(d);
			})
			.on("keydown", function(event, d) {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					selectYear(d);
				}
			});

		function selectYear(d) {
			if (vis.selectedYear === d.year) {
				return;
			}

			vis.selectedYear = d.year;
			vis.wrangleData();
		}

		rows.append("rect")
			.attr("class", "impact-row-hitbox")
			.attr("x", -affectedMargin.left + 6)
			.attr("y", d => y(getYear(d)) - 2)
			.attr("width", innerWidth + affectedMargin.left + affectedMargin.right - 12)
			.attr("height", y.bandwidth() + 4);

		rows.append("text")
			.attr("class", "impact-year-label")
			.attr("x", -14)
			.attr("y", d => y(getYear(d)) + y.bandwidth() / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "end")
			.text(d => getYear(d));

		rows.append("rect")
			.attr("class", "impact-bar-track")
			.attr("x", 0)
			.attr("y", d => y(getYear(d)) + (y.bandwidth() - barHeight) / 2)
			.attr("width", innerWidth)
			.attr("height", barHeight);

		rows.append("rect")
			.attr("class", "impact-bar")
			.attr("x", 0)
			.attr("y", d => y(getYear(d)) + (y.bandwidth() - barHeight) / 2)
			.attr("width", d => Math.max(getDeaths(d) > 0 ? 2 : 0, x(getDeaths(d))))
			.attr("height", barHeight)
			.attr("fill", row => row.year === vis.selectedYear ? "#c84b31" : deathColor(getDeaths(row)));

		rows.append("text")
			.attr("class", "impact-value-label")
			.attr("x", d => {
				const barWidth = x(getDeaths(d));
				return barWidth > innerWidth - 86 ? barWidth - 8 : barWidth + 8;
			})
			.attr("y", d => y(getYear(d)) + y.bandwidth() / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", d => x(getDeaths(d)) > innerWidth - 86 ? "end" : "start")
			.text(d => formatDeathLabel(getDeaths(d)));

		rows.append("title")
			.text(d => `${getYear(d)}: ${formatComma(getDeaths(d))} deaths, ${formatComma(d.peopleAffected)} people affected`);

		chart.append("g")
			.attr("class", "axis human-impact-axis")
			.attr("transform", `translate(0,${innerHeight + 10})`)
			.call(d3.axisBottom(x)
				.ticks(axisTicks)
				.tickFormat(value => formatDeathLabel(value)));

		chart.select(".human-impact-axis .domain").remove();

		chart.append("text")
			.attr("x", 0)
			.attr("y", innerHeight + 32)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.attr("font-weight", 700)
			.text("Total deaths");

		chart.append("text")
			.attr("class", "impact-overflow-label")
			.attr("x", innerWidth)
			.attr("y", -8)
			.attr("text-anchor", "end")
			.text(`Max: ${formatDeathLabel(maxDeathsRow.totalDeaths)}`);

		const detail = layout.append("div")
			.attr("class", "impact-detail-panel")
			.attr("aria-live", "polite");
		const defaultAffectedIconValue = 20000;
		const affectedIconValue = selectedYearData.year === 2016
			? 1000000
			: defaultAffectedIconValue;
		const affectedIconCount = selectedYearData.peopleAffected > 0
			? Math.max(1, Math.ceil(selectedYearData.peopleAffected / affectedIconValue))
			: 0;
		const useDenseIcons = affectedIconCount > 120;
		const iconScale = useDenseIcons ? 0.62 : 1;
		const iconWidth = useDenseIcons ? 16 : 30;
		const iconHeight = useDenseIcons ? 24 : 40;
		const iconPanelWidth = isCompact
			? Math.max(240, width - 44)
			: Math.max(280, Math.floor((width - 44) * 0.48));
		const iconColumns = Math.max(6, Math.floor(iconPanelWidth / iconWidth));
		const iconRows = Math.max(1, Math.ceil(affectedIconCount / iconColumns));
		const iconSvgWidth = iconColumns * iconWidth;
		const iconSvgHeight = iconRows * iconHeight + 18;

		const detailCopy = detail.append("div")
			.attr("class", "impact-detail-copy");

		detailCopy.append("span")
			.attr("class", "impact-detail-kicker")
			.text(`Selected year: ${selectedYearData.year}`);

		detailCopy.append("strong")
			.attr("class", "impact-total")
			.text(formatComma(selectedYearData.peopleAffected));

		detailCopy.append("p")
			.text("people affected by weather-related disasters");

		const statGrid = detailCopy.append("div")
			.attr("class", "impact-stat-grid");

		[
			{ label: "Deaths", value: formatComma(selectedYearData.totalDeaths) },
			{ label: "Weather events", value: formatComma(selectedYearData.disasterEvents) }
		].forEach(item => {
			const stat = statGrid.append("div");
			stat.append("span").text(item.label);
			stat.append("strong").text(item.value);
		});

		const iconPanel = detail.append("div")
			.attr("class", "impact-icon-panel");

		iconPanel.append("p")
			.text(`Each figure represents about ${formatAffectedLabel(affectedIconValue)} people affected.`);

		if (selectedYearData.year === 2016) {
			iconPanel.append("p")
				.attr("class", "impact-icon-note")
				.text("2016 uses a larger icon value because its affected total is an outlier.");
		}

		const iconScroll = iconPanel.append("div")
			.attr("class", "impact-icon-scroll");

		const iconSvg = iconScroll.append("svg")
			.attr("viewBox", `0 0 ${iconSvgWidth} ${iconSvgHeight}`)
			.attr("aria-hidden", "true");

		const icons = iconSvg.selectAll("g.impact-icon")
			.data(d3.range(affectedIconCount))
			.join("g")
			.attr("class", "impact-icon")
			.attr("transform", index => `translate(${(index % iconColumns) * iconWidth + (useDenseIcons ? 2 : 6)},${Math.floor(index / iconColumns) * iconHeight + 4}) scale(${iconScale})`);

		icons.append("circle")
			.attr("cx", 9)
			.attr("cy", 7)
			.attr("r", 6);

		icons.append("rect")
			.attr("x", 4)
			.attr("y", 15)
			.attr("width", 10)
			.attr("height", 18)
			.attr("rx", 5);

		if (!affectedIconCount) {
			iconSvg.append("text")
				.attr("x", 0)
				.attr("y", 24)
				.attr("fill", "#64717f")
				.attr("font-size", 13)
				.attr("font-weight", 800)
				.text("No people affected reported for the selected year.");
		}
	}
}

function loadTemperatureCo2Data() {
	return d3.csv(climateCsvPath)
		.then(rows => {
			temperatureCo2Data = prepareTemperatureCo2Data(rows);
			co2Correlation = getPearsonCorrelation(
				temperatureCo2Data,
				d => d.avgTemperature,
				d => d.co2Emissions
			);
			co2TrendVis.setData(temperatureCo2Data, {
				correlation: co2Correlation,
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${climateCsvPath}`, error);
			co2TrendVis.setData([], {
				loadError: error,
				loadState: "error"
			});
		});
}

function loadCorrelationWeatherData() {
	return Promise.all([
		d3.csv(climateCsvPath),
		d3.csv(disastersCsvPath)
	])
		.then(([climateRows, disasterRows]) => {
			correlationWeatherData = prepareCorrelationWeatherData(climateRows, disasterRows);
			temperatureWeatherEventsCorrelation = getPearsonCorrelation(
				correlationWeatherData,
				d => d.avgTemperature,
				d => d.disasterEvents
			);
			correlationVis.setData(correlationWeatherData, {
				correlation: temperatureWeatherEventsCorrelation,
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${climateCsvPath} and ${disastersCsvPath}`, error);
			correlationVis.setData([], {
				loadError: error,
				loadState: "error"
			});
		});
}

function loadEconomicImpactData() {
	return d3.csv(disastersCsvPath)
		.then(rows => {
			economicDamageData = prepareEconomicDamageData(rows);
			economicImpactVis.setData(economicDamageData, {
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${disastersCsvPath}`, error);
			economicImpactVis.setData([], {
				loadError: error,
				loadState: "error"
			});
		});
}

function loadHumanImpactData() {
	return d3.csv(disastersCsvPath)
		.then(rows => {
			humanImpactData = prepareHumanImpactData(rows);
			humanImpactVis.setData(humanImpactData, {
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${disastersCsvPath}`, error);
			humanImpactVis.setData([], {
				loadError: error,
				loadState: "error"
			});
		});
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
	[
		co2TrendVis,
		eventExplorerVis,
		correlationVis,
		economicImpactVis,
		humanImpactVis
	].forEach(vis => {
		if (vis) {
			vis.wrangleData();
		}
	});
}

co2TrendVis = new Co2TrendVis("co2-line-chart", [], {
	loadState: "loading",
	tagElement: "co2-year-tag"
});
eventExplorerVis = new EventExplorerVis("event-chart", eventData);
correlationVis = new CorrelationVis("correlation-visual", [], {
	loadState: "loading"
});
economicImpactVis = new EconomicImpactVis("economic-impact-visual", [], {
	loadState: "loading"
});
humanImpactVis = new HumanImpactVis("human-impact-view", [], {
	loadState: "loading",
	tagElement: "human-impact-year-tag"
});

document.querySelectorAll(".filter-button").forEach(button => {
	button.addEventListener("click", () => {
		document.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
		button.classList.add("active");
		eventExplorerVis.setFilter(button.dataset.type);
	});
});

document.querySelector("#reset-events").addEventListener("click", () => {
	document.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
	document.querySelector('[data-type="all"]').classList.add("active");
	eventExplorerVis.setFilter("all");
});

window.addEventListener("resize", drawAllCharts);
window.addEventListener("scroll", setActiveNav);
setActiveNav();
loadTemperatureCo2Data();
loadCorrelationWeatherData();
loadEconomicImpactData();
loadHumanImpactData();
