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

class TestResult {
  constructor(description, got, expected, assertion) {
    this._description = description;
    this._expected = expected;
    this._assertion = assertion;
    this._got = got;
  }

  message() {
    return `${this.result()}: ${this._description} - Expected: ${this._expected} - Got: ${this._got}`;
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
  #errors;
  #exampleDeck;
  #idMap;
  #testResults = [];
  #tests = [];

  assert(given, tests) {
    this.#tests.push([given, tests, "is"]);
  }

  addTests() {
    this.assert(
      () => {
        this.#cards = this.parseDeckList(makeTestDeckList([]));
        this.updatePage();
      },
      [
        [
          "No lands in opening hand",
          () => {
            return this._landsInOpeningHand();
          },
          0,
        ],
        [
          "solo",
          "0 Lands played at turn 1",
          () => {
            return this._landsPlayedAtTurn(1);
          },
          0,
        ],
        [
          "0 Lands played at turn 2",
          () => {
            return this._landsPlayedAtTurn(2);
          },
          0,
        ],
        [
          "1 Land behind at turn 1",
          () => {
            return this._landsBehindAtTurn(1);
          },
          1,
        ],
      ],
    );

    this.assert(
      () => {
        this.#cards = this.parseDeckList(makeTestDeckList([0]));
        this.updatePage();
      },
      [
        [
          "1 Land in opening hand",
          () => {
            return this._landsInOpeningHand();
          },
          1,
        ],
      ],
    );
  }

  // test1(_, el) {
  //   this.#cards = this.parseDeckList(makeTestDeckList([]));
  //   this.runTest(
  //     1,
  //     this.landsBehindAtIndex(7),
  //     "landsBehindAtIndex(7) is 1 if no incoming lands",
  //   );
  //   this.runTest(
  //     0,
  //     this.totalLandsPlayedAtIndex(7),
  //     "totalLandsPlayedAtIndex === 0 on turn 1 if there are no land in the opening hand",
  //   );
  //   this.runTest(
  //     0,
  //     this.landsInOpeningHandDisplay(7),
  //     "landsInOpeningHand === 0 if there are no land in the opening hand",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  runTests() {
    for (const testPayload of this.#tests) {
      // Run solo tests
      for (const assertion of testPayload[1]) {
        if (assertion.length === 4 && assertion[0] === "solo") {
          testPayload[0](); // Run function under test
          this.#testResults.push(
            new TestResult(
              assertion[1],
              assertion[2](),
              assertion[3],
              testPayload[2],
            ),
          );
        }
      }

      // testPayload[0](); // Run function under test
      // for (const assertion of testPayload[1]) {
      //   this.#testResults.push(
      //     new TestResult(
      //       assertion[0],
      //       assertion[1](),
      //       assertion[2],
      //       testPayload[2],
      //     ),
      //   );
    }
    this.#testResults
      .filter((result) => (result.result() === "PASSED"))
      .forEach((result) => console.log(result.message()));
    this.#testResults
      .filter((result) => (result.result() !== "PASSED"))
      .forEach((result) => console.error(result.message()));
  }

  // if (assertions[2] === "equal") {
  //   const result = assertion[1]();
  //   if (assertion[2] === result) {
  //     console.log(
  //       `PASSED: ${assertion[0]} - Expected: ${assertion[2]} - Got: ${
  //         assertion[1]
  //       }`,
  //     );
  //   } else {
  //   }
  // }

  async bittyInit() {
    await this.loadExampleDeck();
    await this.loadIdMap();
    this.loadCards();
  }

  bittyReady() {
    //this.api.trigger("runDeck");
    this.addTests();
    this.runTests();
    // this.api.trigger("test1");
    // this.api.trigger("test2");
    // this.api.trigger("test3");
    // this.api.trigger("test4");
    // this.api.trigger("test5");
    // this.api.trigger("test6");
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
    const subs = [
      ["TURN", this.turnAtIndex(index)],
      ["TOTAL", this.totalLandsPlayedAtIndex(index)],
      // ["PLAY", this.playLandAtIndex(index)],
      // ["BEHIND", this.landsBehindAtIndex(index)],
    ];
    if (this.totalLandsInHandAtIndex(index) > 0) {
      subs.push([
        "HAND",
        `<div>Reserves: ${this.totalLandsInHandAtIndex(index)}</div>`,
      ]);
    } else {
      subs.push(["HAND", ""]);
    }
    if (this.landsBehindAtIndex(index) > 0) {
      subs.push([
        "BEHIND",
        `<div>Behind: ${this.landsBehindAtIndex(index)}</div>`,
      ]);
    } else {
      subs.push(["BEHIND", ""]);
    }
    if (this.playLandAtIndex(index)) {
      subs.push([
        "PLAY",
        `<div>${this.playLandAtIndex(index)}</div>`,
      ]);
    } else {
      subs.push(["PLAY", ""]);
    }
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

  landsBehindAtIndex(index) {
    return this.turnAtIndex(index) - this.totalLandsPlayedAtIndex(index);
  }

  _landsBehindAtTurn(turn) {
    return 1;
  }

  _landsInOpeningHand() {
    return this.#cards
      .slice(0, 7)
      .map((card) => card.category() === "land" ? 1 : 0)
      .reduce((acc, cur) => acc + cur, 0);
    //el.innerHTML = this.landsInOpeningHandDisplay();
  }

  landsInOpeningHand(_, el) {
    el.innerHTML = this._landsInOpeningHand();
  }

  _landsPlayedAtTurn(turn) {
    return 0;
  }

  // landsInOpeningHandDisplay() {
  //   return this.#cards
  //     .slice(0, 7)
  //     .map((card) => card.category() === "land" ? 1 : 0)
  //     .reduce((acc, cur) => acc + cur, 0);
  // }

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

  // runTest(expected, got, description) {
  //   if (expected === got) {
  //     this.#testResults.push(`PASSED: ${description}`);
  //   } else {
  //     this.#testResults.push(
  //       `FAILED: ${description}\n  Expected: ${expected} - Got: ${got}`,
  //     );
  //   }
  // }

  // test1(_, el) {
  //   this.#cards = this.parseDeckList(makeTestDeckList([]));
  //   this.runTest(
  //     1,
  //     this.landsBehindAtIndex(7),
  //     "landsBehindAtIndex(7) is 1 if no incoming lands",
  //   );
  //   this.runTest(
  //     0,
  //     this.totalLandsPlayedAtIndex(7),
  //     "totalLandsPlayedAtIndex === 0 on turn 1 if there are no land in the opening hand",
  //   );
  //   this.runTest(
  //     0,
  //     this.landsInOpeningHandDisplay(7),
  //     "landsInOpeningHand === 0 if there are no land in the opening hand",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  // test2(_, el) {
  //   this.#cards = this.parseDeckList(makeTestDeckList([0]));
  //   this.runTest(
  //     1,
  //     this.totalLandsPlayedAtIndex(7),
  //     "totalLandsPlayedAtIndex === 1 on turn 1 if there's a land in the opening hand",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  // test3(_, el) {
  //   this.#cards = this.parseDeckList(makeTestDeckList([0, 4, 5, 9]));
  //   this.runTest(
  //     1,
  //     this.totalLandsPlayedAtIndex(7),
  //     "totalLandsPlayedAtIndex(7) === 1 from test",
  //   );
  //   this.runTest(
  //     2,
  //     this.totalLandsPlayedAtIndex(8),
  //     "totalLandsPlayedAtIndex(8) === 2 from test",
  //   );
  //   this.runTest(
  //     4,
  //     this.totalLandsPlayedAtIndex(12),
  //     "totalLandsPlayedAtIndex(12) === 4 from test",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  // test4(_, el) {
  //   this.#cards = this.parseDeckList(
  //     makeTestDeckList([1, 5, 8, 10, 13, 14, 15, 20, 22]),
  //   );
  //   this.runTest(
  //     0,
  //     this.landsBehindAtIndex(7),
  //     "landsBehindAtIndex(7) === 0 if there are lands in the opening hand",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  // test5(_, el) {
  //   this.#cards = this.parseDeckList(
  //     makeTestDeckList([5, 8]),
  //   );
  //   this.runTest(
  //     0,
  //     this.landsBehindAtIndex(8),
  //     "landsBehindAtIndex(8) === 0 from test",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  // test6(_, el) {
  //   this.#cards = this.parseDeckList(
  //     makeTestDeckList([1, 3, 6, 7]),
  //   );
  //   this.runTest(
  //     0,
  //     this.landsBehindAtIndex(8),
  //     "landsBehindAtIndex(8) === 0 from test",
  //   );
  //   el.innerHTML = this.#testResults.join("\n");
  //   this.updatePage();
  // }

  updatePage() {
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

  totalLandsInHandAtIndex(index) {
    return this.totalLandsAtIndex(index) - this.totalLandsPlayedAtIndex(index);
  }

  totalLandsPlayedAtIndex(index) {
    return Math.min(this.totalLandsAtIndex(index), index - 6);
  }

  turnAtIndex(index) {
    return index - 6;
  }

  templates(kind) {
    switch (kind) {
      case "cardStats":
        return `
<div class="card-details">
  <div>Turn: TURN</div>
  PLAY
  <div>Total Played: TOTAL</div>
    HAND
  BEHIND
</div>
`;
      case "card":
        return `<div class="card STATUS CATEGORY">
<img src="IMAGEURL" alt="The NAME card from Magic: The Gathering" />
<div>tmp to see background</div>
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
  const ids = Array(99).fill(`1x Youthful Valkyrie (fdn) 149 [Counters]`, 0);
  ids.push(`1x Giada, Font of Hope (fdn) 141 [Commander{top}]`);
  for (const cardIndex of cardIndexes) {
    ids[cardIndex] = "1x Plains (ecl) 269 [Land]";
  }
  return ids.join("\n");
}
