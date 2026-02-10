import init, { Deck } from "/deck-refiner/wasm/mtg_site.js";

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

  #cardEls = {};

  async bittyReady() {
    this.api.trigger("await:loadData loadCardEls renderView");
  }

  loadCardEls() {
    console.log("Loading Card Elements");
    Deck.card_ids().forEach((id) => {
      const subs = [
        ["CARD_ID", id],
        ["CARD_NAME", Deck.card_name(id)],
      ];
      this.#cardEls[id] = this.api.makeElement(this.api.template("card"), subs);
    });
  }

  async loadData() {
    debug("Loading Data");
    await init();
    const t0 = performance.now();
    debug("Checking for a deck in storage.");
    const storage = localStorage.getItem("refinerDeck");
    if (storage !== null) {
      debug("Found a deck in storage.");
      Deck.load_json(storage);
    } else {
      const resp = await this.api.getTEXT(
        // `/deck-refiner/~support/example.json`,
        // `/deck-refiner/~support/big-deck.json`,
        `/deck-refiner/base-decks/yuriko-ninjas.json`,
      );
      if (resp.value) {
        debug("No deck in storage. Making a new one.");
        Deck.load_json(resp.value);
      }
    }
    const t1 = performance.now();
    const time = t1 - t0;
    console.log(`Load time: ${time}`);
  }

  async renderView(_, el) {
    el.replaceChildren(this.api.makeHTML(this.api.template(Deck.view())));
  }

  // activeFilter(_, el) {
  //   el.setProp("activefilter", Deck.active_filter());
  // }

  // closeHighlight(ev, __) {
  //   if (!ev.target.classList.contains("category-controls")) {
  //     this.setPositions(null, null);
  //   }
  // }

  // cardFilter(_, el) {
  //   el.setProp("cardfilter", Deck.card_filter(el.prop("id")));
  // }

  // cardFilterDisplay(_, el) {
  //   el.innerHTML = Deck.card_filter_display(el.prop("id"));
  // }

  // cardInOutMaybe(_, el) {
  //   el.innerHTML = Deck.card_in_out_maybe(el.prop("id"));
  // }

  // cardQuantity(_, el) {
  //   el.innerHTML = Deck.card_quantity(el.prop("id"));
  // }

  // cardState(_, el) {
  //   if (el.prop("id") === Deck.active_card()) {
  //     el.setProp("state", "active");
  //   } else if (Deck.card_category(el.prop("id")) === Deck.active_category()) {
  //     el.setProp("state", "closed");
  //   } else if (Deck.is_last_card_in_category(el.prop("id"))) {
  //     el.setProp("state", "opened");
  //   } else {
  //     el.setProp("state", "closed");
  //   }
  // }

  // cardsInCategory(category) {
  //   return Deck.cards_in_category(category).map((uid) => {
  //     return this.api.makeHTML(this.api.template("card"), [
  //       ["CARD_ID", uid],
  //       ["CARD_IMAGE_SRC", `/images/large-cards/${uid}.jpg`],
  //     ]);
  //   });
  // }

  // deck(_, el) {
  //   debug("Rendering deck");
  //   el.replaceChildren(
  //     ...Deck.categories()
  //       .map((category) => {
  //         const subs = [
  //           ["CATEGORY_NAME", category],
  //           ["CARDS_IN_CATEGORY", this.cardsInCategory(category)],
  //         ];
  //         return this.api.makeHTML(this.api.template("category"), subs);
  //       }),
  //   );
  //   this.api.trigger("updateCards");
  // }

  // decrementQuantity(ev, _) {
  //   if (ev.type === "click") {
  //     Deck.decrement_quantity(ev.prop("id"));
  //     this.api.trigger("cardQuantity");
  //   }
  // }

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

  // highlightCard(ev, _) {
  //   if (ev.type === "mouseover") {
  //     Deck.set_active_card(ev.prop("id"));
  //     this.api.trigger("cardState");
  //   }
  // }

  // incrementQuantity(ev, _) {
  //   if (ev.type === "click") {
  //     Deck.increment_quantity(ev.prop("id"));
  //     this.api.trigger("cardQuantity");
  //   }
  // }

  // saveDeck() {
  //   console.log("Saving Deck");
  //   localStorage.setItem("refinerDeck", Deck.output_json_storage());
  // }

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

  // setCardFilter(ev, _) {
  //   if (ev.type === "click") {
  //     console.log("here1");
  //     Deck.set_card_filter(ev.prop("id"), ev.prop("cardfilter"));
  //     this.saveDeck();
  //     this.updateCards();
  //     //   const df = this.#deck.deckFilter();
  //     //   const card = ev.prop("id");
  //     //   const oldCf = this.#deck.cardFilter(card);
  //     //   const newCf = ev.propToInt("cardfilter");
  //     //   if (newCf !== oldCf) {
  //     //     this.#deck.setCardFilter(card, newCf);
  //     //     if (df === -1) {
  //     //       this.api.trigger("deck");
  //     //     } else if (newCf < df) {
  //     //       this.api.trigger("deck");
  //     //     } else {
  //     //       ev.target.closest(".card-wrapper").dataset.cardfilter = newCf;
  //     //     }
  //     //   }
  //   }
  // }

  // setActiveFilter(ev, el) {
  //   if (ev.type === "click") {
  //     Deck.set_active_filter(ev.propToInt("filter"));
  //     this.api.trigger("deck");
  //     this.saveDeck();
  //   }
  // }

  // showCard(_, el) {
  //   //
  //   // const t0 = performance.now();
  //   // if (el) {
  //   //   const id = el.prop("id");
  //   //   const ds = el.dataset;
  //   //   ds.cardfilter = this.#deck.cardFilter(id);
  //   //   ds.controls = this.#deck.cardControls(id);
  //   //   ds.index = this.#deck.cardIndex(id);
  //   //   ds.state = this.#deck.cardState(id);
  //   // }
  //   // const t1 = performance.now();
  //   // const time = t1 - t0;
  //   // console.log(`showCard time ${time}`);
  //   // const evCategory = ev.target.closest(".card-wrapper").dataset.category;
  //   // const elCategory = el.closest(".card-wrapper").dataset.category;
  //   // if (ev.prop("id") === el.prop("id")) {
  //   //   el.dataset.state = "open";
  //   //   el.dataset.controls = "visible";
  //   // } else if (evCategory !== elCategory) {
  //   //   if (el.prop("position") === "last") {
  //   //     el.dataset.state = "open";
  //   //     el.dataset.controls = "hidden";
  //   //   } else {
  //   //     el.dataset.state = "closed";
  //   //     el.dataset.controls = "hidden";
  //   //   }
  //   // } else {
  //   //   el.dataset.state = "closed";
  //   //   el.dataset.controls = "hidden";
  //   // }
  // }

  // updateCards() {
  //   this.api.trigger(
  //     "cardInOutMaybe cardQuantity cardState cardFilter cardFilterDisplay",
  //   );
  // }

  // // TODO: Deprecate in favor of calling API
  // changeDeckURL(ev, el) {
  //   if (ev.type === "input") {
  //     if (ev.value !== "") {
  //       debug(`Switched hoding URL to: ${ev.value}`);
  //       this.#tmpHoldingURL = ev.value;
  //       this.api.trigger("changeDeckStep2");
  //     }
  //   }
  // }

  // // TODO: Deprecate in favor of calling API
  // async changeDeckStep2(_, el) {
  //   await sleep(0.4);
  //   const parts = this.#tmpHoldingURL.split("/");
  //   if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //     const subs = [
  //       ["ID", parts[4]],
  //     ];
  //     el.replaceChildren(
  //       this.api.makeHTML(this.api.template("change-deck-step-2"), subs),
  //     );
  //   }
  // }

  // // TODO: Deprecate in favor of calling API
  // async changeDeckStep3(ev, el) {
  //   if (ev.type === "click") {
  //     await sleep(0.4);
  //     el.replaceChildren(
  //       this.api.makeHTML(this.api.template("change-deck-step-3")),
  //     );
  //   }
  // }

  //
}
