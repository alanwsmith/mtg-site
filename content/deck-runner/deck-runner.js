const templates = {
  behindCount: `<div class="detail-line behind">Behind: COUNT</div>`,

  commanderCard: `<div class="card commander-card">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
</div>`,

  drawCard: `<div class="card draw-card land-played-TURNCLASS">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
<div class="details">
  <div class="details-header">
    <div>Turn: TURNNUM</div>
    <div>[CARDKIND]</div>
  </div>
  <div class="detail-line">LANDPLAYEDFORTURN</div>
  <div class="detail-line">Total Lands: TOTALPLAYED</div>
  BEHIND
  RESERVES
</div>
</div>`,

  handCard: `<div class="card hand-card">
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
<div class="details hand-card-details">
  <div class="details-header">
    <div></div>
    <div>[CARDKIND]</div>
  </div>
</div>
</div>`,

  reservesCount: `<div class="detail-line reserves">Hand Reserves: COUNT</div>`,
};

class Card {
  constructor(name, id, kind) {
    this._name = name;
    this._id = id;
    this._kind = kind;
  }

  kind() {
    return this._kind.toLowerCase();
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

  kind() {
    return "commander";
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

  landsOnTurn(turn) {
    return this.cards()
      .slice(0, turn)
      .filter((card) => card.kind() === "land")
      .map((card) => 1)
      .reduce((acc, cur) => acc + cur, 0);
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
    return this.cards().filter((card) => card.kind() === "land")
      .map((card) => 1)
      .reduce(
        (acc, cur) => acc + cur,
        0,
      );
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
          "0 lands in hand",
          0,
          () => {
            return this.#hand.landCount();
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
          "First turn card played no lands",
          "none",
          () => {
            return this._landPlayedForTurn(1);
          },
        ],
        [
          "Total played on the first turn is 0",
          0,
          () => {
            return this._totalLandsPlayedOnTurn(1);
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
        const landArray = [7];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "First turn card played land from draw",
          "draw",
          () => {
            return this._landPlayedForTurn(1);
          },
        ],
        [
          "Total played on the first turn is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(1);
          },
        ],
        [
          "Behind count is 0 on turn 1",
          0,
          () => {
            return this._behindCountOnTurn(1);
          },
        ],
        [
          "Behind count is 1 on turn 2",
          1,
          () => {
            return this._behindCountOnTurn(2);
          },
        ],
      ],
    );

    this.assert(
      "Deck with lands on turns 2 and 5",
      () => {
        const landArray = [8, 11];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "First turn doesn't have card",
          "none",
          () => {
            return this._landPlayedForTurn(1);
          },
        ],
        [
          "Second turn card played land from draw",
          "draw",
          () => {
            return this._landPlayedForTurn(2);
          },
        ],
        [
          "Fifth turn card played land from draw",
          "draw",
          () => {
            return this._landPlayedForTurn(5);
          },
        ],
        [
          "Total played on the first turn is 0",
          0,
          () => {
            return this._totalLandsPlayedOnTurn(1);
          },
        ],
        [
          "Total played on the second turn is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(2);
          },
        ],
        [
          "Total played on the third turn is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(3);
          },
        ],
        [
          "Total played on the fifth turn is 2",
          2,
          () => {
            return this._totalLandsPlayedOnTurn(5);
          },
        ],
        [
          "Behind count is 0 on turn 1",
          1,
          () => {
            return this._behindCountOnTurn(1);
          },
        ],
        [
          "Behind count is 1 on turn 2",
          1,
          () => {
            return this._behindCountOnTurn(2);
          },
        ],
        [
          "Behind count is 1 on turn 3",
          2,
          () => {
            return this._behindCountOnTurn(3);
          },
        ],
        [
          "Behind count is 1 on turn 5",
          3,
          () => {
            return this._behindCountOnTurn(5);
          },
        ],
        [
          "Behind count is 1 on turn 6",
          4,
          () => {
            return this._behindCountOnTurn(6);
          },
        ],
      ],
    );

    this.assert(
      "Deck with 1 card in hand",
      () => {
        const landArray = [1];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "1 land in hand",
          1,
          () => {
            return this.#hand.landCount();
          },
        ],
        [
          "Turn 1 plays a reserve card",
          "reserve",
          () => {
            return this._landPlayedForTurn(1);
          },
        ],
        [
          "Turn 2 has no card to play",
          "none",
          () => {
            return this._landPlayedForTurn(2);
          },
        ],
        [
          "Total played on the turn 1 is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(1);
          },
        ],
        [
          "Total played on the turn 2 is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(2);
          },
        ],
        [
          "Behind count on turn 1 is 0",
          0,
          () => {
            return this._behindCountOnTurn(1);
          },
        ],
        [
          "Behind count on turn 2 is 1",
          1,
          () => {
            return this._behindCountOnTurn(2);
          },
        ],
      ],
    );

    this.assert(
      "Deck with 4 card in hand and draws on 2, 4, and 5",
      () => {
        const landArray = [2, 4, 5, 6, 8, 10, 11];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "Turn 6 plays a reserve card",
          "reserve",
          () => {
            return this._landPlayedForTurn(6);
          },
        ],
        [
          "Total played on the turn 1 is 1",
          1,
          () => {
            return this._totalLandsPlayedOnTurn(1);
          },
        ],
        [
          "Behind count on turn 7 is 0",
          0,
          () => {
            return this._behindCountOnTurn(7);
          },
        ],
        [
          "Behind count on turn 8 is 1",
          1,
          () => {
            return this._behindCountOnTurn(8);
          },
        ],
        [
          "Reserves count on turn 1 is 3",
          3,
          () => {
            return this._reservesCountOnTurn(1);
          },
        ],
        [
          "Reserves count on turn 3 is 2",
          2,
          () => {
            return this._reservesCountOnTurn(3);
          },
        ],
        [
          "Reserves count on turn 6 is 1",
          1,
          () => {
            return this._reservesCountOnTurn(6);
          },
        ],
      ],
    );

    this.assert(
      "Deck with 4 card in hand and draw on 5",
      () => {
        const landArray = [2, 4, 5, 6, 11];
        this.#commander = this.loadCommander(makeTestDeckList(landArray));
        this.#hand = this.loadHand(makeTestDeckList(landArray));
        this.#draws = this.loadDraws(makeTestDeckList(landArray));
        this.updatePage();
      },
      [
        [
          "Turn 6 plays a reserve card",
          "none",
          () => {
            return this._landPlayedForTurn(6);
          },
        ],
        [
          "Total played on the turn 6 is 5",
          5,
          () => {
            return this._totalLandsPlayedOnTurn(6);
          },
        ],
        [
          "Behind count on turn 6 is 1",
          1,
          () => {
            return this._behindCountOnTurn(6);
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
    return turn - this._totalLandsPlayedOnTurn(turn);
  }

  _behindCountOnTurnEl(turn) {
    if (this._behindCountOnTurn(turn) > 0) {
      const subs = [
        ["COUNT", this._behindCountOnTurn(turn)],
      ];
      return this.api.makeTXT(templates.behindCount, subs);
    } else {
      return "";
    }
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
      ["CARDKIND", card.kind()],
      ["IMGSRC", this.makeImageURL(card.id())],
      ["TURNNUM", card.turn()],
      ["TURNCLASS", this._landPlayedForTurn(card.turn())],
      ["LANDPLAYEDFORTURN", this._landPlayedForTurnText(card.turn())],
      ["TOTALPLAYED", this._totalLandsPlayedOnTurn(card.turn())],
      ["BEHIND", this._behindCountOnTurnEl(card.turn())],
      ["RESERVES", this._reservesCountOnTurnEl(card.turn())],
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
      ["CARDKIND", card.kind()],
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

  handLandCount(_, el) {
    el.innerHTML = this.#hand.landCount();
  }

  _landPlayedForTurn(turn) {
    if (this.#draws.cards()[turn - 1].kind() === "land") {
      return "draw";
    } else if (
      this.#hand.landCount() + this.#draws.landsOnTurn(turn) >= turn
    ) {
      return "reserve";
    } else {
      return "none";
    }
  }

  _landPlayedForTurnText(turn) {
    switch (this._landPlayedForTurn(turn)) {
      case ("draw"):
        return "Draw land played";
      case ("none"):
        return "No land to play";
      case ("reserve"):
        return "Reserve land played";
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
    return new Draws(
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
    return Math.max(
      this.#hand.landCount() - turn +
        this.#draws.landsOnTurn(turn),
      0,
    );
  }

  _reservesCountOnTurnEl(turn) {
    if (this._reservesCountOnTurn(turn) > 0) {
      const subs = [
        ["COUNT", this._reservesCountOnTurn(turn)],
      ];
      return this.api.makeTXT(templates.reservesCount, subs);
    } else {
      return "";
    }
  }

  runMainTests() {
    if (this.#testResults.length === 0) {
      for (const testPayload of this.#tests) {
        testPayload[1]();
        for (const assertion of testPayload[2]) {
          // TODO: Add a feature here where you can
          // do `break` to skip the rest of the
          // tests in a payload without having
          // to skip them individually.
          if (
            assertion.length === 3 ||
            assertion.length === 4 &&
              assertion[0] !== "solo" &&
              assertion[0] !== "skip"
          ) {
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

  _totalLandsPlayedOnTurn(turn) {
    return Math.min(
      this.#draws.landsOnTurn(turn) +
        this.#hand.landCount(),
      turn,
    );
  }

  updatePage() {
    this.api.trigger(
      "commanderCard handCards drawCards handLandCount",
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
  const ids = Array(99).fill(`1x Youthful Valkyrie (fdn) 149 [Counters]`, 0);
  ids.push(
    `1x Giada, Font of Hope (fdn) 141 [Commander{top}]`,
  );
  for (const landIndex of landsToAdd) {
    ids[landIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
}
