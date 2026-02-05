function debug(msg) {
  console.log(msg);
}

class Deck {
  constructor(data) {
    debug("Initializing deck.");
    this._data = data;
    this._data.changes = [];
    this.save();
  }

  activeCard() {
    if (this._data.activeCard) {
      return this._data.activeCard;
    } else {
      return null;
    }
  }

  addCardFilterChange(id, from, to) {
    this._data.changes.push({
      type: "cardFilterChange",
      from: from,
      id: id,
      index: this.cardIndex(id),
      to: to,
    });
    this.getCard(id).filter = to;
    debug(this._data.changes[this._data.changes.length - 1]);
    this.save();
  }

  cards() {
    return this._data.cards.map((card) => card.card.uid);
  }

  cardCategory(id) {
    return this.getCard(id).categories[0];
  }

  cardControls(id) {
    if (id === this.activeCard()) {
      return "visible";
    } else {
      return "hidden";
    }
  }

  cardQuantity(id) {
    return this.getCard(id).quantity;
  }

  cardFilter(id) {
    if (this.getCard(id).filter !== undefined) {
      return this.getCard(id).filter;
    } else {
      return 0;
    }
  }

  cardImage(id) {
    return `<img 
src="/images/large-cards/${id}.jpg"
alt="The ${this.cardName(id)} card from Magic: The Gathering" />`;
  }

  cardIndex(id) {
    return this.cardsInCategory(this.cardCategory(id))
      .map((cid, index) => {
        return { cid: cid, index: index };
      })
      .filter((card) => card.cid === id)[0].index;
  }

  cardIsVisible(id) {
    if (this.deckFilter() === -1) {
      if (this.cardFilter(id) === -1) {
        return true;
      } else {
        return false;
      }
    }
    if (this.cardFilter(id) >= this.deckFilter()) {
      return true;
    } else {
      return false;
    }
  }

  cardName(id) {
    return this.getCard(id).card.oracleCard.name;
  }

  cardPosition(id) {
    if (
      this.cardsInCategory(this.cardCategory(id)).indexOf(id) ===
        this.cardsInCategory(this.cardCategory(id)).length - 1
    ) {
      return "last";
    } else {
      return "not-last";
    }
  }

