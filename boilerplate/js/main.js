const climateCsvPath = "data/climate.csv";
const disastersCsvPath = "data/disasters.csv";
const usaCountryNames = new Set(["USA", "United States", "United States of America"]);
const weatherDisasterGroups = new Set(["Climatological", "Hydrological", "Meteorological"]);
let climographData = [];
let temperatureCo2Data = [];
let co2Correlation = null;
let correlationWeatherData = [];
let temperatureWeatherEventsCorrelation = null;
let economicDamageData = [];
let humanImpactData = [];
let extremeEventTimelineData = [];
let climographVis;
let co2TrendVis;
let extremeEventTimelineVis;
let correlationVis;
let economicImpactVis;
let humanImpactVis;

const disasterTypeColors = {
	Drought: "#d9a441",
	"Extreme temperature": "#c84b31",
	Flood: "#1c7c76",
	"Mass movement (wet)": "#8f6a42",
	Storm: "#4b83a6",
	Wildfire: "#38664f"
};

const disasterTypeIconIds = {
	Drought: "event-icon-drought",
	"Extreme temperature": "event-icon-temperature",
	Flood: "event-icon-flood",
	"Mass movement (wet)": "event-icon-rock",
	Storm: "event-icon-storm",
	Wildfire: "event-icon-fire"
};

function iconIdForDisasterType(type) {
	return disasterTypeIconIds[type] || "event-icon-storm";
}

function appendDisasterIconSymbols(svg) {
	const defs = svg.append("defs");

	const storm = defs.append("symbol")
		.attr("id", disasterTypeIconIds.Storm)
		.attr("viewBox", "0 0 32 32");
	storm.append("path")
		.attr("d", "M8 22h16a6 6 0 0 0 1-11.9A8 8 0 0 0 9.8 8.2 6.4 6.4 0 0 0 8 22Z")
		.attr("fill", "#dceaf2")
		.attr("stroke", "#4b83a6")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round");
	storm.append("path")
		.attr("d", "M17 17 12 27l6-2-3 7 10-13-6 2 3-4Z")
		.attr("fill", "#f2c94c")
		.attr("stroke", "#9a6b00")
		.attr("stroke-width", 1.2)
		.attr("stroke-linejoin", "round");

	const flood = defs.append("symbol")
		.attr("id", disasterTypeIconIds.Flood)
		.attr("viewBox", "0 0 32 32");
	flood.append("path")
		.attr("d", "M3 18c4-5 8-5 13 0s9 5 13 0v10H3Z")
		.attr("fill", "#48b7d1")
		.attr("stroke", "#1c7c76")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round");
	flood.append("path")
		.attr("d", "M3 22c4-4 8-4 13 0s9 4 13 0")
		.attr("fill", "none")
		.attr("stroke", "#ffffff")
		.attr("stroke-width", 2.2)
		.attr("stroke-linecap", "round");
	flood.append("path")
		.attr("d", "M7 16c3-2 6-2 9 1")
		.attr("fill", "none")
		.attr("stroke", "#b8edf5")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round");

	const fire = defs.append("symbol")
		.attr("id", disasterTypeIconIds.Wildfire)
		.attr("viewBox", "0 0 32 32");
	fire.append("path")
		.attr("d", "M16 30C9 28 6 23 8 17c1-4 5-6 5-13 5 3 10 8 10 15 2-2 3-4 3-7 4 5 4 12 1 16-3 4-7 5-11 2Z")
		.attr("fill", "#f15a24")
		.attr("stroke", "#38664f")
		.attr("stroke-width", 1.8)
		.attr("stroke-linejoin", "round");
	fire.append("path")
		.attr("d", "M16 28c-4-2-5-5-3-9 1-2 3-4 3-7 4 4 6 8 4 13-1 2-2 3-4 3Z")
		.attr("fill", "#ffd166");

	const thermometer = defs.append("symbol")
		.attr("id", disasterTypeIconIds["Extreme temperature"])
		.attr("viewBox", "0 0 32 32");
	thermometer.append("rect")
		.attr("x", 13)
		.attr("y", 4)
		.attr("width", 8)
		.attr("height", 20)
		.attr("rx", 4)
		.attr("fill", "#fff4ed")
		.attr("stroke", "#c84b31")
		.attr("stroke-width", 2);
	thermometer.append("circle")
		.attr("cx", 17)
		.attr("cy", 24)
		.attr("r", 7)
		.attr("fill", "#ff6b4a")
		.attr("stroke", "#c84b31")
		.attr("stroke-width", 2);
	thermometer.append("line")
		.attr("x1", 17)
		.attr("x2", 17)
		.attr("y1", 9)
		.attr("y2", 24)
		.attr("stroke", "#ff6b4a")
		.attr("stroke-width", 3)
		.attr("stroke-linecap", "round");

	const drought = defs.append("symbol")
		.attr("id", disasterTypeIconIds.Drought)
		.attr("viewBox", "0 0 32 32");
	drought.append("path")
		.attr("d", "M16 3C10 11 7 16 7 22c0 5 4 9 9 9s9-4 9-9c0-6-3-11-9-19Z")
		.attr("fill", "#9bd3ea")
		.attr("stroke", "#d9a441")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round");
	drought.append("path")
		.attr("d", "M12 22c0 3 2 5 5 5")
		.attr("fill", "none")
		.attr("stroke", "#ffffff")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round");

	const rock = defs.append("symbol")
		.attr("id", disasterTypeIconIds["Mass movement (wet)"])
		.attr("viewBox", "0 0 32 32");
	rock.append("path")
		.attr("d", "M5 22 10 10l8-5 9 8 4 11-10 7-12-2Z")
		.attr("fill", "#a9875b")
		.attr("stroke", "#5f472d")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round");
	rock.append("path")
		.attr("d", "M10 10 17 18l10-5M17 18l4 13M9 29l8-11")
		.attr("fill", "none")
		.attr("stroke", "#d7c4a6")
		.attr("stroke-width", 1.5)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round");
}

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

function readColumnValue(row, includeTerms) {
	const terms = includeTerms.map(term => term.toLowerCase());
	const columnName = Object.keys(row).find(key => {
		const normalizedKey = key.toLowerCase();
		return terms.every(term => normalizedKey.includes(term));
	});

	return columnName ? row[columnName] : undefined;
}

function formatNumber(value, digits = 1) {
	return Number(value).toFixed(digits).replace(/\.0$/, "");
}

