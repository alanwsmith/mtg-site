export class ImageDownloader {
  deckURL(ev, el) {
    if (ev.value !== "") {
      const parts = ev.value.split("/");
      if (parts[2] === "archidekt.com") {
        const href = `https://archidekt.com/api/decks/${parts[4].trim()}/`;
        const subs = [
          ["HREF", href],
        ];
        el.replaceChildren(
          this.api.makeHTML(this.api.template("deckURL"), subs),
        );
      } else {
        el.innerHTML = "Error: Could not parse archidekt.com address";
      }
    }
  }

  jsonPayload(ev, el) {
    if (ev.value !== "") {
      try {
        const data = JSON.parse(ev.value);
        const subs = [
          [
            "COMMANDS",
            data.cards.map((card) => {
              const uid = card.card.uid;
              const char1 = card.card.uid.substring(0, 1);
              const char2 = card.card.uid.substring(1, 2);
              const url =
                `https://cards.scryfall.io/large/front/${char1}/${char2}/${uid}.jpg`;
              const path = `../images/large-cards/${uid}.jpg`;
              return `[ -f "${path}" ] && echo "skipping ${uid}" || (wget "${url}" -O "${path}" && sleep 1)`;
            }).join("\n"),
          ],
        ];
        el.value = this.api.makeTXT(this.api.template("commands"), subs);
      } catch (error) {
        console.error(error);
        el.value = "Error: Could not parse JSON";
      }
    }
  }
}
