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

function parseLi({ sel, year }) {
  const isPerson = !sel.find("ul").length;

  if (isPerson) {
    const a = sel.find("a");
    const numATags = a.length;
    // name
    // there are 3 a tags when the date is baked in
    const nameIndex = numATags === 3 ? 1 : 0;
    const nameSel = a.eq(nameIndex);
    const name = nameSel.attr("title");
    const link = nameSel.attr("href");

    // birth year
    const birthSel = a.eq(-1);
    const year_of_birth = birthSel.attr("title");

    // date of death
    let date_of_death = null;
    if (numATags === 3) {
      date_of_death = a.eq(0).attr("title");
    } else {
      const parentLi = sel.parent().parent();
      date_of_death = parentLi
        .find("a")
        .first()
        .attr("title");
    }

    const year_of_death = year;
    return { name, link, year_of_birth, year_of_death, date_of_death };
  }

  return null;
}

function extractPeople(file) {
  const html = fs.readFileSync(`${inputDir}/${file}`, "utf-8");
  const $ = cheerio.load(html);
  const parent = $(`#${months[0]}_2`).parent();
  const ul = parent.nextAll("ul").eq(0);
  const year = file.replace(".html", "");

  const output = [];
  ul.find("li").each((i, el) => {
    const person = parseLi({ sel: $(el), year });
    if (person) output.push(person);
  });
  console.log(output);
}

function init() {
  const files = fs.readdirSync(inputDir).filter(d => d.includes(".html"));

  files.slice(0, 1).map(extractPeople);
}

init();
