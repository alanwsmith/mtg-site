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
    debug("Initializing deck.");
    this._data = data;
    this._cards = this.initCards();
    this.save();
  }

  cards() {
    return this._cards.sort((a, b) => {
      return a.name() > b.name() ? 1 : -1;
    });
  }

  categories() {
    return this._data.categories
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

  // downloadCommands() is for pulling images for local dev
  // so you can work offline and without constantly
  // hitting the network
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

  deckFilter() {
    if (!this._data.deckFilter) {
      return 0;
    } else {
      return this._data.deckFilter;
    }
  }

  cardFilter(id) {
    if (this.getCard(id).filter) {
      return this.getCard(id).filter;
    } else {
      return 0;
    }
  }

  getCard(id) {
    return this._data.cards.find((card) => card.card.uid === id);
  }

  initCards() {
    return this._data.cards
      .map((card) => new Card(card));
  }

  save() {
    localStorage.setItem("refinerDeck", JSON.stringify(this._data));
    debug("Saved deck to storage.");
  }

  setCardFilter(id, filter) {
    this._data.cards.forEach((card) => {
      if (id === card.card.uid) {
        if (card.filter === filter) {
          debug(`Set card filter to 0 for ${id}`);
          card.filter = 0;
        } else {
          debug(`Set card filter to ${filter} for ${id}`);
          card.filter = filter;
        }
      }
    });
    this.save();
  }

  setDeckFilter(filter) {
    debug(`Set Deck Filter to ${filter}`);
    this._data.deckFilter = filter;
    this.save();
  }
}

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export class DeckRefiner {
  #activeCardId;
  #deck;
  #templates = {};
  #tmpHoldingURL;

  async bittyInit() {
    await this.loadTemplates();
  }

  bittyReady() {
    this.api.trigger("initPage");
  }

  // TODO: Deprecate in favor of calling API
  changeDeckURL(ev, el) {
    if (ev.type === "input") {
      if (ev.value !== "") {
        debug(`Switched hoding URL to: ${ev.value}`);
        this.#tmpHoldingURL = ev.value;
        this.api.trigger("changeDeckStep2");
      }
    }
  }

  // TODO: Deprecate in favor of calling API
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

  // TODO: Deprecate in favor of calling API
  async changeDeckStep3(ev, el) {
    if (ev.type === "click") {
      await sleep(0.4);
      el.replaceChildren(
        this.api.makeHTML(this.#templates["change-deck-step-3"]),
      );
    }
  }

  // TODO: Deprecate in favor of calling API
  async changeDeckStep4(ev, el) {
    if (ev.type === "input" && ev.value !== "") {
      await sleep(0.4);
      try {
        debug("Loading new deck.");
        this.#deck = new Deck(JSON.parse(ev.value));
        this.api.trigger("changeDeckComplete deck");
      } catch (error) {
        console.log(error);
      }
    }
  }

  // TODO: Deprecate in favor of calling API
  async changeDeckComplete(_, el) {
    await sleep(0.4);
    el.replaceChildren(
      this.api.makeHTML(this.#templates["change-deck-complete"]),
    );
  }

  // closeHighlight(ev, __) {
  //   if (!ev.target.classList.contains("category-controls")) {
  //     this.setPositions(null, null);
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
    // this.setPositions(null, null);
    this.api.trigger("deckFilterButton deckFilterWrapper");
  }

  highlightDeckFilterButton(_, el) {
    if (el.propToInt("filter") === this.#deck.deckFilter()) {
      el.classList.add("active-deck-filter");
    } else {
      el.classList.remove("active-deck-filter");
    }
  }

  // deckFilterWrapper(_, el) {
  //   el.dataset.filter = this.#deck.deckFilter();
  // }

  highlightDeckFilter(_, el) {
  }

  initPage() {
    this.api.trigger(
      `await:loadDeck deck updateCardFilterButton highlightDeckFilterButton`,
    );
  }

  async loadDeck() {
    debug("Checking for a deck in storage.");
    const storage = localStorage.getItem("refinerDeck");
    if (storage !== null) {
      debug("Found a deck in storage.");
      this.#deck = new Deck(JSON.parse(storage));
    } else {
      const resp = await this.api.getJSON(
        `/deck-refiner/~support/example.json`,
      );
      if (resp.value) {
        debug("No deck in storage. Making a new one.");
        this.#deck = new Deck(resp.value);
      }
    }
  }

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

  setCardFilter(ev, _) {
    if (ev.type === "click") {
      this.#deck.setCardFilter(ev.prop("id"), ev.propToInt("filter"));
      this.api.trigger("updateCardFilterButton");
    }
  }

  setDeckFilter(ev, el) {
    if (ev.type === "click") {
      this.#deck.setDeckFilter(ev.propToInt("filter"));
      this.api.trigger("highlightDeckFilterButton updateDeckFilter");
    }
  }

  showCard(ev, el) {
    if (ev.prop("id") === el.prop("id")) {
      el.classList.add("active-card");
      el.classList.remove("inactive-card");
    } else {
      el.classList.add("inactive-card");
      el.classList.remove("active-card");
    }
    // if (ev.target.dataset.id === el.dataset.id) {
    //   console.log(el);
    // }
    // this.setPositions(
    //   ev.target.closest(".category-wrapper").dataset.category,
    //   ev.prop("id"),
    // );
  }

  updateCardFilterButton(_, el) {
    if (this.#deck.cardFilter(el.prop("id")) === el.propToInt("filter")) {
      el.classList.add("active-card-filter-button");
    } else {
      el.classList.remove("active-card-filter-button");
    }
  }

  updateDeckFilter(_, el) {
    console.log(el);
  }

  // setCardFilter(ev, el) {
  //   if (ev.type === "click") {
  //     // console.log(ev);
  //     this.#deck.setCardFilter(
  //       ev.prop("id"),
  //       ev.propToInt("filter"),
  //     );
  //     // this.api.trigger("updateCardFilter");
  //   }
  // }

  // setPositions(activeCategory, cardId) {
  //   //  this.#deck.categories().forEach((category) => {
  //   //    const cardWrappers = document.querySelectorAll(
  //   //      `[data-category=${category}] .card-wrapper`,
  //   //    );
  //   //    const controls = document.querySelector(
  //   //      `[data-category=${category}] .category-controls`,
  //   //    );
  //   //    cardWrappers.forEach((cardWrapper, cardWrapperIndex) => {
  //   //      if (activeCategory === category) {
  //   //        controls.style.visibility = "visible";
  //   //        if (cardId === cardWrapper.dataset.id) {
  //   //          controls.style.top = `${cardWrapper.offsetTop}px`;
  //   //          cardWrapper.classList.add("open-card");
  //   //          cardWrapper.classList.add("bordered-card");
  //   //          //this.#activeCardId = cardId;
  //   //          //this.api.trigger("updateControlButtons");
  //   //        } else {
  //   //          cardWrapper.classList.remove("open-card");
  //   //          cardWrapper.classList.remove("bordered-card");
  //   //        }
  //   //      } else {
  //   //        controls.style.visibility = "hidden";
  //   //        if (cardWrapperIndex === cardWrappers.length - 1) {
  //   //          cardWrapper.classList.add("open-card");
  //   //          cardWrapper.classList.remove("bordered-card");
  //   //        } else {
  //   //          cardWrapper.classList.remove("open-card");
  //   //          cardWrapper.classList.remove("bordered-card");
  //   //        }
  //   //      }
  //   //    });
  //   //  });
  // }

  // updateCardFilter(_, el) {
  //   console.log(el);
  //   el.dataset.filter = this.#deck.cardFilter(
  //     el.prop("id"),
  //   );
  // }

  //updateControlButtons(_, el) {
  //  el.dataset.id = this.#activeCardId;
  //  // console.log(el.propToInt("filter"));
  //  //console.log(this.#deck.cardFilter(this.#activeCardId));
  //  if (el.propToInt("filter") === this.#deck.cardFilter(this.#activeCardId)) {
  //    el.classList.add("current-card-filter");
  //    //console.log("x");
  //  } else {
  //    el.classList.remove("current-card-filter");
  //    //console.log("y");
  //  }
  //}

  /*
  debugImageDownloadCommands(_, el) {
    console.log("Output debug image download script");
    if (el) {
      el.value = `#!/bin/bash\n\n${this.#deck.downloadCommands()}`;
    }
  }
  */
}
