const express = require("express");
const fsp = require("fs/promises");
const bgtask = require("./bgtask");
const http = require("http");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type OutputCountry = {
  name: string;
  region: string | undefined;
  totalCases: number;
  casesPer100000Population: number;
  weeklyCases: number;
  weeklyCasesPer100000Population: number;
  dailyCases: number;
  totalDeaths: number;
  deathsPer100000Population: number;
  weeklyDeaths: number;
  weeklyDeathsPer100000Population: number;
  dailyDeaths: number;
  transmissionClassification: string | undefined;
};

async function typeConverter(input: WHOCountry): Promise<OutputCountry> {
  const output: OutputCountry = {
    name: input["﻿Name"],
    region: input["WHO Region"],
    totalCases: parseInt(input["Cases - cumulative total"]),
    casesPer100000Population: parseInt(
      input["Cases - cumulative total per 100000 population"]
    ),
    weeklyCases: parseInt(input["Cases - newly reported in last 7 days"]),
    weeklyCasesPer100000Population: parseInt(
      input["Cases - newly reported in last 7 days per 100000 population"]
    ),
    dailyCases: parseInt(input["Cases - newly reported in last 24 hours"]),
    totalDeaths: parseInt(input["Deaths - cumulative total"]),
    deathsPer100000Population: parseInt(
      input["Deaths - cumulative total per 100000 population"]
    ),
    weeklyDeaths: parseInt(input["Deaths - newly reported in last 7 days"]),
    weeklyDeathsPer100000Population: parseInt(
      input["Deaths - newly reported in last 7 days per 100000 population"]
    ),
    dailyDeaths: parseInt(input["Deaths - newly reported in last 24 hours"]),
    transmissionClassification: input["Transmission Classification"],
  };

  return output;
}

app.get(
  "/",
  async function (
    req: typeof http.IncomingMessage,
    res: typeof http.ServerResponse
  ) {
    fsp
      .readFile("index.html", { encoding: "utf-8" })
      .then(async function name(result: string) {
        res.send(result);
      });
  }
);

app.get(
  "/country/:country",
  async function (
    req: typeof http.IncomingMessage,
    res: typeof http.ServerResponse
  ) {
    fsp
      .readFile("covidstats.json", { encoding: "utf-8" })
      .then(async function (result: string) {
        return JSON.parse(result);
      })
      .then(async function (result: WHOCountry[]) {
        fsp
          .readFile("countrycodes.json", { encoding: "utf-8" })
          .then(async function (countryCodes: string) {
            return JSON.parse(countryCodes);
          })
          .then(async function (countryCodes: Record<string, string>) {
            const country: string =
              countryCodes[req.params.country.toUpperCase().trim()];
            if (country === undefined) return res.sendStatus(404);
            let status = false;
            for (let i = 0; i < result.length; i++) {
              const x = result[i];
              if (country === x["﻿Name"]) {
                status = true;
                res.send(await typeConverter(x));
                break;
              }
            }
            if (!status) return res.sendStatus(404);
          });
      });
  }
);

app.get(
  "/global",
  async function (
    req: typeof http.IncomingMessage,
    res: typeof http.ServerResponse
  ) {
    fsp
      .readFile("covidstats.json", { encoding: "utf-8" })
      .then(async function (result: string) {
        return JSON.parse(result);
      })
      .then(async function (result: WHOCountry[]) {
        let status = false;
        for (let i = 0; i < result.length; i++) {
          const x = result[i];
          if (x["﻿Name"].toLowerCase().trim() === "global") {
            status = true;
            const response: OutputCountry = await typeConverter(x);
            response.region = undefined;
            response.transmissionClassification = undefined;
            res.send(response);
            break;
          }
          if (!status) {
            res.status(404);
            res.send(
              "An unknown error happened. Please report this problem to the developer. You can contact on GitHub@electromeow."
            );
          }
        }
      });
  }
);

app.get(
  "/all",
  async function (
    req: typeof http.IncomingMessage,
    res: typeof http.ServerResponse
  ) {
    fsp
      .readFile("./covidstats.json", { encoding: "utf-8" })
      .then(async function (result: string) {
        return JSON.parse(result);
      })
      .then(async function (result: WHOCountry[]) {
        const output: OutputCountry[] = [];
        result.forEach(async function (x: WHOCountry) {
          output.push(await typeConverter(x));
        });
        res.send(JSON.stringify(output));
      });
  }
);

app.listen(443, async function () {
  console.log("CovidAPI is listening on port 443!");
  await bgtask();
});
