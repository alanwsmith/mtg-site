import init, { Deck } from "/deck-refiner/~support/mtg_site.js";

function debug(msg) {
  console.log(msg);
}
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export class DeckRefiner {
  // #deck;
  // TODO: Deprecate tmpHoldingURL when
  // you're calling the API directly.
  #tmpHoldingURL;

  async bittyReady() {
    this.api.trigger("await:loadDeck");
  }

  activeFilter(_, el) {
    el.dataset.activefilter = Deck.active_filter();
  }

  // closeHighlight(ev, __) {
  //   if (!ev.target.classList.contains("category-controls")) {
  //     this.setPositions(null, null);
  //   }
  // }

  cardInOutMaybe(_, el) {
    el.innerHTML = Deck.card_in_out_maybe(this.idFor(el));
  }

  cardQuantity(_, el) {
    el.innerHTML = Deck.card_quantity(this.idFor(el));
  }

  cardsInCategory(category) {
    return Deck.cards_in_category(category).map((uid) => {
      return this.api.makeHTML(this.api.template("card"), [
        ["CARD_ID", uid],
        ["CARD_IMAGE_SRC", `/images/large-cards/${uid}.jpg`],
      ]);
    });
  }

  deck(_, el) {
    debug("Rendering deck");
    el.replaceChildren(
      ...Deck.categories()
        .map((category) => {
          const subs = [
            ["CATEGORY_NAME", category],
            ["CARDS_IN_CATEGORY", this.cardsInCategory(category)],
          ];
          return this.api.makeHTML(this.api.template("category"), subs);
        }),
    );
  }

  /*
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
    this.api.trigger("deckSize deckFilter showCard");
    */

  // deckSize(_, el) {
  //   el.innerHTML = this.#deck.deckSize();
  // }

  idFor(el) {
    return el.closest(".card-wrapper").dataset.id;
  }

  async loadDeck() {
    const t0 = performance.now();
    debug("Checking for a deck in storage.");
    const storage = localStorage.getItem("refinerDeck");
    if (storage !== null) {
      debug("Found a deck in storage.");
      await init();
      Deck.load_json(storage);
      // console.log(Deck.categories());
      // console.log(JSON.parse(storage));
      //  this.#deck = new Deck(JSON.parse(storage));
    } else {
      // TODO: GET EXAMPLE DECK IF THERE'S
      // NOT ONE IN STORAGE

      //const resp = await this.api.getJSON(
      //  `/deck-refiner/~support/example.json`,
      //);
      //if (resp.value) {
      //  debug("No deck in storage. Making a new one.");
      //  //this.#deck = new Deck(resp.value);
      //}
    }
    this.api.trigger("activeFilter deck updateCards");
    const t1 = performance.now();
    const time = t1 - t0;
    console.log(`Load time: ${time}`);
  }

  //   const storage = localStorage.getItem("refinerDeck");
  //   if (storage !== null) {
  //     debug("Found a deck in storage.");
  //     this.#deck = new Deck(JSON.parse(storage));
  //   } else {
  //     const resp = await this.api.getJSON(
  //       `/deck-refiner/~support/example.json`,
  //     );
  //     if (resp.value) {
  //       debug("No deck in storage. Making a new one.");
  //       this.#deck = new Deck(resp.value);
  //     }
  //   }

  setCardFilter(ev, _) {
    // if (ev.type === "click") {
    //   const df = this.#deck.deckFilter();
    //   const card = ev.prop("id");
    //   const oldCf = this.#deck.cardFilter(card);
    //   const newCf = ev.propToInt("cardfilter");
    //   if (newCf !== oldCf) {
    //     this.#deck.setCardFilter(card, newCf);
    //     if (df === -1) {
    //       this.api.trigger("deck");
    //     } else if (newCf < df) {
    //       this.api.trigger("deck");
    //     } else {
    //       ev.target.closest(".card-wrapper").dataset.cardfilter = newCf;
    //     }
    //   }
    // }
  }

  setActiveFilter(ev, el) {
    if (ev.type === "click") {
      Deck.set_active_filter(ev.propToInt("deckfilter"));
      this.api.trigger("activeFilter");
    }
  }

  // setActiveCard(ev, _) {
  //   this.#deck.setActiveCard(ev.prop("id"));
  //   this.api.trigger("showCard");
  // }

  showCard(_, el) {
    //

    // const t0 = performance.now();
    // if (el) {
    //   const id = el.prop("id");
    //   const ds = el.dataset;
    //   ds.cardfilter = this.#deck.cardFilter(id);
    //   ds.controls = this.#deck.cardControls(id);
    //   ds.index = this.#deck.cardIndex(id);
    //   ds.state = this.#deck.cardState(id);
    // }
    // const t1 = performance.now();
    // const time = t1 - t0;
    // console.log(`showCard time ${time}`);

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
  }

  updateCards() {
    this.api.trigger("cardInOutMaybe cardQuantity");
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

  cardsForCategory(category) {
    // return this.#deck.cardsInCategory(category).map((id) => {
    //   return this.api.makeHTML(this.api.template("card"), [
    //     ["CARD_CATEGORY", this.#deck.cardCategory(id)],
    //     ["CARD_QUANTITY", this.#deck.cardQuantity(id)],
    //     ["CARD_ID", id],
    //     ["CARD_NAME", this.#deck.cardName(id)],
    //     ["CARD_POSITION", this.#deck.cardPosition(id)],
    //     ["CARD_IMAGE", this.#deck.cardImage(id)],
    //   ]);
    // });
  }
}
