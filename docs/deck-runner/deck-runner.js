class Deck {
  constructor(list, idMap) {
    this.idMap = idMap;
    this.loadList(list);
  }

  cards() {
    return this._cards;
  }

  commander() {
    return this.cards().filter((card) => card.kind() === "commander")[0];
  }

  draws() {
    this.cards().filter((card) => card.kind() !== "commander")
      .slice(7).forEach((card, index) => card.setTurn(index + 1));
    return this.cards().filter((card) => card.kind() !== "commander")
      .slice(7);
  }

  hand() {
    return this.cards().filter((card) => card.kind() !== "commander")
      .slice(0, 7);
  }

  handLandCount() {
    return this.hand().filter((card) => card.kind() === "land").map((_) => 1)
      .reduce((acc, cur) => acc + cur, 0);
  }

  loadList(list) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
    this._cards = [];
    list.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
      .filter((match) => match[3] !== "Maybeboard")
      .filter((match) => match[3] !== "Sideboard")
      .forEach((match, index) => {
        for (let count = 0; count < parseInt(match[1], 10); count += 1) {
          const card = new Card(
            match[2],
            this.idMap[match[2]],
            match[3].toLowerCase(),
          );
          this._cards.push(card);
        }
      });
  }
}

const templates = {
  behindCount:
    `<div class="detail-line"><strong>Lands Behind: COUNT</strong></div>`,

  commanderCard: `<div class="card commander-card">
<div class="details">
  Commander
</div>
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
  <div class="details">
    <div class="details-header">
      <div></div>
      <div>&nbsp;</div>
    </div>
  </div>
</div>`,

  drawCard: `<div class="card draw-card land-played-TURNCLASS">
<div class="details">
  <div class="details-header">
    <div class="details-line"><strong>Turn: TURNNUM</strong></div>
    <div class="detail-line"><strong>Total: TOTALPLAYED</strong></div>
  </div>
  <div class="details-header">
    <div class="details-line"><strong>LANDPLAYEDFORTURN</strong></div>
    <div class="detail-line"><strong>STATUS</strong></div>
  </div>
</div>
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
</div>`,

  handCard: `<div class="card hand-card hand-kind-HANDCLASS">
<div class="details">
  <div class="detail-line"><strong>LANDNONLAND</strong></div>
</div>
<img 
  alt="The CARDNAME card from Magic: The Gathering"
  src="IMGSRC" />
</div>`,

  reservesCount: `<div class="detail-line reserves">Land Reserves: COUNT</div>`,

  progressReport: `
<div class="card draw-card">
<div class="details">
  <div class="detail-line"><strong>Progress Report</strong></div>
<div class="detail-line">tktktk</div>
</div>
`,

  progressGroup: `
<div class="progress-group">CARDS</div>
`,
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
  #deck;

  #commander; // DEPRECATE
  #draws; // DEPRECATE
  #hand; // DEPRECATE
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
    this.shuffleDeck();
  }

  addTests() {
    this.assert(
      "Example Deck is loaded",
      () => {
        const landArray = [];
        this.#deck = new Deck(makeTestDeckList(landArray), this.#idMap);
      },
      [
        [
          "There are 100 cards in the deck",
          100,
          () => {
            return this.#deck.cards().length;
          },
        ],
        [
          "Commander is Giada",
          "Giada, Font of Hope",
          () => {
            return this.#deck.commander().name();
          },
        ],
        [
          "Hand has 7 cards",
          7,
          () => {
            return this.#deck.hand().length;
          },
        ],
        [
          "Draws has 92 cards",
          92,
          () => {
            return this.#deck.draws().length;
          },
        ],
        [
          "First draw card has turn 1",
          1,
          () => {
            return this.#deck.draws()[0].turn();
          },
        ],
        [
          "0 lands in hand",
          0,
          () => {
            return this.#deck.handLandCount();
          },
        ],
      ],
    );

    // this.assert(
    //   "Example Deck is loaded",
    //   () => {
    //     const landArray = [];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "Commander is loaded",
    //       "Giada, Font of Hope",
    //       () => {
    //         return this.#commander.name();
    //       },
    //     ],
    //     [
    //       "Hand is loaded",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this.#hand.cards()[0].name();
    //       },
    //     ],
    //     [
    //       "Hand has only 7 cards",
    //       7,
    //       () => {
    //         return this.#hand.cards().length;
    //       },
    //     ],
    //     [
    //       "0 lands in hand",
    //       0,
    //       () => {
    //         return this.#hand.landCount();
    //       },
    //     ],
    //     [
    //       "Verify first card in hand",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this.#hand.cards()[0].name();
    //       },
    //     ],
    //     [
    //       "Draws is loaded",
    //       "Youthful Valkyrie",
    //       () => {
    //         return this.#draws.cards()[0].name();
    //       },
    //     ],
    //     [
    //       "Draws has only 92 cards",
    //       92,
    //       () => {
    //         return this.#draws.cards().length;
    //       },
    //     ],
    //     [
    //       "First draw cards has turn 1",
    //       1,
    //       () => {
    //         return this.#draws.cards()[0].turn();
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with no lands is loaded",
    //   () => {
    //     const landArray = [];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "First turn card played no lands",
    //       "none",
    //       () => {
    //         return this._landPlayedForTurn(1);
    //       },
    //     ],
    //     [
    //       "Total played on the first turn is 0",
    //       0,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 1",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count is 2 on turn 2",
    //       2,
    //       () => {
    //         return this._behindCountOnTurn(2);
    //       },
    //     ],
    //     [
    //       "Reserved count is 0 on turn 1",
    //       0,
    //       () => {
    //         return this._reservesCountOnTurn(1);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with 1 land as first draw card is loaded",
    //   () => {
    //     const landArray = [7];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "First turn card played land from draw",
    //       "draw",
    //       () => {
    //         return this._landPlayedForTurn(1);
    //       },
    //     ],
    //     [
    //       "Total played on the first turn is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count is 0 on turn 1",
    //       0,
    //       () => {
    //         return this._behindCountOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 2",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(2);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with lands on turns 2 and 5",
    //   () => {
    //     const landArray = [8, 11];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "First turn doesn't have card",
    //       "none",
    //       () => {
    //         return this._landPlayedForTurn(1);
    //       },
    //     ],
    //     [
    //       "Second turn card played land from draw",
    //       "draw",
    //       () => {
    //         return this._landPlayedForTurn(2);
    //       },
    //     ],
    //     [
    //       "Fifth turn card played land from draw",
    //       "draw",
    //       () => {
    //         return this._landPlayedForTurn(5);
    //       },
    //     ],
    //     [
    //       "Total played on the first turn is 0",
    //       0,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Total played on the second turn is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "Total played on the third turn is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(3);
    //       },
    //     ],
    //     [
    //       "Total played on the fifth turn is 2",
    //       2,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(5);
    //       },
    //     ],
    //     [
    //       "Behind count is 0 on turn 1",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 2",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(2);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 3",
    //       2,
    //       () => {
    //         return this._behindCountOnTurn(3);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 5",
    //       3,
    //       () => {
    //         return this._behindCountOnTurn(5);
    //       },
    //     ],
    //     [
    //       "Behind count is 1 on turn 6",
    //       4,
    //       () => {
    //         return this._behindCountOnTurn(6);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with 1 card in hand",
    //   () => {
    //     const landArray = [1];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "1 land in hand",
    //       1,
    //       () => {
    //         return this.#hand.landCount();
    //       },
    //     ],
    //     [
    //       "Turn 1 plays a reserve card",
    //       "reserve",
    //       () => {
    //         return this._landPlayedForTurn(1);
    //       },
    //     ],
    //     [
    //       "Turn 2 has no card to play",
    //       "none",
    //       () => {
    //         return this._landPlayedForTurn(2);
    //       },
    //     ],
    //     [
    //       "Total played on the turn 1 is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Total played on the turn 2 is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(2);
    //       },
    //     ],
    //     [
    //       "Behind count on turn 1 is 0",
    //       0,
    //       () => {
    //         return this._behindCountOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count on turn 2 is 1",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(2);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with 4 card in hand and draws on 2, 4, and 5",
    //   () => {
    //     const landArray = [2, 4, 5, 6, 8, 10, 11];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "Turn 6 plays a reserve card",
    //       "reserve",
    //       () => {
    //         return this._landPlayedForTurn(6);
    //       },
    //     ],
    //     [
    //       "Total played on the turn 1 is 1",
    //       1,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Behind count on turn 7 is 0",
    //       0,
    //       () => {
    //         return this._behindCountOnTurn(7);
    //       },
    //     ],
    //     [
    //       "Behind count on turn 8 is 1",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(8);
    //       },
    //     ],
    //     [
    //       "Reserves count on turn 1 is 3",
    //       3,
    //       () => {
    //         return this._reservesCountOnTurn(1);
    //       },
    //     ],
    //     [
    //       "Reserves count on turn 3 is 2",
    //       2,
    //       () => {
    //         return this._reservesCountOnTurn(3);
    //       },
    //     ],
    //     [
    //       "Reserves count on turn 6 is 1",
    //       1,
    //       () => {
    //         return this._reservesCountOnTurn(6);
    //       },
    //     ],
    //   ],
    // );

    // this.assert(
    //   "Deck with 4 card in hand and draw on 5",
    //   () => {
    //     const landArray = [2, 4, 5, 6, 11];
    //     this.#commander = this.loadCommander(makeTestDeckList(landArray));
    //     this.#hand = this.loadHand(makeTestDeckList(landArray));
    //     this.#draws = this.loadDraws(makeTestDeckList(landArray));
    //     this.updatePage();
    //   },
    //   [
    //     [
    //       "Turn 6 plays a reserve card",
    //       "none",
    //       () => {
    //         return this._landPlayedForTurn(6);
    //       },
    //     ],
    //     [
    //       "Total played on the turn 6 is 5",
    //       5,
    //       () => {
    //         return this._totalLandsPlayedOnTurn(6);
    //       },
    //     ],
    //     [
    //       "Behind count on turn 6 is 1",
    //       1,
    //       () => {
    //         return this._behindCountOnTurn(6);
    //       },
    //     ],
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
      ["CARDNAME", this.#deck.commander().name()],
      ["IMGSRC", this.makeImageURL(this.#deck.commander().id())],
    ];
    el.replaceChildren(
      this.api.makeHTML(templates.commanderCard, subs),
    );
  }

  drawCard(card) {
    const subs = [
      ["BEHIND", this._behindCountOnTurnEl(card.turn())],
      ["CARDKIND", card.kind()],
      ["CARDNAME", card.name()],
      ["IMGSRC", this.makeImageURL(card.id())],
      ["LANDPLAYEDFORTURN", this._landPlayedForTurnText(card.turn())],
      ["RESERVES", this._reservesCountOnTurnEl(card.turn())],
      ["STATUS", this._turnStatus(card.turn())],
      ["TOTALPLAYED", this._totalLandsPlayedOnTurn(card.turn())],
      ["TURNCLASS", this._landPlayedForTurn(card.turn())],
      ["TURNNUM", card.turn()],
    ];
    return this.api.makeHTML(templates.drawCard, subs);
  }

  drawCards(_, el) {
    let cards = this.#draws.cards().map((card) => this.drawCard(card));

    // for (let pg = 150; pg > 0; pg -= 5) {
    //   const report = this.api.makeHTML(templates.progressReport);
    //   cards.splice(pg, 0, report);
    //   // const cards = this.#draws.cards()
    //   //   .slice(pg, pg + 5)
    //   //   .map((card) => this.drawCard(card));
    //   // cards.push(this.api.makeHTML(templates.progressReport));
    //   // const subs = [
    //   //   ["CARDS", cards],
    //   // ];
    //   // const report = this.api.makeHTML(templates.progressGroup, subs);
    //   // el.appendChild(report);
    // }

    // const outputArray = this.#draws.cards().map((card) => this.drawCard(card));
    // outputArray.splice(5, 0, this.api.makeHTML(templates.progressReport));

    el.replaceChildren(
      ...cards,
    );
  }

  deckList() {
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
    if (card.kind() === "land") {
      subs.push(["HANDCLASS", card.kind()]);
      subs.push(["LANDNONLAND", "Land"]);
    } else {
      subs.push(["HANDCLASS", "non-land"]);
      subs.push(["LANDNONLAND", "Non-Land"]);
    }
    return this.api.makeHTML(templates.handCard, subs);
  }

  openingHandCards(_, el) {
    el.replaceChildren(
      ...this.#deck.hand().map((card) => this.handCard(card)),
    );
  }

  handLandCount(_, el) {
    el.innerHTML = this.#deck.handLandCount();
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
        return "Played Draw";
      case ("none"):
        return "---";
      case ("reserve"):
        return "Played Reserve";
    }
  }

  loadDeck(list) {
  }

  // loadCommander(list) {
  //   const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
  //   return list.split("\n")
  //     .map((line) => line.match(cardMatcher))
  //     .filter((match) => match !== null)
  //     .filter((match) => match[3] !== undefined)
  //     .filter((match) => match[3] === "Commander")
  //     .map((match) => {
  //       return new Commander(
  //         match[2],
  //         this.#idMap[match[2]],
  //       );
  //     })[0];
  // }

  // loadDraws(list) {
  //   const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
  //   const cards = [];
  //   list.split("\n")
  //     .map((line) => line.match(cardMatcher))
  //     .filter((match) => match !== null)
  //     .filter((match) => match[3] !== undefined)
  //     .filter((match) => match[3] !== "Commander")
  //     .filter((match) => match[3] !== "Maybeboard")
  //     .slice(7)
  //     .forEach((match, index) => {
  //       for (let count = 0; count < parseInt(match[1], 10); count += 1) {
  //         const card = new Card(
  //           match[2],
  //           this.#idMap[match[2]],
  //           match[3].toLowerCase(),
  //         );
  //         card.setTurn(index + 1);
  //         cards.push(card);
  //       }
  //     });
  //   return new Draws(cards);
  // }

  // loadHand(list) {
  //   const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+)/;
  //   return new Hand(
  //     list.split("\n")
  //       .map((line) => line.match(cardMatcher))
  //       .filter((match) => match !== null)
  //       .filter((match) => match[3] !== undefined)
  //       .filter((match) => match[3] !== "Commander")
  //       .filter((match) => match[3] !== "Maybeboard")
  //       .slice(0, 7)
  //       .map((match) => {
  //         return new Card(
  //           match[2],
  //           this.#idMap[match[2]],
  //           match[3],
  //         );
  //       }),
  //   );
  // }

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

  shuffleDeck() {
    let lines = document.querySelector(".deck-list").value.split("\n");
    shuffleArray(lines);
    const shuffledDeck = lines.join("\n");
    this.#deck = new Deck(shuffledDeck, this.#idMap);
    this.updatePage();
  }

  _totalLandsPlayedOnTurn(turn) {
    return Math.min(
      this.#draws.landsOnTurn(turn) +
        this.#hand.landCount(),
      turn,
    );
  }

  _turnStatus(turn) {
    if (this._reservesCountOnTurn(turn) > 0) {
      return `Buffer: ${this._reservesCountOnTurn(turn)}`;
    } else if (
      this._behindCountOnTurn(turn) > 0
    ) {
      return `Behind: ${this._behindCountOnTurn(turn)}`;
    } else {
      return "Buffer: 0";
    }
  }

  updatePage() {
    this.api.trigger(
      "commanderCard handLandCount openingHandCards", // handCards drawCards handLandCount",
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
  const ids = Array(83).fill(`1x Youthful Valkyrie (fdn) 149 [Counters]`, 0);
  ids.push(
    `1x Giada, Font of Hope (fdn) 141 [Commander{top}]`,
  );
  ids.push(
    `16x Youthful Valkyrie (fdn) 149 [Counters]`,
  );

  for (const landIndex of landsToAdd) {
    ids[landIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
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
