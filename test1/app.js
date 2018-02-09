const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {
  let retries = 0;

  while (true) {
    try {
      const rangeInfoPromise = axios.get(
        "https://join.reckon.com/test1/rangeInfo"
      );
      const divisorInfoPromise = axios.get(
        "https://join.reckon.com/test1/divisorInfo"
      );

      const [{ data: rangeInfo }, { data: divisorInfo }] = await Promise.all([
        rangeInfoPromise,
        divisorInfoPromise
      ]);

      let body = "";

      for (let i = rangeInfo.lower; i <= rangeInfo.upper; i++) {
        let output = "";

        divisorInfo.outputDetails.forEach(div => {
          if (i % div.divisor === 0) output = output + div.output;
        });
        body += `${i}: ${output}<br />`;
      }
      res.send(body);
      break;
    } catch (e) {
      retries++;
      if (retries === 5)
        return res.send("API not responding. Please try again later.");
    }
  }
});

app.set("port", 9999);

const server = app.listen(app.get("port"), () =>
  console.log(`Server listening on localhost:${server.address().port}`)
);
