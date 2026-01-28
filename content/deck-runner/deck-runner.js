class Card {
  constructor(id, name, kind, count) {
    this._id = id;
    this._name = name;
    this._kind = kind;
    this._count = count;
  }

  category() {
    return this._kind.toLowerCase();
  }

  id() {
    return this._id;
  }

  idChar(num) {
    return this._id.slice(num - 1, num);
  }

  imageURL() {
    return `https://cards.scryfall.io/border_crop/front/${this.idChar(1)}/${
      this.idChar(2)
    }/${this.id()}.jpg`;
  }

  kind() {
    return this._kind;
  }

  name() {
    return this._name;
  }

  status() {
    if (this.category() === "commander") {
      return "deck-commander";
    } else {
      return "deck-99";
    }
  }
}

export class DeckRunner {
  #cards;
  #errors;
  #exampleDeck;
  #idMap;

  async bittyInit() {
    await this.loadExampleDeck();
    await this.loadIdMap();
    this.loadCards();
  }

  bittyReady() {
    this.api.trigger("runDeck");
  }

  addCardDetails(card, index) {
    const subs = [
      ["DETAILS", this.cardStats(card, index)],
    ];
    return this.api.makeHTML(card, subs);
  }

  baseCard(card) {
    const subs = [
      ["NAME", card.name()],
      ["STATUS", card.status()],
      ["CATEGORY", card.category()],
      ["IMAGEURL", card.imageURL()],
    ];
    return this.api.makeTXT(this.templates("cardV2"), subs);
  }

  cardHTML(card) {
    const subs = [
      ["NAME", card.name()],
      ["STATUS", card.status()],
      ["CATEGORY", card.category()],
      ["IMAGEURL", card.imageURL()],
    ];
    return this.api.makeHTML(this.templates("card"), subs);
  }

  cardStats(card, index) {
    const adjustedIndex = index - 7;
    const subs = [
      ["_INDEX_", index],
      ["_ADJUSTEDINDEX_", adjustedIndex],
      ["TURN", adjustedIndex + 1],
      ["TOTAL", this.totalLandsPlayedAtIndex(index)],
      ["DRAWN", this.totalLandsAtIndex(index)],
      ["PLAY", this.playLandAtIndex(index)],
    ];
    return this.api.makeHTML(this.templates("cardStats"), subs);
  }

  commanderSlot(_, el) {
    el.replaceChildren(this.cardHTML(this.commanderCard()));
  }

  commanderCard() {
    return this.#cards.find((card) => card.kind() === "Commander");
  }

  deckCards() {
    return this.#cards.filter((card) => card.kind() !== "Commander");
  }

  gameTurns(_, el) {
    el.replaceChildren(
      ...this
        .deckCards()
        .map((card) => this.baseCard(card))
        .map((card, index) => this.addCardDetails(card, index))
        .filter((card, index) => index >= 7),
    );
  }

  initialHand(_, el) {
    el.replaceChildren(
      ...this.deckCards().slice(0, 7).map((card) => this.cardHTML(card)),
    );
  }

  landsInOpeningHand(_, el) {
    el.innerHTML = this.#cards
      .slice(0, 7)
      .map((card) => card.category() === "land" ? 1 : 0)
      .reduce((acc, cur) => acc + cur, 0);
  }

  loadCards() {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    this.#cards = [];
    document.querySelector(".deck-list").value
      .split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[2] !== undefined)
      .filter((match) => match[2] !== "Maybeboard")
      .filter((match) => match[2] !== "Sideboard")
      .map((match) => {
        for (let count = 1; count <= parseInt(match[1], 10); count += 1) {
          this.#cards.push(
            new Card(
              this.#idMap[match[2]],
              match[2],
              match[3],
              match[1],
            ),
          );
        }
      });
  }

  async loadExampleDeck() {
    const url = `/deck-runner/example-deck.txt`;
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

  playLandAtIndex(index) {
    if (
      this.totalLandsPlayedAtIndex(index) -
      this.totalLandsPlayedAtIndex(index - 1)
    ) {
      return "Yes";
    } else {
      return "No";
    }
  }

  runDeck(_, el) {
    shuffleArray(this.#cards);
    this.api.trigger(`
commanderSlot 
gameTurns
initialHand 
landsInOpeningHand
`);
  }

  totalLandsAtIndex(index) {
    return this.#cards.slice(0, index + 1).map((card) =>
      card.category() === "land" ? 1 : 0
    ).reduce(
      (acc, cur) => acc + cur,
      0,
    );
  }

  totalLandsPlayedAtIndex(index) {
    return Math.min(this.totalLandsAtIndex(index), index - 6);
  }

  templates(kind) {
    switch (kind) {
      case "cardStats":
        return `
<div class="card-details">
  <div>Turn: TURN</div>
  <div>Behind: BEHIND</div>
  <div>Adjusted Index: _ADJUSTEDINDEX_</div>
  <div>Index: _INDEX_</div>
  <div>Total Drawn: DRAWN</div>
  <div>Play Land: PLAY</div>
  <div>Total Played: TOTAL</div>
  <div>Remaining Lands: REMAINING</div>
</div>
`;
      case "card":
        return `<div class="card STATUS CATEGORY">
<img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
<div>xxx</div>
</div>`;
      case "cardV2":
        return `<div class="card STATUS CATEGORY">
<img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
DETAILS
</div>`;
    }
  }
}

function shuffleArray(array) {
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}
