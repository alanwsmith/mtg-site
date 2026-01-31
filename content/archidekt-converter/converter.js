export class Converter {
  #data = { cards: [] };
  #errors;
  #idMap;

  async bittyInit() {
    await this.loadIdMap();
  }

  clearList(_, el) {
    el.value = "";
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

  showExample(_, el) {
    const text = `1x Abjure (wth) 31 [Removal]
1x Aboshan, Cephalid Emperor (plst) ODY-58 [Protection]
1x Academy Ruins (drc) 58 [Land]
1x Access Tunnel (tdc) 337 [Land]
1x Accursed Witch // Infectious Curse (soi) 97 [Ramp]
1x Adaptive Omnitool (drc) 16 [Draw]
1x Aether Poisoner (aer) 51 [Tokens]`;
    el.value = text;
    this.api.trigger("outputJSON");
  }

  outputJSON(_, el) {
    this.#data.cards = [];
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    document.querySelector(".input-data").value.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
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
    el.value = JSON.stringify(this.#data.cards);
  }
}
