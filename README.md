# Covid API

## https://electromeow.cf/covidapi

A Covid API that fetches data directly from WHO.\
It downloads the data from WHO as CSV and parses it.\
When you send a request, it sends the JSON-formatted data.

## Endpoints

### GET /global

Sends the global stats.

### GET /country/:country

Parameter country: 2-letter country code(like us, br, ru) or country name.\
Sends the Covid stats for that country.

### GET /all

Sends all the data it has.