function appendCalloutText(parent, lines, options) {
	const text = parent.append("text")
		.attr("x", options.x)
		.attr("y", options.y)
		.attr("fill", options.fill || "#17212b")
		.attr("font-size", options.fontSize || 11)
		.attr("font-weight", options.fontWeight || 800)
		.attr("text-anchor", options.textAnchor || "start");
	const lineHeight = options.lineHeight || 13;

	lines.forEach((line, index) => {
		text.append("tspan")
			.attr("x", options.x)
			.attr("dy", index === 0 ? 0 : lineHeight)
			.text(line);
	});

	return text;
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
			avgTemperature: readNumber(readColumnValue(row, ["avg temperature"])),
			co2Emissions: readNumber(readColumnValue(row, ["co2 emissions"]))
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

function prepareClimographData(rows) {
	const parsedRows = rows
		.map(row => ({
			year: readNumber(row.Year),
			country: String(row.Country ?? "").trim(),
			avgTemperature: readNumber(readColumnValue(row, ["avg temperature"])),
			precipitation: readNumber(
				readColumnValue(row, ["rainfall"]) ??
				readColumnValue(row, ["precipitation"])
			)
		}))
		.filter(row =>
			usaCountryNames.has(row.country) &&
			Number.isFinite(row.year) &&
			Number.isFinite(row.avgTemperature) &&
			Number.isFinite(row.precipitation)
		);

	return d3.rollups(
		parsedRows,
		values => ({
			avgTemperature: d3.mean(values, d => d.avgTemperature),
			precipitation: d3.mean(values, d => d.precipitation),
			observations: values.length
		}),
		d => d.year
	)
		.map(([year, values]) => ({
			year,
			avgTemperature: values.avgTemperature,
			precipitation: values.precipitation,
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

function prepareEventTimelineData(rows) {
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
			Number.isFinite(row.year) &&
			row.disasterType
		);

	return d3.rollups(
		parsedRows,
		yearRows => {
			const typeTotals = d3.rollups(
				yearRows,
				typeRows => ({
					disasterEvents: d3.sum(typeRows, d => d.totalEvents || 0),
					peopleAffected: d3.sum(typeRows, d => d.totalAffected || 0),
					totalDeaths: d3.sum(typeRows, d => d.totalDeaths || 0),
					totalDamage: d3.sum(typeRows, d => d.totalDamage || 0),
					rows: typeRows.length
				}),
				d => d.disasterType
			)
				.map(([disasterType, values]) => ({
					disasterType,
					disasterEvents: values.disasterEvents,
					peopleAffected: values.peopleAffected,
					peopleAffectedMillions: values.peopleAffected / 1000000,
					totalDeaths: values.totalDeaths,
					totalDamage: values.totalDamage,
					totalDamageBillions: values.totalDamage / 1000000000,
					rows: values.rows
				}))
				.sort((a, b) =>
					b.disasterEvents - a.disasterEvents ||
					d3.ascending(a.disasterType, b.disasterType)
				);
			const topType = typeTotals[0];
			const peopleAffected = d3.sum(yearRows, d => d.totalAffected || 0);
			const totalDeaths = d3.sum(yearRows, d => d.totalDeaths || 0);
			const totalDamage = d3.sum(yearRows, d => d.totalDamage || 0);
			const annualEvents = d3.sum(yearRows, d => d.totalEvents || 0);

			return {
				year: yearRows[0].year,
				topDisasterType: topType.disasterType,
				topDisasterEvents: topType.disasterEvents,
				annualEvents,
				peopleAffected,
				peopleAffectedMillions: peopleAffected / 1000000,
				totalDeaths,
				totalDamage,
				totalDamageBillions: totalDamage / 1000000000,
				rows: yearRows.length,
				topTypeRows: topType.rows,
				typeTotals
			};
		},
		d => d.year
	)
		.map(([, values]) => values)
		.filter(Boolean)
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
*       ClimographVis       *
* * * * * * * * * * * * * */

class ClimographVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.loadState = options.loadState || "loading";
		this.loadError = options.loadError || null;
		this.tagElement = options.tagElement || null;
		this.selectedYearRange = null;
		this.precipColor = "#4b83a6";
		this.tempColor = "#c84b31";

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
		vis.selectedYearRange = null;
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

	updateSummary() {
		let vis = this;
		const tag = document.querySelector("#" + vis.tagElement);
		const chart = document.querySelector("#" + vis.parentElement);

		if (!vis.data.length || !vis.selectedYearRange) {
			if (tag) {
				tag.textContent = vis.loadState === "ready" ? "No data" : "Loading data";
			}

			return;
		}

		const [startYear, endYear] = vis.selectedYearRange;
		const fullStart = vis.data[0].year;
		const fullEnd = vis.data.at(-1).year;
		const rangeLabel = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;

		if (tag) {
			tag.textContent = `${rangeLabel}`;
		}

		if (chart) {
			chart.setAttribute(
				"aria-label",
				`Climograph showing average U.S. temperature and precipitation from ${startYear} to ${endYear}. Timeline covers ${fullStart} to ${fullEnd}.`
			);
		}
	}

	wrangleData() {
		let vis = this;

		if (vis.loadState === "loading") {
			vis.showStatus("Loading USA climate data...", "Loading data");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${climateCsvPath}. Serve the site locally so D3 can request the CSV.`, "Data error");
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No usable USA temperature and precipitation rows were found in climate.csv.", "No data");
			return;
		}

		const fullRange = [vis.data[0].year, vis.data.at(-1).year];

		if (!vis.selectedYearRange) {
			vis.selectedYearRange = fullRange;
		}

		vis.displayData = vis.data.filter(row =>
			row.year >= vis.selectedYearRange[0] &&
			row.year <= vis.selectedYearRange[1]
		);

		if (!vis.displayData.length) {
			vis.selectedYearRange = fullRange;
			vis.displayData = vis.data;
		}

		vis.updateSummary();
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const { width, height } = getChartSize("#" + vis.parentElement, 470);
		const isCompact = width < 620;
		const margin = {
			top: isCompact ? 86 : 68,
			right: isCompact ? 56 : 76,
			bottom: 126,
			left: isCompact ? 58 : 72
		};
		const timelineHeight = 44;
		const timelineGap = 58;
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom - timelineHeight - timelineGap;
		const getYear = d => Number(d.year);
		const getTemperature = d => Number(d.avgTemperature);
		const getPrecipitation = d => Number(d.precipitation);
		const firstYear = vis.data[0].year;
		const lastYear = vis.data.at(-1).year;
		const allYears = vis.data.map(getYear);
		const [selectedStart, selectedEnd] = vis.selectedYearRange;
		const selectedSpan = Math.max(1, selectedEnd - selectedStart + 1);
		const barWidth = Math.max(6, Math.min(30, innerWidth / selectedSpan * 0.58));
		const formatComma = d3.format(",");
		const formatPointLabel = d => `${getYear(d)}\nAverage temperature: ${formatNumber(getTemperature(d))} C\nAverage precipitation: ${formatComma(Math.round(getPrecipitation(d)))} mm`;

		const svg = d3.select("#" + vis.parentElement)
			.append("svg")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("aria-hidden", "true");

		const chart = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const x = d3.scaleLinear()
			.domain([selectedStart - 0.5, selectedEnd + 0.5])
			.range([0, innerWidth]);

		const yPrecipitation = d3.scaleLinear()
			.domain([0, (d3.max(vis.displayData, getPrecipitation) || 1) * 1.14])
			.nice()
			.range([innerHeight, 0]);

		const yTemperature = d3.scaleLinear()
			.domain(getPaddedDomain(vis.displayData.map(getTemperature), 0.18))
			.nice()
			.range([innerHeight, 0]);

		const temperatureLine = d3.line()
			.defined(d => Number.isFinite(getTemperature(d)))
			.x(d => x(getYear(d)))
			.y(d => yTemperature(getTemperature(d)));

		chart.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(yPrecipitation).tickSize(-innerWidth).tickFormat(""))
			.select(".domain")
			.remove();

		chart.selectAll("rect.precip-bar")
			.data(vis.displayData)
			.join("rect")
			.attr("class", "precip-bar")
			.attr("x", d => x(getYear(d)) - barWidth / 2)
			.attr("y", d => yPrecipitation(getPrecipitation(d)))
			.attr("width", barWidth)
			.attr("height", d => innerHeight - yPrecipitation(getPrecipitation(d)))
			.attr("fill", vis.precipColor)
			.attr("fill-opacity", 0.78)
			.append("title")
			.text(formatPointLabel);

		chart.append("path")
			.datum(vis.displayData)
			.attr("fill", "none")
			.attr("stroke", vis.tempColor)
			.attr("stroke-width", 4)
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			.attr("d", temperatureLine);

		chart.selectAll("circle.temperature-point")
			.data(vis.displayData)
			.join("circle")
			.attr("class", "temperature-point")
			.attr("cx", d => x(getYear(d)))
			.attr("cy", d => yTemperature(getTemperature(d)))
			.attr("r", 4.5)
			.attr("fill", vis.tempColor)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1.8)
			.append("title")
			.text(formatPointLabel);

		const xTickCount = isCompact ? 4 : 7;
		let xTicks = allYears
			.filter(year => year >= selectedStart && year <= selectedEnd)
			.filter((year, index, years) => index === 0 || index === years.length - 1 || index % Math.ceil(years.length / xTickCount) === 0);
		if (selectedEnd === lastYear && selectedStart !== selectedEnd) {
			xTicks = xTicks.filter(year => year !== lastYear);
		}

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x)
				.tickValues(xTicks)
				.tickFormat(d3.format("d")));

		chart.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(yPrecipitation).ticks(5).tickFormat(d => `${formatNumber(d, 0)} mm`));

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(${innerWidth},0)`)
			.call(d3.axisRight(yTemperature).ticks(5).tickFormat(d => `${formatNumber(d)} C`));

		chart.append("text")
			.attr("x", 0)
			.attr("y", -18)
			.attr("fill", vis.precipColor)
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.text("Avg precipitation (mm)");

		chart.append("text")
			.attr("x", innerWidth)
			.attr("y", -18)
			.attr("fill", vis.tempColor)
			.attr("font-size", 12)
			.attr("font-weight", 800)
			.attr("text-anchor", "end")
			.text("Avg temperature (C)");

		const legend = svg.append("g")
			.attr("class", "chart-legend")
			.attr("transform", `translate(${margin.left},24)`);

		[
			{ label: "Avg precipitation", color: vis.precipColor, type: "bar" },
			{ label: "Avg temperature", color: vis.tempColor, type: "line" }
		].forEach((item, index) => {
			const legendItem = legend.append("g")
				.attr("transform", isCompact ? `translate(0,${index * 20})` : `translate(${index * 150},0)`);

			if (item.type === "bar") {
				legendItem.append("rect")
					.attr("x", 0)
					.attr("y", -8)
					.attr("width", 28)
					.attr("height", 12)
					.attr("fill", item.color)
					.attr("fill-opacity", 0.78);
			} else {
				legendItem.append("line")
					.attr("x1", 0)
					.attr("x2", 28)
					.attr("y1", 0)
					.attr("y2", 0)
					.attr("stroke", item.color)
					.attr("stroke-width", 4)
					.attr("stroke-linecap", "round");
			}

			legendItem.append("text")
				.attr("x", 38)
				.attr("y", 4)
				.attr("fill", "#344350")
				.attr("font-size", 12)
				.attr("font-weight", 800)
				.text(item.label);
		});

		const timelineY = innerHeight + timelineGap;
		const timeline = chart.append("g")
			.attr("class", "climograph-timeline")
			.attr("transform", `translate(0,${timelineY})`);

		const xTimeline = d3.scaleLinear()
			.domain([firstYear - 0.5, lastYear + 0.5])
			.range([0, innerWidth]);

		const yTimelinePrecipitation = d3.scaleLinear()
			.domain([0, d3.max(vis.data, getPrecipitation) || 1])
			.range([timelineHeight, 0]);

		const yTimelineTemperature = d3.scaleLinear()
			.domain(getPaddedDomain(vis.data.map(getTemperature), 0.1))
			.range([timelineHeight, 0]);

		const timelineBarWidth = Math.max(3, Math.min(14, innerWidth / Math.max(1, lastYear - firstYear + 1) * 0.52));
		const timelineLine = d3.line()
			.x(d => xTimeline(getYear(d)))
			.y(d => yTimelineTemperature(getTemperature(d)));

		chart.append("text")
			.attr("x", 0)
			.attr("y", timelineY - 14)
			.attr("fill", "#64717f")
			.attr("font-size", 11)
			.attr("font-weight", 800)
			.text("Year timeline");

		timeline.selectAll("rect.timeline-bar")
			.data(vis.data)
			.join("rect")
			.attr("class", "timeline-bar")
			.attr("x", d => xTimeline(getYear(d)) - timelineBarWidth / 2)
			.attr("y", d => yTimelinePrecipitation(getPrecipitation(d)))
			.attr("width", timelineBarWidth)
			.attr("height", d => timelineHeight - yTimelinePrecipitation(getPrecipitation(d)))
			.attr("fill", vis.precipColor)
			.attr("fill-opacity", 0.34);

		timeline.append("path")
			.datum(vis.data)
			.attr("fill", "none")
			.attr("stroke", vis.tempColor)
			.attr("stroke-width", 2)
			.attr("stroke-opacity", 0.8)
			.attr("d", timelineLine);

		timeline.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${timelineHeight + 8})`)
			.call(d3.axisBottom(xTimeline)
				.ticks(isCompact ? 4 : 6)
				.tickFormat(d3.format("d")));

		const brush = d3.brushX()
			.extent([[0, 0], [innerWidth, timelineHeight]])
			.on("end", event => {
				if (!event.sourceEvent) {
					return;
				}

				if (!event.selection) {
					vis.selectedYearRange = [firstYear, lastYear];
					vis.wrangleData();
					return;
				}

				const [x0, x1] = event.selection;
				let yearsInSelection = allYears.filter(year => {
					const center = xTimeline(year);
					return center >= x0 && center <= x1;
				});

				if (!yearsInSelection.length) {
					const midpoint = (x0 + x1) / 2;
					const nearestYear = d3.least(allYears, year => Math.abs(xTimeline(year) - midpoint));
					yearsInSelection = [nearestYear];
				}

				const nextRange = [yearsInSelection[0], yearsInSelection.at(-1)];

				if (
					nextRange[0] === vis.selectedYearRange[0] &&
					nextRange[1] === vis.selectedYearRange[1]
				) {
					return;
				}

				vis.selectedYearRange = nextRange;
				vis.wrangleData();
			});

		timeline.append("g")
			.attr("class", "timeline-brush")
			.call(brush)
			.call(brush.move, [
				xTimeline(selectedStart - 0.5),
				xTimeline(selectedEnd + 0.5)
			]);
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
*  ExtremeEventTimelineVis  *
* * * * * * * * * * * * * */

class ExtremeEventTimelineVis {
	constructor(parentElement, data, options = {}) {
		this.parentElement = parentElement;
		this.data = data;
		this.loadState = options.loadState || "loading";
		this.loadError = options.loadError || null;
		this.tagElement = options.tagElement || null;
		this.defaultDisasterType = "__top__";
		this.selectedDisasterType = this.defaultDisasterType;
		this.hiddenLayers = new Set();
		this.focusedYears = [];
		this.typeOptions = [];

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
		vis.typeOptions = vis.getTypeOptions();
		if (
			vis.selectedDisasterType !== vis.defaultDisasterType &&
			!vis.typeOptions.includes(vis.selectedDisasterType)
		) {
			vis.selectedDisasterType = vis.defaultDisasterType;
		}
		vis.focusedYears = vis.focusedYears.filter(year =>
			vis.data.some(row => row.year === year)
		);
		vis.wrangleData();
	}

	getTypeOptions() {
		let vis = this;

		return d3.rollups(
			vis.data.flatMap(row => row.typeTotals || []),
			values => d3.sum(values, d => d.disasterEvents || 0),
			d => d.disasterType
		)
			.filter(([disasterType]) => disasterType)
			.sort(([firstType, firstEvents], [secondType, secondEvents]) =>
				secondEvents - firstEvents ||
				d3.ascending(firstType, secondType)
			)
			.map(([disasterType]) => disasterType);
	}

	getDisplayData() {
		let vis = this;

		return vis.data.map(yearRow => {
			if (vis.selectedDisasterType === vis.defaultDisasterType) {
				return {
					year: yearRow.year,
					disasterType: yearRow.topDisasterType,
					topDisasterType: yearRow.topDisasterType,
					disasterEvents: yearRow.topDisasterEvents,
					annualEvents: yearRow.annualEvents,
					peopleAffected: yearRow.peopleAffected,
					peopleAffectedMillions: yearRow.peopleAffectedMillions,
					totalDeaths: yearRow.totalDeaths,
					totalDamage: yearRow.totalDamage,
					totalDamageBillions: yearRow.totalDamageBillions,
					rows: yearRow.rows,
					metricScope: "All weather-related disasters"
				};
			}

			const typeRow = (yearRow.typeTotals || [])
				.find(row => row.disasterType === vis.selectedDisasterType);
			const disasterEvents = typeRow?.disasterEvents || 0;
			const peopleAffected = typeRow?.peopleAffected || 0;
			const totalDeaths = typeRow?.totalDeaths || 0;
			const totalDamage = typeRow?.totalDamage || 0;

			return {
				year: yearRow.year,
				disasterType: vis.selectedDisasterType,
				topDisasterType: yearRow.topDisasterType,
				disasterEvents,
				annualEvents: disasterEvents,
				peopleAffected,
				peopleAffectedMillions: peopleAffected / 1000000,
				totalDeaths,
				totalDamage,
				totalDamageBillions: totalDamage / 1000000000,
				rows: typeRow?.rows || 0,
				metricScope: `${vis.selectedDisasterType} disasters`
			};
		});
	}

	getMetricMaxima() {
		let vis = this;
		const metricRows = [];

		vis.data.forEach(row => {
			metricRows.push({
				totalDeaths: row.totalDeaths,
				peopleAffected: row.peopleAffected,
				totalDamage: row.totalDamage
			});
			(row.typeTotals || []).forEach(typeRow => metricRows.push(typeRow));
		});

		return {
			deaths: d3.max(metricRows, d => d.totalDeaths) || 1,
			affected: d3.max(metricRows, d => d.peopleAffected) || 1,
			damage: d3.max(metricRows, d => d.totalDamage) || 1
		};
	}

	getEventDomainMax() {
		let vis = this;

		return d3.max(
			vis.data.flatMap(row => (row.typeTotals || []).map(typeRow => typeRow.disasterEvents || 0))
		) || 1;
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

	updateSummary() {
		let vis = this;
		const tag = document.querySelector("#" + vis.tagElement);
		const chart = document.querySelector("#" + vis.parentElement);

		if (!vis.data.length) {
			if (tag) {
				tag.textContent = vis.loadState === "ready" ? "No data" : "Loading data";
			}

			return;
		}

		const firstYear = vis.data[0].year;
		const lastYear = vis.data.at(-1).year;
		const filterLabel = vis.selectedDisasterType === vis.defaultDisasterType
			? "Most frequent"
			: vis.selectedDisasterType;
		const selectedYears = vis.focusedYears.slice().sort((a, b) => a - b);
		const hasFocusedYears = selectedYears.length > 0;
		const yearLabel = hasFocusedYears
			? selectedYears.length === 1
				? `${selectedYears[0]}`
				: selectedYears.every((year, index) => index === 0 || year === selectedYears[index - 1] + 1)
					? `${selectedYears[0]}-${selectedYears.at(-1)}`
					: `${selectedYears.length} selected years`
			: `${firstYear}-${lastYear}`;

		if (tag) {
			tag.textContent = `${filterLabel}, ${yearLabel}`;
		}

		if (chart) {
			chart.setAttribute(
				"aria-label",
				hasFocusedYears
					? `Focused scatter plot for ${yearLabel} showing disaster event count and proportional deaths, people affected, and adjusted damages.`
					: `Scatter plot from ${firstYear} to ${lastYear} showing yearly disaster event counts. Dot color shows disaster type, y position shows event count, and rings show proportional deaths, people affected, and adjusted damages.`
			);
		}
	}

	wrangleData() {
		let vis = this;

		if (vis.loadState === "loading") {
			vis.showStatus("Loading extreme weather event data...", "Loading data");
			return;
		}

		if (vis.loadState === "error") {
			vis.showStatus(`Could not load ${disastersCsvPath}. Serve the site locally so D3 can request the CSV.`, "Data error");
			return;
		}

		if (!vis.data.length) {
			vis.showStatus("No weather-related disaster event rows were found in disasters.csv.", "No data");
			return;
		}

		vis.typeOptions = vis.getTypeOptions();
		if (
			vis.selectedDisasterType !== vis.defaultDisasterType &&
			!vis.typeOptions.includes(vis.selectedDisasterType)
		) {
			vis.selectedDisasterType = vis.defaultDisasterType;
		}
		vis.focusedYears = vis.focusedYears.filter(year =>
			vis.data.some(row => row.year === year)
		);

		vis.displayData = vis.getDisplayData();
		vis.updateSummary();
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		clearChart("#" + vis.parentElement);

		const root = d3.select("#" + vis.parentElement);
		const filterOptions = vis.typeOptions.map(type => ({
			value: type,
			label: type,
			color: disasterTypeColors[type] || "#64717f"
		}));
		const allYears = vis.data.map(d => d.year);
		const controls = root.append("div")
			.attr("class", "filter-row event-filter-row")
			.attr("role", "group")
			.attr("aria-label", "Extreme weather chart controls");

		const buttons = controls.selectAll("button")
			.data(filterOptions)
			.join("button")
			.attr("type", "button")
			.attr("class", d => `filter-button event-type-button${d.value === vis.selectedDisasterType ? " active" : ""}`)
			.attr("aria-pressed", d => d.value === vis.selectedDisasterType)
			.on("click", function(event, d) {
				event.stopPropagation();

				if (vis.selectedDisasterType === d.value) {
					vis.selectedDisasterType = vis.defaultDisasterType;
				} else {
					vis.selectedDisasterType = d.value;
				}

				vis.wrangleData();
			});

		buttons.append("span")
			.attr("class", "event-type-swatch")
			.style("background", d => d.color);

		buttons.append("span")
			.text(d => d.label);

		const yearFocusId = `${vis.parentElement}-year-focus`;
		const yearFocus = controls.append("div")
			.attr("class", "event-year-focus");

		yearFocus.append("label")
			.attr("for", yearFocusId)
			.text("Focus years");

		const yearSelect = yearFocus.append("select")
			.attr("id", yearFocusId)
			.attr("class", "event-year-select")
			.attr("multiple", true)
			.attr("size", Math.min(4, allYears.length))
			.attr("aria-label", "Focus chart on selected years")
			.on("change", function() {
				vis.focusedYears = Array.from(this.selectedOptions, option => Number(option.value))
					.filter(Number.isFinite)
					.sort((a, b) => a - b);
				vis.wrangleData();
			});

		yearSelect.selectAll("option")
			.data(allYears.map(year => ({
				value: String(year),
				label: String(year)
			})))
			.join("option")
			.attr("value", d => d.value)
			.property("selected", d => vis.focusedYears.includes(Number(d.value)))
			.on("mousedown", function(event) {
				event.preventDefault();
				this.selected = !this.selected;
				yearSelect.dispatch("change");
			})
			.text(d => d.label);

		yearFocus.append("button")
			.attr("type", "button")
			.attr("class", "small-button event-reset-button")
			.property("disabled", !vis.focusedYears.length)
			.text("Reset")
			.on("click", function(event) {
				event.stopPropagation();

				if (!vis.focusedYears.length) {
					return;
				}

				vis.focusedYears = [];
				vis.wrangleData();
			});

		const container = document.getElementById(vis.parentElement);
		const width = container.clientWidth || 760;
		const isCompact = width < 640;
		const isLegendCompact = width < 760;
		const margin = {
			top: isLegendCompact ? 134 : 116,
			right: isCompact ? 30 : 44,
			bottom: 54,
			left: isCompact ? 54 : 72
		};
		const selectedYearSet = new Set(vis.focusedYears);
		const isFocused = selectedYearSet.size > 0;
		const chartData = isFocused
			? vis.displayData.filter(d => selectedYearSet.has(d.year))
			: vis.displayData;

		if (!chartData.length) {
			vis.focusedYears = [];
			vis.updateSummary();
			vis.updateVis();
			return;
		}

		const focusedRows = isFocused ? chartData : [];
		const years = chartData.map(d => d.year);
		const firstYear = years[0];
		const lastYear = years.at(-1);
		const yearSpan = Math.max(1, lastYear - firstYear);
		const spreadFocusedYears = isFocused && years.length > 1;
		const svgWidth = width;
		const height = Math.max(isCompact ? 370 : 410, Math.min(500, Math.round(width * 0.34)));
		const innerWidth = svgWidth - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;
		const circleGap = isCompact ? 2 : 4;
		const maxRadiusForYearSpan = spreadFocusedYears
			? Infinity
			: (innerWidth - 16 - circleGap * yearSpan) / (2 * (yearSpan + 1));
		const maxRadiusForYearCount = (innerWidth - 16 - circleGap * Math.max(0, years.length - 1)) / (2 * (years.length + 1));
		const maxRadiusForWidth = Math.min(maxRadiusForYearSpan, maxRadiusForYearCount);
		const maxCircleRadius = isFocused
			? (isCompact ? 62 : 92)
			: (isCompact ? 14 : 22);
		const largestCircleRadius = Math.max(
			0.8,
			Math.min(
				maxCircleRadius,
				maxRadiusForWidth
			)
		);
		const innerDotRadius = Math.max(0.25, Math.min(isCompact ? 4 : 5, largestCircleRadius * 0.24));
		const ringStrokeWidth = Math.max(0.3, Math.min(isCompact ? 1.9 : 2.3, largestCircleRadius * 0.13));
		const usableRingRadius = Math.max(0.05, largestCircleRadius - innerDotRadius - ringStrokeWidth / 2);
		const ringBand = usableRingRadius / 3;
		const metricMaxima = vis.getMetricMaxima();
		const metricRadius = d3.scaleSqrt()
			.domain([0, 1])
			.range([0, ringBand * 0.72]);
		const ringBase = {
			deaths: innerDotRadius + ringBand * 0.42,
			affected: innerDotRadius + ringBand * 1.36,
			damage: innerDotRadius + ringBand * 2.3
		};
		const maxOuterRadius = ringBase.damage + metricRadius(1) + ringStrokeWidth / 2;
		const fullEventMax = vis.getEventDomainMax();
		const eventDomainMax = fullEventMax * 1.08;
		const xRange = [maxOuterRadius + 8, innerWidth - maxOuterRadius - 8];
		const x = spreadFocusedYears
			? d3.scalePoint()
				.domain(years)
				.range(xRange)
				.padding(0.65)
			: d3.scaleLinear()
				.domain([firstYear - 0.5, lastYear + 0.5])
				.range(xRange);
		const y = d3.scaleLinear()
			.domain([0, eventDomainMax])
			.nice()
			.range([innerHeight - maxOuterRadius - 8, maxOuterRadius + 8]);
		const minEventDotRadius = Math.max(1.4, innerDotRadius * 0.55);
		const maxEventDotRadius = Math.max(
			minEventDotRadius + 0.8,
			Math.min(ringBase.deaths - ringStrokeWidth * 1.6, innerDotRadius * (isFocused ? 2.35 : 1.85))
		);
		const eventDotRadius = d3.scaleSqrt()
			.domain([0, fullEventMax])
			.range([minEventDotRadius, maxEventDotRadius]);
		const maxIconSizeInsideSmallestCircle = Math.max(3.2, ringBase.deaths * 1.18);
		const eventIconSize = d => Math.min(
			maxIconSizeInsideSmallestCircle,
			Math.max(3.2, eventDotRadius(d.disasterEvents) * 2.2)
		);
		const formatComma = d3.format(",");
		const formatMoney = value => {
			if (!value) {
				return "$0";
			}

			if (value >= 1000000000) {
				return `$${formatNumber(value / 1000000000)}B`;
			}

			if (value >= 1000000) {
				return `$${formatNumber(value / 1000000)}M`;
			}

			return `$${formatComma(Math.round(value))}`;
		};
		const formatPeople = value => {
			if (value >= 1000000) {
				return `${formatNumber(value / 1000000)}M`;
			}

			if (value >= 1000) {
				return `${formatNumber(value / 1000)}K`;
			}

			return formatComma(value);
		};
		const colorForType = type => disasterTypeColors[type] || "#64717f";
		const metricLayerColors = {
			deaths: "#7b2ff7",
			affected: "#00a6d6",
			damage: "#e0007a"
		};
		const metricLayers = [
			{
				key: "deaths",
				label: "Total deaths",
				legendLabel: "Deaths",
				value: d => d.totalDeaths,
				max: metricMaxima.deaths,
				format: value => formatComma(Math.round(value || 0)),
				baseRadius: ringBase.deaths,
				stroke: metricLayerColors.deaths,
				strokeWidth: ringStrokeWidth,
				valueLabel: d => `${formatComma(d.totalDeaths)} deaths`
			},
			{
				key: "affected",
				label: "People affected",
				legendLabel: "Affected",
				value: d => d.peopleAffected,
				max: metricMaxima.affected,
				format: formatPeople,
				baseRadius: ringBase.affected,
				stroke: metricLayerColors.affected,
				strokeWidth: ringStrokeWidth,
				valueLabel: d => `${formatPeople(d.peopleAffected)} people affected`
			},
			{
				key: "damage",
				label: "Total damages",
				legendLabel: "Damages",
				value: d => d.totalDamage,
				max: metricMaxima.damage,
				format: formatMoney,
				baseRadius: ringBase.damage,
				stroke: metricLayerColors.damage,
				strokeWidth: ringStrokeWidth,
				valueLabel: d => `${formatMoney(d.totalDamage)} adjusted damages`
			}
		];
		const allLayers = [
			{
				key: "events",
				legendLabel: "Event dots"
			},
			...metricLayers
		];
		const validLayerKeys = new Set(allLayers.map(layer => layer.key));
		vis.hiddenLayers = new Set(
			Array.from(vis.hiddenLayers).filter(key => validLayerKeys.has(key))
		);
		const selectedFilterLabel = vis.selectedDisasterType === vis.defaultDisasterType
			? "Most frequent each year"
			: vis.selectedDisasterType;
		const disasterTypeTitleLabels = {
			Drought: "Droughts per year",
			"Extreme temperature": "Extreme temperature events per year",
			Flood: "Floods per year",
			"Mass movement (wet)": "Wet mass movement events per year",
			Storm: "Storms per year",
			Wildfire: "Wildfires per year"
		};
		const graphStateTitle = vis.selectedDisasterType === vis.defaultDisasterType
			? "Most frequent disasters per year"
			: disasterTypeTitleLabels[vis.selectedDisasterType] ||
				`${vis.selectedDisasterType} disasters per year`;
		const metricScore = (d, layer) => Math.max(0, Math.min(1, (layer.value(d) || 0) / layer.max));
		const ringRadius = (d, layer) => layer.baseRadius + metricRadius(metricScore(d, layer));
		const isLayerVisible = key => !vis.hiddenLayers.has(key);
		const visibleMetricKeys = metricLayers
			.map(layer => layer.key)
			.filter(isLayerVisible);
		const onlyVisibleMetricKey = visibleMetricKeys.length === 1
			? visibleMetricKeys[0]
			: null;

		function toggleLayer(event, key) {
			event.stopPropagation();
			if (vis.hiddenLayers.has(key)) {
				vis.hiddenLayers.delete(key);
			} else {
				vis.hiddenLayers.add(key);
			}
			vis.wrangleData();
		}

		const svg = root
			.append("svg")
			.attr("viewBox", `0 0 ${svgWidth} ${height}`)
			.attr("role", "group")
			.attr("aria-label", "Interactive yearly event count chart with legend toggles for event dots and impact rings")
			.style("width", "100%");
		appendDisasterIconSymbols(svg);

		const chart = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const ringLegend = svg.append("g")
			.attr("class", "event-ring-legend")
			.attr("transform", `translate(${margin.left},28)`);

		ringLegend.append("text")
			.attr("class", "event-state-title")
			.attr("x", 0)
			.attr("y", 0)
			.text(graphStateTitle);

		const ringSample = ringLegend.append("g")
			.attr("transform", "translate(24,50)");

		ringSample.append("use")
			.attr("class", "event-icon")
			.attr("href", `#${iconIdForDisasterType(chartData[0].disasterType)}`)
			.attr("xlink:href", `#${iconIdForDisasterType(chartData[0].disasterType)}`)
			.attr("x", -9)
			.attr("y", -9)
			.attr("width", 18)
			.attr("height", 18)
			.attr("opacity", isLayerVisible("events") ? 1 : 0.22);

		[
			{ key: "deaths", radius: 15, color: metricLayerColors.deaths },
			{ key: "affected", radius: 25, color: metricLayerColors.affected },
			{ key: "damage", radius: 35, color: metricLayerColors.damage }
		].forEach(item => {
			ringSample.append("circle")
				.attr("r", item.radius)
				.attr("fill", onlyVisibleMetricKey === item.key ? item.color : "none")
				.attr("fill-opacity", onlyVisibleMetricKey === item.key ? 0.16 : 0)
				.attr("stroke", item.color)
				.attr("stroke-width", ringStrokeWidth)
				.attr("opacity", isLayerVisible(item.key) ? 1 : 0.22);
		});

		const ringLegendText = ringLegend.append("g")
			.attr("transform", "translate(70,36)");

		const legendItems = [
			{
				key: "events",
				label: "Disaster type",
				color: colorForType(chartData[0].disasterType),
				iconType: chartData[0].disasterType,
				fillOpacity: 0.95,
				stroke: "#ffffff",
				strokeWidth: 1.8
			},
			{ key: "deaths", label: "Deaths", color: metricLayerColors.deaths, fillOpacity: 0.14 },
			{ key: "affected", label: "Affected", color: metricLayerColors.affected, fillOpacity: 0.14 },
			{ key: "damage", label: "Damages", color: metricLayerColors.damage, fillOpacity: 0.14 }
		];
		const legendItemSpacing = 108;

		legendItems.forEach((item, index) => {
			const isHidden = !isLayerVisible(item.key);
			const group = ringLegendText.append("g")
				.attr("class", `event-legend-toggle${isHidden ? " inactive" : ""}`)
				.attr("transform", `translate(${isLegendCompact ? 0 : index * legendItemSpacing},${isLegendCompact ? index * 16 : 0})`)
				.attr("role", "button")
				.attr("tabindex", 0)
				.attr("aria-pressed", !isHidden)
				.attr("aria-label", `${isHidden ? "Show" : "Hide"} ${item.label}`)
				.on("click", event => toggleLayer(event, item.key))
				.on("keydown", event => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						toggleLayer(event, item.key);
					}
				});

			if (item.key === "events") {
				group.append("use")
					.attr("class", "event-icon")
					.attr("href", `#${iconIdForDisasterType(item.iconType)}`)
					.attr("xlink:href", `#${iconIdForDisasterType(item.iconType)}`)
					.attr("x", -1)
					.attr("y", -9)
					.attr("width", 18)
					.attr("height", 18);
			} else {
				group.append("circle")
					.attr("cx", 7)
					.attr("cy", 0)
					.attr("r", 6)
					.attr("fill", item.color)
					.attr("fill-opacity", item.fillOpacity)
					.attr("stroke", item.stroke || item.color)
					.attr("stroke-width", item.strokeWidth || 2);
			}

			group.append("text")
				.attr("x", 22)
				.attr("y", 4)
				.attr("fill", "#64717f")
				.attr("font-size", 11)
				.attr("font-weight", 800)
				.text(item.label);
		});

		// ringLegend.append("text")
		// 	.attr("class", "event-scale-note")
		// 	.attr("x", 70)
		// 	.attr("y", isLegendCompact ? 104 : 76)
		// 	.text("Click on an element to remove that metric from the graph. Click on it again to return it. The size of circles is proportional to its affect");

		svg.append("text")
			.attr("class", "event-selection-note")
			.attr("x", margin.left)
			.attr("y", margin.top - 16);

		const grid = chart.append("g")
			.attr("class", "grid event-grid")
			.call(d3.axisLeft(y)
				.ticks(isCompact ? 4 : 5)
				.tickSize(-innerWidth)
				.tickFormat(""));

		grid.select(".domain").remove();

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(x)
				.tickValues(years.filter((year, index) => {
					const step = spreadFocusedYears && years.length <= 8
						? 1
						: isCompact ? 4 : width < 980 ? 2 : 1;
					return index === 0 || index === years.length - 1 || index % step === 0;
				}))
				.tickFormat(d3.format("d")));

		chart.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(y)
				.ticks(isCompact ? 4 : 5)
				.tickFormat(d3.format("d")));

		chart.append("text")
			.attr("class", "event-axis-label")
			.attr("x", innerWidth / 2)
			.attr("y", innerHeight + 42)
			.attr("text-anchor", "middle")
			.text("Year");

		chart.append("text")
			.attr("class", "event-axis-label")
			.attr("x", -innerHeight / 2)
			.attr("y", -48)
			.attr("transform", "rotate(-90)")
			.attr("text-anchor", "middle")
			.text("Number of Events");

		const nodes = chart.selectAll("g.event-circle-node")
			.data(chartData, d => d.year)
			.join("g")
			.attr("class", d => `event-circle-node${selectedYearSet.has(d.year) ? " focused" : ""}`)
			.attr("transform", d => `translate(${x(d.year)},${y(d.disasterEvents)})`);

		metricLayers.slice().reverse().forEach(layer => {
			const visibleCircle = nodes.append("circle")
				.attr("class", `event-circle event-circle-${layer.key}`)
				.attr("display", d => isLayerVisible(layer.key) && layer.value(d) > 0 ? null : "none")
				.attr("r", d => ringRadius(d, layer))
				.attr("fill", layer.stroke)
				.attr("fill-opacity", onlyVisibleMetricKey === layer.key ? 0.22 : 0.001)
				.attr("stroke", layer.stroke)
				.attr("stroke-width", layer.strokeWidth)
				.attr("stroke-opacity", 0.88);

			visibleCircle.append("title")
				.text(d => `${d.year}: ${layer.label}\n${layer.valueLabel(d)}\nMetric scope: ${d.metricScope}\nShown event count: ${formatComma(d.disasterEvents)} ${d.disasterType} events\nDeaths: ${formatComma(d.totalDeaths)}\nPeople affected: ${formatPeople(d.peopleAffected)}\nDamage: ${formatMoney(d.totalDamage)}`);
		});

		const eventIcons = nodes.append("use")
			.attr("class", "event-icon event-circle-events")
			.attr("display", isLayerVisible("events") ? null : "none")
			.attr("href", d => `#${iconIdForDisasterType(d.disasterType)}`)
			.attr("xlink:href", d => `#${iconIdForDisasterType(d.disasterType)}`)
			.attr("x", d => -eventIconSize(d) / 2)
			.attr("y", d => -eventIconSize(d) / 2)
			.attr("width", d => eventIconSize(d))
			.attr("height", d => eventIconSize(d));

		eventIcons.append("title")
			.text(d => `${d.year}: ${formatComma(d.disasterEvents)} ${d.disasterType} events\nMode: ${selectedFilterLabel}\nMetric scope: ${d.metricScope}\nDeaths: ${formatComma(d.totalDeaths)}\nPeople affected: ${formatPeople(d.peopleAffected)}\nDamage: ${formatMoney(d.totalDamage)}`);

		if (focusedRows.length && focusedRows.length <= 4) {
			focusedRows.forEach((focusedRow, rowIndex) => {
				const nodeX = x(focusedRow.year);
				const nodeY = y(focusedRow.disasterEvents);
				const useStackedFocusLabels = focusedRows.length > 1;
				const labelOnRight = nodeX < innerWidth * 0.58;
				const labelAbove = rowIndex % 2 === 0;
				const labelX = useStackedFocusLabels
					? Math.max(68, Math.min(innerWidth - 68, nodeX))
					: labelOnRight
						? Math.min(innerWidth - 8, nodeX + maxOuterRadius + 24)
						: Math.max(8, nodeX - maxOuterRadius - 24);
				const labelY = useStackedFocusLabels
					? labelAbove ? 18 : Math.max(18, innerHeight - 78)
					: Math.max(
						18,
						Math.min(innerHeight - 72, nodeY - 44)
					);
				const textAnchor = useStackedFocusLabels
					? "middle"
					: labelOnRight ? "start" : "end";
				const leaderStartX = useStackedFocusLabels
					? nodeX
					: nodeX + (labelOnRight ? maxOuterRadius : -maxOuterRadius);
				const leaderStartY = useStackedFocusLabels
					? nodeY + (labelAbove ? -maxOuterRadius : maxOuterRadius)
					: nodeY;
				const leaderEndX = useStackedFocusLabels
					? labelX
					: labelX + (labelOnRight ? -8 : 8);
				const leaderEndY = useStackedFocusLabels
					? labelY + (labelAbove ? 8 : -8)
					: labelY + 8;

				chart.append("line")
					.attr("class", "event-focus-leader")
					.attr("x1", leaderStartX)
					.attr("y1", leaderStartY)
					.attr("x2", leaderEndX)
					.attr("y2", leaderEndY);

				const focusText = chart.append("text")
					.attr("class", "event-focus-detail")
					.attr("x", labelX)
					.attr("y", labelY)
					.attr("text-anchor", textAnchor);

				[
					`${focusedRow.year}: ${focusedRow.disasterType}`,
					`${formatComma(focusedRow.disasterEvents)} events`,
					`${formatComma(focusedRow.totalDeaths)} deaths`,
					`${formatPeople(focusedRow.peopleAffected)} affected`,
					`${formatMoney(focusedRow.totalDamage)} damages`
				].forEach((line, index) => {
					focusText.append("tspan")
						.attr("x", labelX)
						.attr("dy", index === 0 ? 0 : 15)
						.attr("fill", index === 0 ? "#17212b" : "#344350")
						.attr("font-weight", index === 0 ? 800 : 700)
						.text(line);
				});
			});
		} else if (focusedRows.length > 4) {
			chart.append("text")
				.attr("class", "event-focus-detail")
				.attr("x", innerWidth - 8)
				.attr("y", 18)
				.attr("text-anchor", "end")
				.text(`${focusedRows.length} selected years`);
		}
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

		const economicAnnotations = [
			{
				year: 2005,
				lines: ["2005: Hurricane Katrina", "major damage spike"],
				color: "#c84b31",
				labelY: 12
			},
			{
				year: 2017,
				lines: ["2017: Harvey, Irma, Maria", "large economic impact"],
				color: "#9b5c12",
				labelY: 44
			},
			{
				year: 2024,
				lines: ["2024: Hurricane Helene", "major damage spike"],
				color: "#c84b31",
				labelY: 76,
				textAnchor: "end"
			}
		];
		const annotationLayer = chart.append("g")
			.attr("class", "chart-annotations")
			.attr("pointer-events", "none");

		economicAnnotations.forEach(annotation => {
			const row = vis.displayData.find(item => getYear(item) === annotation.year);

			if (!row) {
				return;
			}

			const barLeft = x(getYear(row));

			if (barLeft === undefined) {
				return;
			}

			const barCenter = barLeft + x.bandwidth() / 2;
			const barTop = y(getDamage(row));
			const textAnchor = annotation.textAnchor || (
				barCenter > innerWidth - 150 ? "end" : "middle"
			);
			const textX = textAnchor === "end"
				? Math.min(innerWidth - 4, barCenter + 18)
				: textAnchor === "start"
					? Math.max(4, barCenter - 18)
					: barCenter;

			annotationLayer.append("line")
				.attr("x1", barCenter)
				.attr("y1", barTop)
				.attr("x2", textX)
				.attr("y2", annotation.labelY + 7)
				.attr("stroke", annotation.color)
				.attr("stroke-width", 1.4)
				.attr("stroke-dasharray", "3 3")
				.attr("opacity", 0.78);

			annotationLayer.append("circle")
				.attr("cx", barCenter)
				.attr("cy", barTop)
				.attr("r", 3)
				.attr("fill", annotation.color);

			appendCalloutText(annotationLayer, annotation.lines, {
				x: textX,
				y: annotation.labelY,
				fill: annotation.color,
				textAnchor
			});
		});
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

		const deathAnnotations = [
			{
				year: 2005,
				lines: ["2005: Hurricane Katrina", "death toll spike"],
				color: "#c84b31"
			},
			{
				year: 2024,
				lines: ["2024: Hurricane Helene", "major death toll"],
				color: "#9b5c12"
			}
		];
		const deathAnnotationLayer = chart.append("g")
			.attr("class", "chart-annotations death-annotations")
			.attr("pointer-events", "none");

		deathAnnotations.forEach(annotation => {
			const row = vis.displayData.find(item => getYear(item) === annotation.year);

			if (!row) {
				return;
			}

			const rowTop = y(getYear(row));

			if (rowTop === undefined) {
				return;
			}

			const rowMiddle = rowTop + y.bandwidth() / 2;
			const barEnd = x(getDeaths(row));
			const textAnchor = barEnd > innerWidth * 0.72 ? "end" : "start";
			const textX = textAnchor === "end"
				? Math.max(118, barEnd - 16)
				: Math.min(innerWidth - 118, barEnd + 16);
			const textY = Math.max(12, Math.min(innerHeight - 22, rowMiddle - 13));

			deathAnnotationLayer.append("line")
				.attr("x1", barEnd)
				.attr("y1", rowMiddle)
				.attr("x2", textX)
				.attr("y2", textY + 6)
				.attr("stroke", annotation.color)
				.attr("stroke-width", 1.4)
				.attr("stroke-dasharray", "3 3")
				.attr("opacity", 0.82);

			deathAnnotationLayer.append("circle")
				.attr("cx", barEnd)
				.attr("cy", rowMiddle)
				.attr("r", 3)
				.attr("fill", annotation.color);

			appendCalloutText(deathAnnotationLayer, annotation.lines, {
				x: textX,
				y: textY,
				fill: annotation.color,
				textAnchor,
				lineHeight: 12
			})
				.attr("paint-order", "stroke")
				.attr("stroke", "#fff")
				.attr("stroke-width", 3)
				.attr("stroke-linejoin", "round");
		});

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

		const selectedYearNotes = {
			2005: "Deaths were especially high in 2005 because of Hurricane Katrina.",
			2024: "Deaths were especially high in 2024 because of Hurricane Helene."
		};

		if (selectedYearNotes[selectedYearData.year]) {
			detailCopy.append("p")
				.attr("class", "impact-context-note")
				.text(selectedYearNotes[selectedYearData.year]);
		}

		const iconPanel = detail.append("div")
			.attr("class", "impact-icon-panel");

		iconPanel.append("p")
			.text(`Each figure represents about ${formatAffectedLabel(affectedIconValue)} people affected.`);

		if (selectedYearData.year === 2016) {
			iconPanel.append("p")
				.attr("class", "impact-icon-note")
				.text("2016 uses a larger icon value.");
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

function loadClimographData() {
	return d3.csv(climateCsvPath)
		.then(rows => {
			climographData = prepareClimographData(rows);
			climographVis.setData(climographData, {
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${climateCsvPath}`, error);
			climographVis.setData([], {
				loadError: error,
				loadState: "error"
			});
		});
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

function loadExtremeEventTimelineData() {
	return d3.csv(disastersCsvPath)
		.then(rows => {
			extremeEventTimelineData = prepareEventTimelineData(rows);
			extremeEventTimelineVis.setData(extremeEventTimelineData, {
				loadState: "ready"
			});
		})
		.catch(error => {
			console.error(`Unable to load ${disastersCsvPath}`, error);
			extremeEventTimelineVis.setData([], {
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
		climographVis,
		co2TrendVis,
		extremeEventTimelineVis,
		correlationVis,
		economicImpactVis,
		humanImpactVis
	].forEach(vis => {
		if (vis) {
			vis.wrangleData();
		}
	});
}

climographVis = new ClimographVis("climograph-chart", [], {
	loadState: "loading",
	tagElement: "climograph-year-tag"
});
co2TrendVis = new Co2TrendVis("co2-line-chart", [], {
	loadState: "loading",
	tagElement: "co2-year-tag"
});
extremeEventTimelineVis = new ExtremeEventTimelineVis("event-chart", [], {
	loadState: "loading",
	tagElement: "event-timeline-year-tag"
});
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

window.addEventListener("resize", drawAllCharts);
window.addEventListener("scroll", setActiveNav);
setActiveNav();
loadClimographData();
loadTemperatureCo2Data();
loadExtremeEventTimelineData();
loadCorrelationWeatherData();
loadEconomicImpactData();
loadHumanImpactData();
