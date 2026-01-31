const t = {
  // https://cards.scryfall.io/border_crop/front/8/3/83f510b7-4cbd-4883-9c26-c8824bc668ac.jpg
  wget:
    `[ ! -e "ID.jpg" ] && wget https://cards.scryfall.io/border_crop/front/PREFIX1/PREFIX2/ID.jpg && sleep 1`,
};

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

  curlCommands(_, el) {
    el.value = this.#data.cards.map((card) => {
      const subs = [
        ["PREFIX1", card.id.substring(0, 1)],
        ["PREFIX2", card.id.substring(1, 2)],
        ["ID", card.id],
      ];
      return this.api.makeTXT(t.wget, subs);
    }).join("\n");
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
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+).*/;
    document.querySelector(".input-data").value.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
      .forEach((match, index) => {
        for (let count = 0; count < parseInt(match[1], 10); count += 1) {
          const id = this.#idMap[match[2]];
          this.#data.cards.push(
            {
              name: match[2],
              id: id,
              count: match[1],
              kind: match[3].toLowerCase(),
              line: match[0],
              char1: id.substring(0, 1),
              char2: id.substring(1, 2),
            },
          );
        }
      });
    el.value = JSON.stringify(this.#data, null, 2);
    this.api.trigger("curlCommands");
  }
}
