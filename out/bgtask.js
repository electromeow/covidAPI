"use strict";
const csv = require("csv-parser");
const { writeFile } = require("fs/promises");
const https = require("https");
const fs = require("fs");
const { IncomingMessage } = require("http");
async function fetchData() {
    https
        .get("https://covid19.who.int/WHO-COVID-19-global-table-data.csv", {
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    }, (res) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk.toString();
        });
        res.on("end", () => {
            writeFile("covidstats.csv", data);
        });
    })
        .on("error", (err) => {
        throw err;
    });
}
async function parseCSV() {
    const results = [];
    fs.createReadStream("covidstats.csv")
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
        writeFile("./covidstats.json", JSON.stringify(results));
    });
}
async function bgTask() {
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
