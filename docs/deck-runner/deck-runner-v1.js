class Hand {
  constructor(cards) {
    this._cards = cards;
  }
}

class Draws {
  constructor(cards) {
    this._cards = cards;
  }
}

class Card {
  constructor(id, name, kind, count, turn = null) {
    this._id = id;
    this._name = name;
    this._kind = kind;
    this._count = count;
    this._turn = turn;
  }

  // TODO: Deprecate and move into .kind()
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
    return this._kind.toLowerCase();
  }

  name() {
    return this._name;
  }

  setTurn(turn) {
    this._turn = turn;
  }

  turn() {
    return this._turn;
  }
}

class TestResult {
  constructor(given, then, expected, assertion, got) {
    this._given = given;
    this._then = then;
    this._expected = expected;
    this._assertion = assertion;
    this._got = got;
  }

  message() {
    if (this.result() === "PASSED") {
      return `${this.result()}: Given: ${this._given} - Then: ${this._then}`;
    } else if (
      this._assertion === "isNot"
    ) {
      return `${this.result()}: Given: ${this._given} - Then: ${this._then}\n[Got impropper value: ${this._got}]`;
    } else {
      return `${this.result()}: Given: ${this._given} - Then: ${this._then}\n[Expected: ${this._expected} - Got: ${this._got}]`;
    }
  }

  result() {
    if (this._assertion === "is") {
      if (this._expected === this._got) {
        return "PASSED";
      } else {
        return "FAILED";
      }
    } else if (this._assertion === "isNot") {
      if (this._expected !== this._got) {
        return "PASSED";
      } else {
        return "FAILED";
      }
    } else if (this._assertion === "true") {
      if (this._got === true) {
        return "PASSED";
      } else {
        return "FAILED";
      }
    } else if (this._assertion === "false") {
      if (this._got === false) {
        return "PASSED";
      } else {
        return "FAILED";
      }
    }
  }
}

export class DeckRunner {
  #cards;
  #commander;
  #errors;
  #exampleDeck;
  #idMap;
  #testResults;
  #tests = [];

  async bittyInit() {
    await this.loadExampleDeck();
    await this.loadIdMap();
    this.loadCards();
  }

  bittyReady() {
    //this.api.trigger("runDeck");
    this.addTests();
    this.runTests();
  }

  addCardDetails(card, turn) {
    const subs = [
      ["DETAILS", this.cardStatsV2(card, turn)],
    ];
    return this.api.makeHTML(card, subs);
  }

