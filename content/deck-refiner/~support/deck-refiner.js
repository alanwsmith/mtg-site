function debug(msg) {
  console.log(msg);
}

class Card {
  constructor(data) {
    this._data = data;
  }

  category() {
    return this._data.categories[0];
  }

  charNum(num) {
    return this.id().substring(num - 1, num);
  }

  hash() {
    return this._data.card.scryfallImageHash;
  }

  id() {
    return this._data.card.uid;
  }

  name() {
    return this._data.card.oracleCard.name;
  }

  scryfallImageHash() {
    return this._data.card.scryfallImageHash;
  }

  subs() {
    return [
      ["CHAR1", this.charNum(1)],
      ["CHAR2", this.charNum(2)],
      ["HASH", this.hash()],
      ["ID", this.id()],
      ["NAME", this.name()],
    ];
  }
}

class Deck {
  constructor(data) {
    this._data = data;
    this._cards = this.initCards();
  }

  cards() {
    return this._cards.sort((a, b) => {
      return a.name() > b.name() ? 1 : -1;
    });
  }

  categories() {
    return this._data.json.categories
      .map((categoryObj) => {
        return categoryObj.name.replace(" ", "_");
      })
      .filter((category) => {
        return this.categoryCards(category).length > 0;
      })
      .sort((a, b) => {
        return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
      });
  }

  categoryCards(category) {
    return this.cards().filter((card) => {
      return card.category() === category;
    });
  }

  categorySubs(category) {
    return [
      ["CATEGORY_NAME", category],
      ["CARDS_IN_CATEGORY", this.categoryCards(category).length],
    ];
  }

  downloadCommands() {
    return this.cards()
      .map((card) => {
        const url = [
          "https://cards.scryfall.io/large/front/",
          card.charNum(1),
          "/",
          card.charNum(2),
          "/",
          card.id(),
          `.jpg`,
        ].join("");
        return `[ ! -f "${card.id()}.jpg" ] && wget ${url} && sleep 1`;
      }).join("\n");
  }

  initCards() {
    //console.log(this._data.json);
    return this._data.json.cards
      .map((card) => new Card(card));
  }

