const templates = {
  commanderCard: `<div>
<img 
  alt="The NAME card from Magic: The Gathering"
  src="IMAGE_SRC" />
</div>`,
};

class Card {
  constructor(name, id, category) {
    this._name = name;
    this._id = id;
    this._category = category;
  }

  category() {
    return this._category;
  }

  id() {
    return this._id;
  }

  name() {
    return this._name;
  }
}

class Commander {
  constructor(name, id) {
    this._name = name;
    this._id = id;
  }

  name() {
    return this._name;
  }

  id() {
    return this._id;
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
        this.#commander = this.loadCommander(makeTestDeckList([]));
        this.#hand = this.loadHand(makeTestDeckList([]));
        this.#draws = this.loadDraws(makeTestDeckList([]));
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
      ],
    );
  }

  assert(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "is"]);
  }

  assertNotEqual(givenText, givenFunction, tests, assertion) {
    this.#tests.push([givenText, givenFunction, tests, "isNot"]);
  }

  commanderCard(_, el) {
    const subs = [
      ["IMAGE_SRC", this.makeImageURL(this.#commander.id())],
    ];
    el.replaceChildren(
      this.api.makeHTML(templates.commanderCard, subs),
    );
  }

  failedTestCount() {
    return this.#testResults
      .filter((result) => (result.result() !== "PASSED")).length;
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
        .map((match) => {
          return new Card(
            match[2],
            match[3],
            this.#idMap[match[2]],
          );
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
            match[3],
            this.#idMap[match[2]],
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

  updatePage() {
    this.api.trigger(
      "commanderCard",
    );
  }
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
    ids[cardIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
}
