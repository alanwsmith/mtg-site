class Card {
  constructor(name, id, isCommander) {
    this.name = name;
    this.id = id;
    this.isCommander = isCommander;
  }

  idChar(num) {
    return this.id.slice(num - 1, num);
  }
}

export class ImageTags {
  #errors = [];
  #exampleDeck;
  #idMap;

  async bittyInit() {
    await this.loadExampleDeck();
    await this.loadIdMap();
  }

  clearDeck(_, el) {
    el.value = "";
    this.api.trigger("outputHTML");
  }

  async copyHTML(_, el) {
    try {
      await navigator.clipboard.writeText(
        document.querySelector(".code-output").value,
      );
      el.innerHTML = "Copied";
    } catch (err) {
      el.innerHTML = "Error Copying";
    }
    await new Promise((resolve) => setTimeout(resolve, 1600));
    el.innerHTML = "Copy HTML";
  }

  htmlString() {
    let output = this.loadCards(true).map((card) => this.makeCard(card))
      .concat(
        this.loadCards(false).map((card) => this.makeCard(card)),
      )
      .join("\n");
    if (output !== "") {
      return output;
    } else {
      return "waiting for deck";
    }
  }

  loadCards(findCommander) {
    const cardMatcher = /\d+x\s+(.*?)\s+\(.*?\[(\w+)/;
    return document.querySelector(".deck-list").value
      .split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[2] && match[2] !== "Maybeboard")
      .filter((match) => (match[2] === "Commander") === findCommander)
      .map((match) =>
        new Card(
          match[1],
          this.#idMap[match[1]],
          findCommander,
        )
      );
  }

  async loadExampleDeck() {
    const url = `/image-tags/example-deck.txt`;
    const response = await this.api.getTXT(url);
    if (response.value) {
      this.#exampleDeck = response.value.trim();
    } else {
      this.#errors.push(response.error);
    }
  }

  async loadIdMap() {
    const url =
      "https://raw.githubusercontent.com/alanwsmith/mtg-data/refs/heads/main/docs/v1/misc/names-to-scryfall-ids.json";
    const response = await this.api.getJSON(url);
    if (response.value) {
      this.#idMap = response.value;
    } else {
      this.#errors.push(response.error);
    }
  }

  makeCard(card) {
    const subs = [
      ["__ID__", card.id],
      ["__CHAR1__", card.idChar(1)],
      ["__CHAR2__", card.idChar(2)],
      ["__NAME__", escapeHTML(card.name)],
    ];
    if (card.isCommander) {
      subs.push(["__CARDCLASS__", "mtg-commander"]);
    } else {
      subs.push(["__CARDCLASS__", "mtg-99"]);
    }
    return this.api.makeTXT(
      document.querySelector(".image-output-template").value,
      subs,
    );
  }

  outputHTML(_, __) {
    this.api.trigger("outputHTMLCode outputHTMLValue");
  }

  outputHTMLCode() {
    document.querySelector(".visual-output").innerHTML = this.htmlString();
  }

  outputHTMLValue() {
    document.querySelector(".code-output").value = this.htmlString();
  }

  showErrors(_, el) {
    el.value = this.#errors.join("\n\n");
  }

  showExampleDeck(_, el) {
    el.value = this.#exampleDeck;
    this.api.trigger("outputHTML");
  }
}

function escapeHTML(input) {
  return input
    .replaceAll(`&`, `&amp;`)
    .replaceAll(`"`, `&quot;`)
    .replaceAll(`'`, `&#39;`)
    .replaceAll(`<`, `&lt;`)
    .replaceAll(`>`, `&gt;`);
}
