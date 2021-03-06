const fs = require("fs");
const mkdirp = require("mkdirp");
const d3 = require("d3");
const outputDir = "./output";

function clean(data) {
  return data.map(d => ({
    ...d,
    views: +d.views,
    percent_traffic: +d.percent_traffic
  }));
}

function convertTimestampToDate(timestamp) {
  const year = timestamp.substring(0, 4);
  const month = +timestamp.substring(4, 6) - 1;
  const date = timestamp.substring(6, 8);
  return new Date(year, month, date);
}

function getMedianSides({ person, dailyData }) {
  const { year_of_death, date_of_death } = person;
  const deathDate = new Date(`${date_of_death} ${year_of_death}`);
  const before = dailyData.filter(d => {
    const date = convertTimestampToDate(d.timestamp);
    return date < deathDate;
  });
  const after = dailyData.filter(d => {
    const date = convertTimestampToDate(d.timestamp);
    return date > deathDate;
  });
  const median_views_before = d3.median(before, d => d.views);
  const median_views_after = d3.median(after, d => d.views);
  return { median_views_before, median_views_after };
}

function calculate(person) {
  const id = person.link.replace("/wiki/", "");
  const dailyData = clean(
    d3.csvParse(fs.readFileSync(`./output/people-joined/${id}.csv`, "utf-8"))
  );

  const median_views = d3.median(dailyData, d => d.views);
  const median_percent_traffic = d3.median(dailyData, d => d.percent_traffic);
  const max_views = d3.max(dailyData, d => d.views);
  const max_percent_traffic = d3.max(dailyData, d => d.percent_traffic);
  const { median_views_before, median_views_after } = getMedianSides({
    person,
    dailyData
  });
  const max_change_views = max_views / median_views;
  const max_change_percent_traffic =
    max_percent_traffic / median_percent_traffic;
  return {
    link: person.link,
    median_views,
    median_views_before,
    median_views_after,
    median_percent_traffic,
    max_views,
    max_percent_traffic,
    max_change_views,
    max_change_percent_traffic
  };
}

function init() {
  mkdirp(outputDir);

  const data = d3.csvParse(
    fs.readFileSync("./output/all-deaths-2015-2018.csv", "utf-8")
  );

  const withAverages = data.map(calculate);
  const output = d3.csvFormat(withAverages);
  fs.writeFileSync("./output/explore.csv", output);
}

init();
