# cron-timezone-convert
Convert cron expressions between different timezones

Based on [cron-timezone-convert](https://github.com/Pablillo92/cron-timezone-convert), but using date-fns.

## Installation

`npm i cron-timezone-convert`

## Usage

The library allows to either use 5 digit or 6 digit cron syntax (i.e. include/exclude seconds)

```js
import { convert } from 'cron-timezone-convert';

// OR

const convert = require("cron-timezone-convert");
```
```js
convert("0 0 8-10 * * *", "UTC", "US/Arizona");
> "0 0 1-3 * * *"

convert("0 30 23 L * *", "UTC", "Africa/Lagos");
> "0 30 0 1 * *"

// Exclude seconds
convert("0 30 0 1 * *", "Africa/Lagos", "UTC", false);
> "0 0 1 12 *"
```
