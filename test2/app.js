const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {
  let retries = 0;

  while (true) {
    try {
      // Make API requests
      const textToSearchPromise = axios.get(
        "https://join.reckon.com/test2/textToSearch"
      );
      const subTextsPromise = axios.get(
        "https://join.reckon.com/test2/subTexts"
      );

      const [{ data: textToSearch }, { data: subTexts }] = await Promise.all([
        textToSearchPromise,
        subTextsPromise
      ]);

      // Prepare output

      const output = {
        candidate: "<Kristopher Borel>",
        text: textToSearch.text,
        results: []
      };

      // Search string for substrings
      subTexts.subTexts.forEach(substring => {
        const { text } = textToSearch;
        let result = [];
        for (let i = 0; i < text.length; i++) {
          const startPosition = i + 1;
          for (let j = 0; j < substring.length; j++) {
            // console.log(
            //   `i: ${i} j: ${j} text: ${text[i].toLowerCase()} sub: ${substring[
            //     j
            //   ].toLowerCase()}`
            // );
            if (text[i + j].toLowerCase() !== substring[j].toLowerCase()) break;

            if (substring.length - 1 === j) result = [...result, startPosition];
          }
        }
        const obj = {
          subtext: substring,
          result: result.length === 0 ? "<No Output>" : result.join(", ")
        };
        output.results = [...output.results, obj];
      });

      // Post output
      const { data } = await axios.post(
        "https://join.reckon.com/test2/submitResults",
        output
      );

      res.json(data);
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
