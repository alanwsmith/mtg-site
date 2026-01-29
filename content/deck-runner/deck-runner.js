const templates = {
  commanderCard: `<div class="commander-card">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
</div>`,

  drawCard: `<div class="draw-card">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
<div class="turn-details __PLAYED_LAND__">
  <div>Turn: TURNNUM</div>
  <div>LANDPLAYEDFORTURN</div>
  <div>Total Lands: TOTALPLAYED</div>
  <div>Behind: BEHIND</div>
  <div>Reserves: RESERVES</div>
</div>
</div>`,

  handCard: `<div class="hand-card">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
</div>`,
};

class Card {
  constructor(name, id, kind) {
    this._name = name;
    this._id = id;
    this._kind = kind;
  }

  kind() {
    return this._kind;
  }

  id() {
    return this._id;
  }

  name() {
    return escapeHTML(this._name);
  }

  setTurn(num) {
    this._turn = num;
  }

  turn() {
    return this._turn;
  }
}

class Commander {
  constructor(name, id) {
    this._name = name;
    this._id = id;
  }

  id() {
    return this._id;
  }

  name() {
    return escapeHTML(this._name);
  }
}

class Draws {
  constructor(cards) {
    this._cards = cards;
  }

  cards() {
    return this._cards;
  }
}

class Hand {
  constructor(cards) {
    this._cards = cards;
  }

  cards() {
    return this._cards;
  }

  landCount() {
    return 0;
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
  #commander;
  #draws;
  #hand;
  #idMap;
  #errors;
  #exampleDeck;
  #testResults;
  #tests = [];

  async bittyInit() {
    await this.loadIdMap();
    await this.loadExampleDeck();
  }

  bittyReady() {
    this.addTests();
    this.runTests();
  }

  addTests() {
    this.assert(
      "Example Deck is loaded",
      () => {
        const landArray = [];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "Commander is loaded",
          "Giada, Font of Hope",
          () => {
            return this.#commander.name();
          },
        ],
        [
          "Hand is loaded",
          "Youthful Valkyrie",
          () => {
            return this.#hand.cards()[0].name();
          },
        ],
        [
          "Hand has only 7 cards",
          7,
          () => {
            return this.#hand.cards().length;
          },
        ],
        [
          "Verify first card in hand",
          "Youthful Valkyrie",
          () => {
            return this.#hand.cards()[0].name();
          },
        ],
        [
          "Draws is loaded",
          "Youthful Valkyrie",
          () => {
            return this.#draws.cards()[0].name();
          },
        ],
        [
          "Draws has only 92 cards",
          92,
          () => {
            return this.#draws.cards().length;
          },
        ],
        [
          "First draw cards has turn 1",
          1,
          () => {
            return this.#draws.cards()[0].turn();
          },
        ],
      ],
    );

    this.assert(
      "Deck with no lands is loaded",
      () => {
        const landArray = [];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "0 lands in hand",
          0,
          () => {
            return this.#hand.landCount();
          },
        ],
        [
          "First turn card played no lands",
          "No land to play",
          () => {
            return this._landForTurn(1);
          },
        ],
        [
          "Total played on the first turn is 0",
          0,
          () => {
            return this._totalPlayedOnTurn(1);
          },
        ],
        [
          "Behind count is 1 on turn 1",
          1,
          () => {
            return this._behindCountOnTurn(1);
          },
        ],
        [
          "Behind count is 2 on turn 2",
          2,
          () => {
            return this._behindCountOnTurn(2);
          },
        ],
        [
          "Reserved count is 0 on turn 1",
          0,
          () => {
            return this._reservesCountOnTurn(1);
          },
        ],
      ],
    );

