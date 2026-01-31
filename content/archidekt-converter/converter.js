export class Converter {
  #data = { cards: [] };
  #errors;
  #idMap;

  async bittyInit() {
    await this.loadIdMap();
  }

  acData(ev, el) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    this._cards = [];
    ev.value.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
      .filter((match) => match[3] !== "Maybeboard")
      .filter((match) => match[3] !== "Sideboard")
      .forEach((match, index) => {
        for (let count = 0; count < parseInt(match[1], 10); count += 1) {
          this.#data.cards.push(
            {
              name: match[2],
              id: this.#idMap[match[2]],
              kind: match[3].toLowerCase(),
            },
          );
        }
      });
    el.value = JSON.stringify(this.#data);
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
}
