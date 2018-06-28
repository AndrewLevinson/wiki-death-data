const fs = require("fs");
const mkdirp = require("mkdirp");
const cheerio = require("cheerio");

const inputDir = "./output/year-pages";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function extractPeople(file) {
  const html = fs.readFileSync(`${inputDir}/${file}`, "utf-8");
  const $ = cheerio.load(html);
}
function init() {
  const files = fs.readdirSync(inputDir).filter(d => d.includes(".html"));

  files.slice(0, 1).map(extractPeople);
}

init();