  addTests() {
    // Tests below can probably be deprecated.

    // this.assert(
    //   "Basic Deck Check with No Lands",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "solo",
    //       "The this._openingHandCards() method works.",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this._openingHandCards()[0].name();
    //       },
    //     ],
    //     [
    //       "The this._turnCards() method works.",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this._turnCards()[0].name();
    //       },
    //     ],
    //     [
    //       "The this._turnCards() method works.",
    //       "Giada, Font of Hope",
    //       () => {
    //         return this._commanderCard().name();
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Commander is first card in deck",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "this.commanderCard() method works",
    //       "Giada, Font of Hope",
    //       () => {
    //         return this._commanderCard().name();
    //       },
    //     ],
    //     [
    //       "First card in this.openingHand() is Valkyrie",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this._openingHandCards()[0].name();
    //       },
    //     ],
    //     [
    //       "First card in this.turCards() is Valkyrie",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this._turnCards()[0].name();
    //       },
    //     ],
    //   ],
    // );

    // this.assertNotEqual(
    //   "Commander is first card in deck",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "First card in opening hand is not commander card",
    //       "Giada, Font of Hope",
    //       () => {
    //         return this._turnCards()[0].name();
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "No Lands in Opening Hand",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "0 Lands reported in Opening Hand",
    //       0,
    //       () => {
    //         return this._landsInOpeningHand();
    //       },
    //     ],
    //     [
    //       "No Land Played on Turn 1",
    //       "None",
    //       () => {
    //         return this._landTypePlayedOnTurnV2(this._turnCards()[0]);
    //       },
    //     ],
    //     [
    //       "0 Total Lands played on Turn 1",
    //       0,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "0 Reserve Lands on Turn 1",
    //       0,
    //       () => {
    //         return this._landsInReserveOnTurn(1);
    //       },
    //     ],
    //     [
    //       "1 Land Behind on Turn 1",
    //       1,
    //       () => {
    //         return this._landsBehindOnTurn(1);
    //       },
    //     ],
    //     [
    //       "2 Lands Behind on Turn 2",
    //       2,
    //       () => {
    //         return this._landsBehindOnTurn(2);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "1 Land in opening hand",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([2]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "1 Land reported in Opening Hand",
    //       1,
    //       () => {
    //         return this._landsInOpeningHand();
    //       },
    //     ],
    //     [
    //       "Reserve Land Played on Turn 1",
    //       "Reserve",
    //       () => {
    //         return this._landTypePlayedOnTurnV2(this._turnCards()[0]);
    //       },
    //     ],
    //     [
    //       "No Land Played on Turn 2",
    //       "None",
    //       () => {
    //         return this._landTypePlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "1 Total Lands played on Turn 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "1 Total Land played on Turn 2",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "0 Reserve Lands on Turn 1",
    //       0,
    //       () => {
    //         return this._landsInReserveOnTurn(1);
    //       },
    //     ],
    //     [
    //       "0 Reserve Lands on Turn 2",
    //       0,
    //       () => {
    //         return this._landsInReserveOnTurn(2);
    //       },
    //     ],
    //     [
    //       "0 Lands Behind on Turn 1",
    //       0,
    //       () => {
    //         return this._landsBehindOnTurn(1);
    //       },
    //     ],
    //     [
    //       "1 Land Behind on Turn 2",
    //       1,
    //       () => {
    //         return this._landsBehindOnTurn(2);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "2 Lands in opening hand",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([0, 6]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "2 Lands reported in Opening Hand",
    //       2,
    //       () => {
    //         return this._landsInOpeningHand();
    //       },
    //     ],
    //     [
    //       "Reserve Land Played on Turn 1",
    //       "Reserve",
    //       () => {
    //         return this._landTypePlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Reserve Land Played on Turn 2",
    //       "Reserve",
    //       () => {
    //         return this._landTypePlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "No Lands Played on Turn 3",
    //       "None",
    //       () => {
    //         return this._landTypePlayedOnTurn(3);
    //       },
    //     ],
    //     [
    //       "1 Total Lands Played on Turn 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "2 Total Lands Played on Turn 2",
    //       2,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "2 Total Lands Played on Turn 3",
    //       2,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(3);
    //       },
    //     ],
    //     [
    //       "1 Reserve Land on Turn 1",
    //       1,
    //       () => {
    //         return this._landsInReserveOnTurn(1);
    //       },
    //     ],
    //     [
    //       "0 Reserve Lands on Turn 2",
    //       0,
    //       () => {
    //         return this._landsInReserveOnTurn(2);
    //       },
    //     ],
    //     [
    //       "0 Reserve Lands on Turn 3",
    //       0,
    //       () => {
    //         return this._landsInReserveOnTurn(3);
    //       },
    //     ],
    //     [
    //       "0 Lands Behind on Turn 1",
    //       0,
    //       () => {
    //         return this._landsBehindOnTurn(1);
    //       },
    //     ],
    //     [
    //       "0 Lands Behind on Turn 2",
    //       0,
    //       () => {
    //         return this._landsBehindOnTurn(2);
    //       },
    //     ],
    //     [
    //       "1 Land Behind on Turn 3",
    //       1,
    //       () => {
    //         return this._landsBehindOnTurn(3);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Land drawn on Turn 1 with no cards in opening hand",
    //   () => {
    //     this.#cards = this.parseDeckList(makeTestDeckList([8]));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "Drawn Land Count on Turn 1 is 1",
    //       1,
    //       () => {
    //         const turn = 1;
    //         return this._landsThatHaveBeenDrawnOnTurn(turn);
    //       },
    //     ],
    //     [
    //       "Drawn Land Count on Turn 3 is 1",
    //       1,
    //       () => {
    //         const turn = 3;
    //         return this._landsThatHaveBeenDrawnOnTurn(turn);
    //       },
    //     ],
    //     [
    //       "0 Lands reported in Opening Hand",
    //       0,
    //       () => {
    //         return this._landsInOpeningHand();
    //       },
    //     ],
    //     [
    //       "Draw Land Played on Turn 1",
    //       "Draw",
    //       () => {
    //         return this._landTypePlayedOnTurnV2(this._turnCards()[0]);
    //       },
    //     ],
    //     // [
    //     //   "0 Lands in the Opening hand and 1 Land is drawn on Turn 2",
    //     //   "",
    //     //   () => {
    //     //     return this._landTypePlayedOnTurn(1);
    //     //   },
    //     //   "None",
    //     // ],
    //   ],
    // );

    //
  }