    this.assert(
      "Deck with 1 land as first draw card is loaded",
      () => {
        const landArray = [8];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "0 lands in hand",
          0,
          () => {
            return this.#hand.landCount();
          },
        ],
        [
          "First turn card played land from draw",
          "Drew/Played Land",
          () => {
            return this._landForTurn(1);
          },
        ],
      ],
    );

    //
  }

  assert(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "is"]);
  }

  assertNotEqual(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "isNot"]);
  }

  _behindCountOnTurn(turn) {
    return turn;
  }

  commanderCard(_, el) {
    const subs = [
      ["CARDNAME", this.#commander.name()],
      ["IMGSRC", this.makeImageURL(this.#commander.id())],
    ];
    el.replaceChildren(
      this.api.makeHTML(templates.commanderCard, subs),
    );
  }

  drawCard(card) {
    const subs = [
      ["CARDNAME", card.name()],
      ["IMGSRC", this.makeImageURL(card.id())],
      ["TURNNUM", card.turn()],
      ["LANDPLAYEDFORTURN", this._landForTurn(card.turn())],
      ["TOTALPLAYED", this._totalPlayedOnTurn(card.turn())],
      ["BEHIND", this._behindCountOnTurn(card.turn())],
      ["RESERVES", this._reservesCountOnTurn(card.turn())],
    ];
    return this.api.makeHTML(templates.drawCard, subs);
  }

  drawCards(_, el) {
    el.replaceChildren(
      ...this.#draws.cards().map((card) => this.drawCard(card)),
    );
  }

  failedTestCount() {
    return this.#testResults
      .filter((result) => (result.result() !== "PASSED")).length;
  }

  handCard(card) {
    const subs = [
      ["CARDNAME", card.name()],
      ["IMGSRC", this.makeImageURL(card.id())],
    ];
    return this.api.makeHTML(templates.handCard, subs);
  }

  handCards(_, el) {
    el.replaceChildren(
      ...this.#hand.cards().map((card) => this.handCard(card)),
    );
  }

  _landForTurn(turn) {
    if (this.#draws.cards()[turn - 1].kind() === "land") {
      return "Drew/Played Land";
    } else {
      return "No land to play";
    }
  }

  loadCommander(list) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    return list.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
      .filter((match) => match[3] === "Commander")
      .map((match) => {
        return new Commander(
          match[2],
          this.#idMap[match[2]],
        );
      })[0];
  }

  loadDraws(list) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    return new Hand(
      list.split("\n")
        .map((line) => line.match(cardMatcher))
        .filter((match) => match !== null)
        .filter((match) => match[3] !== undefined)
        .filter((match) => match[3] !== "Commander")
        .filter((match) => match[3] !== "Maybeboard")
        .slice(7)
        .map((match, index) => {
          const card = new Card(
            match[2],
            this.#idMap[match[2]],
            match[3].toLowerCase(),
          );
          card.setTurn(index + 1);
          return card;
        }),
    );
  }

  loadHand(list) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    return new Hand(
      list.split("\n")
        .map((line) => line.match(cardMatcher))
        .filter((match) => match !== null)
        .filter((match) => match[3] !== undefined)
        .filter((match) => match[3] !== "Commander")
        .filter((match) => match[3] !== "Maybeboard")
        .slice(0, 7)
        .map((match) => {
          return new Card(
            match[2],
            this.#idMap[match[2]],
            match[3],
          );
        }),
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

  makeImageURL(id) {
    const char1 = id.substring(0, 1);
    const char2 = id.substring(1, 2);
    return `https://cards.scryfall.io/border_crop/front/${char1}/${char2}/${id}.jpg`;
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

  _reservesCountOnTurn(turn) {
    return 0;
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

  _totalPlayedOnTurn(turn) {
    return 0;
  }

  updatePage() {
    this.api.trigger(
      "commanderCard handCards drawCards",
    );
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

function makeTestDeckList(landsToAdd) {
  let ids = [
    `1x Youthful Valkyrie (fdn) 149 [Counters]`,
    `1x Youthful Valkyrie (fdn) 149 [Counters]`,
    `1x Youthful Valkyrie (fdn) 149 [Counters]`,
    `1x Giada, Font of Hope (fdn) 141 [Commander{top}]`,
  ];
  ids = ids.concat(
    Array(96).fill(`1x Youthful Valkyrie (fdn) 149 [Counters]`, 0),
  );
  for (const landIndex of landsToAdd) {
    ids[landIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
}
