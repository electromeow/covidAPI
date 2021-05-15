const csv = require("csv-parser");
const { writeFile } = require("fs/promises");
const https = require("https");
const fs = require("fs");
const { IncomingMessage } = require("http");

type WHOCountry = {
  "﻿Name": string;
  "WHO Region": string;
  "Cases - cumulative total": string;
  "Cases - cumulative total per 100000 population": string;
  "Cases - newly reported in last 7 days": string;
  "Cases - newly reported in last 7 days per 100000 population": string;
  "Cases - newly reported in last 24 hours": string;
  "Deaths - cumulative total": string;
  "Deaths - cumulative total per 100000 population": string;
  "Deaths - newly reported in last 7 days": string;
  "Deaths - newly reported in last 7 days per 100000 population": string;
  "Deaths - newly reported in last 24 hours": string;
  "Transmission Classification": string;
};

async function fetchData(): Promise<void> {
  https
    .get(
      "https://covid19.who.int/WHO-COVID-19-global-table-data.csv",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      },
      (res: typeof IncomingMessage) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          writeFile("covidstats.csv", data);
        });
      }
    )
    .on("error", (err: Error) => {
      throw err;
    });
}

async function parseCSV(): Promise<void> {
  const results: Record<string, string>[] = [];
  fs.createReadStream("covidstats.csv")
    .pipe(csv())
    .on("data", (data: WHOCountry) => results.push(data))
    .on("end", () => {
      writeFile("./covidstats.json", JSON.stringify(results));
    });
}

async function bgTask(): Promise<void> {
  fetchData();
  parseCSV();
  console.log("Data Fetched from WHO and parsed to JSON.");
  setInterval(async function () {
    await fetchData();
    await parseCSV();
    console.log("Data Fetched from WHO and parsed to JSON.");
  }, 60 * 60 * 1000);
}

module.exports = bgTask;
