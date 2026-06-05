# Man Made Natural Disasters

## Project Overview

This project is an interactive climate and weather events data story about the relationship between rising temperatures, CO2 emissions, and extreme weather impacts in the United States.

The project is submitted as a static website made with HTML, CSS, JavaScript, D3, local CSV datasets, and local image assets.

## Project Links

- Project website: https://jeraldimartinez.github.io/Climate_and_Weather_Events_Data_Story/
- Screencast video: TODO: add screencast URL

## Team

- Team name: Emission Impossible
- Team members: Anna Everly, Jeraldi Martinez

## What Is Included

### Our Code

- `index.html`: Page structure, written narrative, navigation, chart containers, action section, footer, and source links.
- `css/style.css`: Custom visual styling, layout, responsive behavior, navigation styling, chart styling, and action-card styling.
- `js/main.js`: Custom JavaScript for loading data, preparing datasets, drawing D3 visualizations, chart interactions, linked views, filters, tooltips, legends, and responsive redraw behavior.

### Data Files

- `data/climate.csv`: Climate dataset used for temperature and precipitation views.
- `data/disasters.csv`: Disaster dataset used for weather event frequency, deaths, people affected, and damage views.

### Assets

- `images/`: Local image assets used in the hero section and the action section.
- `fonts/`: Local font files included with the project.

### External Libraries And Services

- D3.js v7, loaded from jsDelivr: `https://cdn.jsdelivr.net/npm/d3@7`
- Google Fonts, loaded from Google Fonts:
  - Inter
  - Source Serif 4

## How To Run The Project

Because the project loads CSV files with JavaScript, run it through a local web server instead of opening `index.html` directly from the file system.

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Interface Notes

Some features of the interface may not be obvious at first glance:

- The top navigation links jump to each major story section.
- In the temperature and precipitation climograph, drag the small timeline brush at the bottom to focus on a specific range of years.
- In the temperature and precipitation climograph, click bars or temperature points to show exact values for a selected year.
- In the extreme weather events chart, click a disaster type button to filter the chart. Click the same disaster type again to return to the unfiltered view.
- In the extreme weather events chart, use the year selector to focus on one or more years. The reset button clears the selected years.
- In the extreme weather events chart, click legend items to hide or show event dots, deaths, affected people, or damage rings.
- In the extreme weather events chart, click a year/event marker to show detailed values.
- In the human impact linked view, click a year in the deaths bar chart to update the people-affected visualization.
- Several charts resize/redraw when the browser window size changes.

## Data Sources

- Climate Change Data Set: `https://www.kaggle.com/datasets/bhadramohit/climate-change-dataset?resource=download`
- Natural Disasters Data Set: `https://data.humdata.org/dataset/emdat-country-profiles-usa`

## References

- NASA: `https://science.nasa.gov/climate-change/extreme-weather/`
- NOAA: `https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts`
- WWF: `https://www.worldwildlife.org/resources/explainers/is-climate-change-increasing-the-risk-of-disasters/`
- PBS: `https://www.pbs.org/wnet/peril-and-promise/2022/09/how-climate-change-impacts-each-type-of-natural-disaster/`