  assert(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "is"]);
  }

  assertNotEqual(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "isNot"]);
  }

  baseCard(card) {
    const subs = [
      ["NAME", card.name()],
      ["CATEGORY", card.category()],
      ["IMAGEURL", card.imageURL()],
    ];
    return this.api.makeTXT(this.templates("cardV2"), subs);
  }

  cardHTML(card) {
    const subs = [
      ["NAME", card.name()],
      ["CATEGORY", card.category()],
      ["IMAGEURL", card.imageURL()],
    ];
    return this.api.makeHTML(this.templates("card"), subs);
  }

  cardStats(card, index, turn) {
    const subs = [
      ["TURN", this.turnAtIndex(index)],
      ["TOTAL", this.totalLandsPlayedAtIndex(index)],
      ["PLAY", this._landTypePlayedOnTurn(index)],
    ];
    if (this.totalLandsInHandAtIndex(index) > 0) {
      subs.push([
        "RESERVES",
        `<div>Reserves: ${this.totalLandsInHandAtIndex(index)}</div>`,
      ]);
    } else {
      subs.push([
        "RESERVES",
        `<div>Reserves: ${this.totalLandsInHandAtIndex(index)}</div>`,
      ]);
    }
    if (this._landsBehindOnTurn(index) > 0) {
      subs.push([
        "BEHIND",
        `<div>Behind: ${this._landsBehindOnTurn(index)}</div>`,
      ]);
    } else {
      subs.push([
        "BEHIND",
        `<div>Behind: ${this._landsBehindOnTurn(index)}</div>`,
      ]);
    }
    return this.api.makeHTML(this.templates("cardStats"), subs);
  }

  cardStatsV2(card, turn) {
    const subs = [
      ["TURN", turn],
      ["PLAY", this._landTypePlayedOnTurn(card, turn)],
      ["TOTAL", this._totalLandsPlayedOnTurn(turn)],
      ["RESERVE", this._landsInReserveOnTurn(turn)],
      ["BEHIND", this._landsBehindOnTurn(turn)],
    ];
    return this.api.makeHTML(this.templates("cardStats"), subs);
  }

  _commanderCard() {
    return this.#cards.find((card) => card.kind() === "commander");
  }

  commanderCard(_, el) {
    el.replaceChildren(this.cardHTML(this._commanderCard()));
  }

  // DEPRECATE in favor of turnCards()
  deckCards() {
    return this.#cards.filter((card) => card.kind() !== "commander");
  }

  failedTestCount() {
    return this.#testResults
      .filter((result) => (result.result() !== "PASSED")).length;
  }

  _landsBehindOnTurn(turn) {
    return turn - this._totalLandsPlayedOnTurn(turn);
  }

  // DEPRECATED
  landsBehindAtIndex(index) {
    return this.turnAtIndex(index) - this.tcard, turnLandsPlayedAtIndex(index);
  }

  _landsInOpeningHand() {
    return this.#cards
      .slice(0, 7)
      .map((card) => card.category() === "land" ? 1 : 0)
      .reduce((acc, cur) => acc + cur, 0);
  }

  landsInOpeningHand(_, el) {
    el.innerHTML = this._landsInOpeningHand();
  }

  _landsInReserveOnTurn(turn) {
    return Math.max(this._landsInOpeningHand() - turn, 0);
  }

  _landsThatHaveBeenDrawnOnTurn(turn) {
    return this._turnCards()
      .filter((card, index) => turn >= index + 1)
      .filter((card) => card.kind() === "land")
      .length;
  }

  _landTypePlayedOnTurn(turn) {
    if (this._landsInOpeningHand() >= turn) {
      return "Reserve";
    } else {
      return "None";
    }
  }

  _landTypePlayedOnTurnV2(card) {
    if (card.kind() === "land") {
      return "Draw";
    } else {
      // this._landsThatHaveBeenDrawnOnTurn(turn);
      return "Reserve";
    }
    return "None";
  }

  loadCards() {
    this.#cards = this.parseDeckList(
      document.querySelector(".deck-list").value,
    );
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

  _openingHandCards() {
    return this.#cards
      .filter((card, index) => card.kind() !== "commander")
      .filter((card, index) => index <= 6);
  }

  openingHandCards(_, el) {
    el.replaceChildren(
      ...this._openingHandCards().map((card) => this.cardHTML(card)),
    );
  }

  outputTestResultsToConsole() {
    this.#testResults
      .filter((result) => (result.result() !== "PASSED"))
      .forEach((result) => console.error(result.message()));
    this.#testResults
      .filter((result) => this.failedTestCount() === 0)
      .filter((result) => (result.result() === "PASSED"))
      .forEach((result) => console.log(result.message()));
  }

  runMainTests() {
    if (this.#testResults.length === 0) {
      for (const testPayload of this.#tests) {
        testPayload[1]();
        for (const assertion of testPayload[2]) {
          this.#testResults.push(
            new TestResult(
              testPayload[0],
              assertion[0],
              assertion[1],
              testPayload[3],
              assertion[2](),
            ),
          );
        }
      }
    }
  }

  runSoloTests() {
    for (const testPayload of this.#tests) {
      for (const assertion of testPayload[2]) {
        if (assertion.length === 4 && assertion[0] === "solo") {
          testPayload[1]();
          this.#testResults.push(
            new TestResult(
              testPayload[0],
              assertion[1],
              assertion[2],
              testPayload[3],
              assertion[3](),
            ),
          );
        }
      }
    }
  }

  runTests() {
    this.#testResults = [];
    this.runSoloTests();
    this.runMainTests();
    this.outputTestResultsToConsole();
  }

  parseDeckList(text) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    const cards = [];
    text.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[2] !== undefined)
      .filter((match) => match[2] !== "Maybeboard")
      .filter((match) => match[2] !== "Sideboard")
      .map((match) => {
        for (let count = 1; count <= parseInt(match[1], 10); count += 1) {
          cards.push(
            new Card(
              this.#idMap[match[2]],
              match[2],
              match[3],
              match[1],
            ),
          );
        }
      });
    return cards;
  }

  // DEPRECATED
  playLandAtIndex(index) {
    if (
      this.totalLandsPlayedAtIndex(index) >
        this.totalLandsPlayedAtIndex(index - 1)
    ) {
      return "Played Land: Yes";
    } else {
      return "Played Land: No";
    }
  }

  runDeck(_, el) {
    shuffleArray(this.#cards);
    this.updatePage();
  }

  templates(kind) {
    switch (kind) {
      case "cardStats":
        return `
<div class="card-details">
  <div>Turn: TURN</div>
  <div>Played: PLAY</div>
  <div>Total Played: TOTAL</div>
  <div>Reserve: RESERVE</div>
  <div>Behind: BEHIND</div>
</div>
`;

      case "turnCard":
        return `
<div class="card KIND-card">
  <img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
  <div class="card-details">
    <div>Turn: TURN</div>
    <div>Name: NAME</div>
    <div>Kind: KIND</div>
    <div>Played: PLAY</div>
    <div>Total Played: TOTAL</div>
    <div>Reserve: RESERVE</div>
    <div>Behind: BEHIND</div>
  </div>
</div>`;

        // DEPRECATED in favor of commanderCard,
      // openingHandCards, or turnCards
      case "card":
        return `
<div class="card KIND">
  <img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
  <div>tmp to see background</div>
</div>`;

        // DEPRECATED in favor of commanderCard,
      // openingHandCards, or turnCards
      case "cardV2":
        return `
<div class="card KIND">
  <img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
  DETAILS 
</div>`;
    }
  }

  totalLandsAtIndex(index) {
    return this.#cards.slice(0, index + 1).map((card) =>
      card.category() === "land" ? 1 : 0
    ).reduce(
      (acc, cur) => acc + cur,
      0,
    );
  }

  totalLandsInHandAtIndex(index) {
    return this.totalLandsAtIndex(index) - this.totalLandsPlayedAtIndex(index);
  }

  _totalLandsPlayedOnTurn(turn, card) {
    if (this._landsInOpeningHand() > turn) {
      return turn;
    } else {
      return this._landsInOpeningHand();
    }
  }

  // TODO: Deprecate in favor of _totalLandsPlayedOnTurn
  totalLandsPlayedAtIndex(index) {
    return Math.min(this.totalLandsAtIndex(index), index - 6);
  }

  turnCardHTML(card) {
    const subs = [
      ["TURN", card.turn()],
      ["NAME", card.name()],
      ["KIND", card.kind()],
      ["PLAY", this._landTypePlayedOnTurnV2(card)],
      ["IMAGEURL", card.imageURL()],
    ];
    return this.api.makeHTML(this.templates("turnCard"), subs);
  }

  turnAtIndex(index) {
    return index - 6;
  }

  _turnCards() {
    return this.#cards
      .filter((card, index) => card.kind() !== "commander")
      .filter((card, index) => index > 6)
      .map((card, index) => {
        card.setTurn(index + 1);
        return card;
      });
  }

  turnCards(_, el) {
    el.replaceChildren(
      ...this
        ._turnCards()
        .map((card, turn) => {
          return this.turnCardHTML(card, turn);
        }),
    );
  }

  updatePage() {
    this.api.trigger(`
commanderCard
openingHandCards
turnCards
landsInOpeningHand
`);
  }

  //
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