  save() {
    localStorage.setItem("refinerDeck", JSON.stringify(this._data));
    debug("Saved deck to storage.");
  }
}

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export class DeckRefiner {
  #deck;
  #templates = {};
  #tmpHoldingURL;

  async bittyInit() {
    await this.loadTemplates();
  }

  bittyReady() {
    this.api.trigger("initPage");
  }

  // clearExistingJSON(ev, el) {
  //   if (ev.type === "click") {
  //     this.debug("Clearing existing JSON");
  //     el.value = "";
  //   }
  // }

  changeDeckURL(ev, el) {
    if (ev.type === "input") {
      if (ev.value !== "") {
        debug(`Switched hoding URL to: ${ev.value}`);
        this.#tmpHoldingURL = ev.value;
        this.api.trigger("changeDeckStep2");
      }
    }
  }

  async changeDeckStep2(_, el) {
    await sleep(0.4);
    const parts = this.#tmpHoldingURL.split("/");
    if (parts[2] === "archidekt.com" && parts[3] === "decks") {
      const subs = [
        ["ID", parts[4]],
      ];
      el.replaceChildren(
        this.api.makeHTML(this.#templates["change-deck-step-2"], subs),
      );
    }
  }

  async changeDeckStep3(ev, el) {
    if (ev.type === "click") {
      await sleep(0.4);
      el.replaceChildren(
        this.api.makeHTML(this.#templates["change-deck-step-3"]),
      );
    }
  }

  async changeDeckStep4(ev, el) {
    if (ev.type === "input" && ev.value !== "") {
      await sleep(0.4);
      try {
        this.#deck = new Deck(
          {
            json: JSON.parse(ev.value),
            tweaks: {},
          },
        );
        debug("Loaded new deck.");
        this.#deck.save();
        this.api.trigger("changeDeckComplete deck");
      } catch (error) {
        console.log(error);
      }
    }
  }

  async changeDeckComplete(_, el) {
    await sleep(0.4);
    el.replaceChildren(
      this.api.makeHTML(this.#templates["change-deck-complete"]),
    );
  }

  // jsonLink(_, el) {
  //   const template =
  //     `<a class="link-button" target="_blank" href="https://archidekt.com/api/decks/ID/">
  // Click this to open Archidekt data for the deck in a new tab</a>`;
  //   const parts = this.#state.deckURL.split("/");
  //   const subs = [
  //     ["ID", parts[4]],
  //   ];
  //   if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //     const subs = [
  //       ["ID", parts[4]],
  //     ];
  //     el.replaceChildren(this.api.makeHTML(template, subs));
  //   } else {
  //     el.replaceChildren(this.api.makeHTML(
  //       `<p>Invalid Archidekt address. It should look like:</p><p>https://archidekt.com/api/decks/19596185/</p>`,
  //     ));
  //   }
  // }

  deck(_, el) {
    el.replaceChildren(
      ...this.#deck.categories()
        .map((category) => {
          const subs = this.#deck.categorySubs(category).concat(
            [
              [
                "CATEGORY_CARDS",
                this.#deck.categoryCards(category).map((card) =>
                  this.api.makeHTML(this.#templates.card, card.subs())
                ),
              ],
            ],
          );
          return this.api.makeHTML(
            this.#templates.category,
            subs,
          );
        }),
    );
    this.setPositions(null, null);
  }

  // deckURL(ev, el) {
  //   /*
  //   if (ev.type === "input") {
  //     this.#state.deckURL = ev.value;
  //     this.saveState();
  //   } else {
  //     el.value = this.#state.deckURL;
  //   }
  //   this.api.trigger("jsonLink");
  //   */
  // }

  // exampleJSON(_, el) {
  //   el.value = JSON.stringify(this.#state.json, null, 2);
  // }

  // filter(ev, el) {
  //   if (ev.type === "click") {
  //     this.#state.filter = ev.prop("filter");
  //     this.saveState();
  //   }
  //   if (el.prop("filter") === this.#state.filter) {
  //     el.classList.add("active-filter");
  //   } else {
  //     el.classList.remove("active-filter");
  //   }
  // }

  // initJSON(_, el) {
  //   el.value = JSON.stringify(this.#state.json);
  // }

  // initPage(ev, _) {
  //   if (!ev || ev.type !== "mouseover") {
  //     this.api.trigger(`
  // loadState
  //
  // deckURL
  // initJSON
  // filter
  // deck
  // `);
  //   }
  // }

  initPage() {
    this.api.trigger(`
await:loadDeck
deck
`);
  }

  // async initState(ev, _) {
  //   if (!ev || ev.type === "click") {
  //     this.#state = {
  //       filter: "base",
  //       deckURL: "https://archidekt.com/decks/19596185/refiner_example",
  //     };
  //     const resp = await this.api.getJSON(
  //       `/deck-refiner/~support/example.json`,
  //     );
  //     if (resp.value) {
  //       this.#state.json = resp.value;
  //     } else {
  //       console.log(resp.error);
  //     }
  //     this.saveState();
  //     console.log("Reinitialized state");
  //   }
  // }

  // jsonLink(_, el) {
  //   const template =
  //     `<a class="link-button" target="_blank" href="https://archidekt.com/api/decks/ID/">
  // Click this to open Archidekt data for the deck in a new tab</a>`;
  //   const parts = this.#state.deckURL.split("/");
  //   const subs = [
  //     ["ID", parts[4]],
  //   ];
  //   if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //     const subs = [
  //       ["ID", parts[4]],
  //     ];
  //     el.replaceChildren(this.api.makeHTML(template, subs));
  //   } else {
  //     el.replaceChildren(this.api.makeHTML(
  //       `<p>Invalid Archidekt address. It should look like:</p><p>https://archidekt.com/api/decks/19596185/</p>`,
  //     ));
  //   }
  // }

  async loadDeck() {
    debug("Checking for a deck in storage.");
    const storage = localStorage.getItem("refinerDeck");
    if (storage !== null) {
      this.#deck = new Deck(JSON.parse(storage));
      debug("Found a deck in storage and loaded it.");
    } else {
      const resp = await this.api.getJSON(
        `/deck-refiner/~support/example.json`,
      );
      if (resp.value) {
        debug("No deck in storage. Making a new one.");
        this.#deck = new Deck({
          tweaks: {},
          json: resp.value,
        });
        this.#deck.save();
      }
    }
  }

  // async loadState(_, __) {
  //   const loader = localStorage.getItem("deckState");
  //   if (loader !== null) {
  //     this.#state = JSON.parse(loader);
  //     console.log("Loaded state from localStorage");
  //   } else {
  //     await this.initState();
  //   }
  //   this.#deck = new Deck(this.#state.json);
  //   this.api.trigger("debugImageDownloadCommands");
  // }

  async loadTemplates() {
    for (
      const key of [
        "card",
        "category",
        "change-deck-step-2",
        "change-deck-step-3",
        "change-deck-complete",
      ]
    ) {
      const url = `/deck-refiner/templates/${key}/`;
      const resp = await this.api.getTXT(url);
      if (resp.value) {
        this.#templates[key] = resp.value;
      } else {
        console.error(resp.error);
      }
    }
  }

  // saveState() {
  //   localStorage.setItem("deckState", JSON.stringify(this.#state));
  //   this.debug("Saved State");
  // }

  // setJSON(ev, _) {
  //   if (ev.type === "input") {
  //     if (ev.value !== "") {
  //       try {
  //         this.#state.json = JSON.parse(ev.value);
  //         this.saveState();
  //         this.#deck = new Deck(this.#state.json);
  //         this.api.trigger("deck");
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     }
  //   }
  // }

  setPositions(activeCategory, cardId) {
    this.#deck.categories().forEach((category) => {
      const cardWrappers = document.querySelectorAll(
        `[data-category=${category}] .card-wrapper`,
      );
      const controls = document.querySelector(
        `[data-category=${category}] .category-controls`,
      );
      cardWrappers.forEach((cardWrapper, cardWrapperIndex) => {
        if (activeCategory === category) {
          controls.style.visibility = "visible";
          if (cardId === cardWrapper.dataset.id) {
            controls.style.top = `${cardWrapper.offsetTop}px`;
            cardWrapper.classList.add("open-card");
            cardWrapper.classList.add("bordered-card");
          } else {
            cardWrapper.classList.remove("open-card");
            cardWrapper.classList.remove("bordered-card");
          }
        } else {
          controls.style.visibility = "hidden";
          if (cardWrapperIndex === cardWrappers.length - 1) {
            cardWrapper.classList.add("open-card");
            cardWrapper.classList.remove("bordered-card");
          } else {
            cardWrapper.classList.remove("open-card");
            cardWrapper.classList.remove("bordered-card");
          }
        }
      });
    });
  }

  // showCard(ev, el) {
  //   this.setPositions(
  //     ev.target.closest(".category-wrapper").dataset.category,
  //     ev.prop("id"),
  //   );
  // }

  /*
  debugImageDownloadCommands(_, el) {
    console.log("Output debug image download script");
    if (el) {
      el.value = `#!/bin/bash\n\n${this.#deck.downloadCommands()}`;
    }
  }
  */
}
