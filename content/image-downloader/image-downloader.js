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
              return `[ -f "../images/large-cards/${uid}.jpg" ] && echo "skipping ${uid}" || echo "getting ${uid}"`;
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