const testDeck = `1x Abandoned Air Temple (tla) 263 [Land]
1x Adagia, Windswept Bastion (eoe) 250 [Land]
1x Admonition Angel (znc) 10 [Removal]
1x Aegis Angel (e01) 1 [Protection]
1x Ancient Tomb (uma) 236 *F* [Land]
1x Angel of Condemnation (hou) 3 [Blink]
1x Angelic Chorus (bbd) 87 [Lifegain]
1x Angelic Field Marshal (cmm) 13 [Anthem]
1x Angelic Sleuth (ncc) 12 [Draw]
1x Archangel of Tithes (otj) 2 [Protection]
1x Authority of the Consuls (fic) 232 [Lifegain]
1x Blinding Angel (9ed) 7 [Protection]
1x Breathkeeper Seraph (voc) 31 [Protection]
1x Caduceus, Staff of Hermes (acr) 2 [Protection]
1x Cavern of Souls (lci) 269 [Land]
1x Commander's Plate (cmr) 305 [Protection]
1x Conjurer's Mantle (moc) 12 [Draw]
1x Cosmos Elixir (khm) 237 [Draw]
1x Court of Grace (onc) 62 [Draw]
1x Cradle of Vitality (jmp) 98 [Lifegain]
1x Dazzling Angel (fdn) 9 [Lifegain]
1x Elesh Norn, Grand Cenobite (plst) IMA-18 [Anthem]
1x Elspeth Tirel (onc) 64 [Tokens]
1x Enlightened Tutor (dmr) 6 [Tutor]
1x Esper Sentinel (mh2) 12 [Draw]
1x Exemplar of Light (fdn) 11 [Draw]
1x Extinguisher Battleship (eoe) 242 [Removal]
1x Folk Hero (clb) 650 *F* [Draw]
1x Ghostly Prison (tdc) 116 [Protection]
1x Giada, Font of Hope (fdn) 141 [Commander{top}]
1x Guardian of the Gateless (cn2) 89 [Protection]
1x Hall of Heliod's Generosity (dsc) 283 [Land]
1x Hedron Archive (fdn) 726 *F* [Ramp]
1x Herald of War (j25) 207 [Ramp]
1x Herald's Horn (m3c) 296 [Ramp]
1x Holy Cow (otj) 16 [Lifegain]
1x Homeward Path (c16) 301 [Land]
1x Hopeful Initiate (inr) 343 [Removal]
1x Impostor of the Sixth Pride (plst) MH1-14 [Tokens]
1x Inspiring Overseer (j25) 212 [Draw]
1x Irregular Cohort (clb) 696 [Tokens]
1x Ishgard, the Holy See // Faith & Grief (fin) 283 [Land]
1x Judgment of Alexander (fic) 455 [Protection]
1x Land Tax (cmm) 37 [Ramp]
1x Light of Promise (m21) 25 [Lifegain]
1x Linvala, Keeper of Silence (jmp) 119 [Stax]
1x Lotus Field (m20) 249 [Land]
1x Lyra Dawnbringer (fdn) 707 *F* [Lifegain]
1x Mass Calcify (m15) 18 [Removal]
1x Maze of Ith (dmr) 250 [Land]
1x Metallic Mimic (inr) 268 [Counters]
1x Minas Tirith (ltr) 256 [Land]
1x Mirror Entity (otc) 83 [Anthem]
1x Monumental Henge (mh3) 222 [Land]
1x Nykthos, Shrine to Nyx (plst) THS-223 [Land]
1x Nyx Lotus (thb) 235 [Ramp]
1x Oblation (c21) 97 [Removal]
1x Oketra's Monument (dmc) 188 [Ramp]
1x Path of Ancestry (ecc) 158 [Land]
1x Pearl Medallion (mh3) 294 [Ramp]
11x Plains (ecl) 269 [Land]
1x Reliquary Tower (tdc) 386 [Land]
1x Resplendent Angel (lci) 32 [Tokens]
1x Righteous Valkyrie (j25) 246 [Lifegain]
1x Roaming Throne (lci) 258 [Copy]
1x Rogue's Passage (fic) 415 [Land]
1x Segovian Angel (plst) MH1-25 [Evasion]
1x Sensei's Divining Top (mb2) 231 [Draw]
1x Sephara, Sky's Blade (cmm) 54 [Protection]
1x Seraph Sanctuary (plst) AVR-228 [Land]
1x Serra's Sanctum (usg) 325 [Land]
1x Smothering Tithe (cmm) 57 [Ramp]
1x Sol Ring (ecc) 57 [Ramp]
1x Starnheim Aspirant (j22) 250 [Ramp]
1x Team Avatar (tla) 38 [Pump]
1x The Eternity Elevator (eoe) 241 [Ramp]
1x The Seriema (eoe) 35 [Tutor]
1x Three Tree City (blb) 260 [Land]
1x Throne of Eldraine (woc) 28 [Ramp]
1x Tome of Legends (fic) 369 [Draw]
1x Urza's Cave (mh3) 234 [Land]
1x Urza's Incubator (mh3) 297 [Ramp]
1x Vanguard Seraph (fdn) 28 [Draw]
1x Vesuva (m3c) 404 [Land]
1x Virtue of Loyalty // Ardenvale Fealty (woe) 38 [Counters]
1x War of the Last Alliance (ltr) 36 *F* [Tutor]
1x War Room (mkc) 310 [Land]
1x Wasteland (mb2) 115 [Land]
1x Well of Lost Dreams (ltc) 291 [Draw]
1x Youthful Valkyrie (fdn) 149 [Counters]`;

function makeTestDeckList(cardIndexes) {
  let ids = [
    `1x Youthful Valkyrie (fdn) 149 [Counters]`,
    `1x Giada, Font of Hope (fdn) 141 [Commander{top}]`,
  ];
  ids = ids.concat(
    Array(98).fill(`1x Youthful Valkyrie (fdn) 149 [Counters]`, 0),
  );
  for (const cardIndex of cardIndexes) {
    ids[cardIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
}