  cardsInCategory(category) {
    return this.cards().filter((id) => {
      if (this.cardCategory(id) === category) {
        return this.cardIsVisible(id);
      }
    }).sort((a, b) => {
      if (this.cardName(a) > this.cardName(b)) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  cardState(id) {
    if (this.activeCard() === id) {
      return "opened";
    } else if (
      this.activeCard() === null &&
      this.cardPosition(id) === "last"
    ) {
      return "opened";
    } else if (
      this.activeCard() !== null &&
      this.cardCategory(id) !== this.cardCategory(this.activeCard()) &&
      this.cardPosition(id) === "last"
    ) {
      return "opened";
    } else {
      return "closed";
    }
  }

  categories() {
    return this._data.categories
      .map((categoryObj) => {
        return categoryObj.name.replace(" ", "_");
      })
      .sort((a, b) => {
        return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
      })
      .filter((category) => {
        return this.cardsInCategory(category).length > 0;
      });
  }

  categoryCardQuantity(category) {
    if (this.deckFilter() === -1) {
      return "-";
    } else {
      return this.cards()
        .filter((id) => this.deckFilter() >= 0)
        .filter((id) => this.cardCategory(id) === category)
        .filter((id) => this.cardFilter(id) >= this.deckFilter())
        .map((id) => this.cardQuantity(id))
        .reduce((acc, cur) => acc + cur, 0);
    }
  }

  deckFilter() {
    if (!this._data.deckFilter) {
      return 0;
    } else {
      return this._data.deckFilter;
    }
  }

  deckSize() {
    if (this.deckFilter() === -1) {
      return "-";
    } else {
      return this.categories()
        .map((category) => this.categoryCardQuantity(category))
        .reduce((acc, cur) => acc + cur, 0);
    }
  }

  getCard(id) {
    return this._data.cards.find((card) => card.card.uid === id);
  }

  save() {
    localStorage.setItem("refinerDeck", JSON.stringify(this._data));
    debug("Saved deck to storage.");
  }

  setCardFilter(id, filter) {
    this._data.cards.forEach((card) => {
      if (id === card.card.uid) {
        if (card.filter !== filter) {
          this.addCardFilterChange(id, card.filter, filter);
        }
      }
    });
  }

  setDeckFilter(filter) {
    debug(`Set Deck Filter to ${filter}`);
    this._data.deckFilter = filter;
    this.save();
  }

  setActiveCard(id) {
    this._data.activeCard = id;
    debug(`Active card: ${id}`);
  }
}

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export class DeckRefiner {
  #deck;
  // TODO: Deprecate tmpHoldingURL when
  // you're calling the API directly.
  #tmpHoldingURL;

  async bittyReady() {
    this.api.trigger("await:loadDeck");
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
        this.api.makeHTML(this.api.template("change-deck-step-2"), subs),
      );
    }
  }

  // TODO: Deprecate in favor of calling API
  async changeDeckStep3(ev, el) {
    if (ev.type === "click") {
      await sleep(0.4);
      el.replaceChildren(
        this.api.makeHTML(this.api.template("change-deck-step-3")),
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
      this.api.makeHTML(this.api.template("change-deck-complete")),
    );
  }

  // closeHighlight(ev, __) {
  //   if (!ev.target.classList.contains("category-controls")) {
  //     this.setPositions(null, null);
  //   }
  // }

  cardsForCategory(category) {
    return this.#deck.cardsInCategory(category).map((id) => {
      return this.api.makeHTML(this.api.template("card"), [
        ["CARD_CATEGORY", this.#deck.cardCategory(id)],
        ["CARD_CONTROLS", this.#deck.cardControls(id)],
        ["CARD_QUANTITY", this.#deck.cardQuantity(id)],
        ["CARD_FILTER", this.#deck.cardFilter(id)],
        ["CARD_ID", id],
        ["CARD_IMAGE", this.#deck.cardImage(id)],
        ["CARD_INDEX", this.#deck.cardIndex(id)],
        ["CARD_STATE", this.#deck.cardState(id)],
        ["CARD_NAME", this.#deck.cardName(id)],
        ["CARD_POSITION", this.#deck.cardPosition(id)],
      ]);
    });
  }

  deck(_, el) {
    debug("Rendering deck");
    el.replaceChildren(
      ...this.#deck.categories()
        .map((category) => {
          return this.api.makeHTML(
            this.api.template("category"),
            [
              ["CATEGORY_NAME", category],
              [
                "CATEGORY_CARD_QUANTITY",
                this.#deck.categoryCardQuantity(category),
              ],
              ["CARDS_FOR_CATEGORY", this.cardsForCategory(category)],
            ],
          );
        }),
    );
    this.api.trigger("deckSize deckFilter");
  }

  deckFilter(_, el) {
    el.dataset.deckfilter = this.#deck.deckFilter();
  }

  deckSize(_, el) {
    el.innerHTML = this.#deck.deckSize();
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
    this.api.trigger("deck");
  }

  setCardFilter(ev, _) {
    if (ev.type === "click") {
      const df = this.#deck.deckFilter();
      const card = ev.prop("id");
      const oldCf = this.#deck.cardFilter(card);
      const newCf = ev.propToInt("cardfilter");
      if (newCf !== oldCf) {
        this.#deck.setCardFilter(card, newCf);
        if (df === -1) {
          this.api.trigger("deck");
        } else if (newCf < df) {
          this.api.trigger("deck");
        } else {
          ev.target.closest(".card-wrapper").dataset.cardfilter = newCf;
        }
      }
    }
  }

  setDeckFilter(ev, el) {
    if (ev.type === "click") {
      this.#deck.setDeckFilter(ev.propToInt("deckfilter"));
      this.api.trigger("deck");
    }
  }

  setActiveCard(ev, _) {
    this.#deck.setActiveCard(ev.prop("id"));
    this.api.trigger("showCard");
  }

  showCard(_, el) {
    el.dataset.state = this.#deck.cardState(el.prop("id"));
    el.dataset.controls = this.#deck.cardControls(el.prop("id"));

    // const evCategory = ev.target.closest(".card-wrapper").dataset.category;
    // const elCategory = el.closest(".card-wrapper").dataset.category;
    // if (ev.prop("id") === el.prop("id")) {
    //   el.dataset.state = "open";
    //   el.dataset.controls = "visible";
    // } else if (evCategory !== elCategory) {
    //   if (el.prop("position") === "last") {
    //     el.dataset.state = "open";
    //     el.dataset.controls = "hidden";
    //   } else {
    //     el.dataset.state = "closed";
    //     el.dataset.controls = "hidden";
    //   }
    // } else {
    //   el.dataset.state = "closed";
    //   el.dataset.controls = "hidden";
    // }

    //
  }
}
