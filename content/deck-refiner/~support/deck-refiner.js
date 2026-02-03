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
    return this._data.cards
      .map((card) => new Card(card));
  }
}

export class DeckRefiner {
  #deck;
  #highlightId;
  #state;
  #templates = {};

  async bittyInit() {
    await this.loadTemplates();
  }

  bittyReady() {
    this.api.trigger("initPage");
  }

  // apiURL(_, el) {
  //   const template =
  //     `<a target="_blank" href="https://archidekt.com/api/decks/ID/">https://archidekt.com/api/decks/ID/</a>`;
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

  //  //https://archidekt.com/decks/19596185/refider_example
  //  const template = `<p>Click this link and copy the data from it:</p>
  //<p><a target="_blank" href="https://archidekt.com/api/decks/ID/">https://archidekt.com/api/decks/ID/</a></p>`;
  //  if (ev.value !== "") {
  //    const parts = ev.value.split("/");
  //    if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //      const subs = [
  //        ["ID", parts[4]],
  //      ];
  //      el.replaceChildren(this.api.makeHTML(template, subs));
  //    }
  //  }
  //}

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

  deckURL(ev, el) {
    if (ev.type === "input") {
      this.#state.deckURL = ev.value;
      this.saveState();
    } else {
      el.value = this.#state.deckURL;
    }
    this.api.trigger("jsonLink");
  }

  filter(ev, el) {
    if (ev.type === "click") {
      this.#state.filter = ev.prop("filter");
      this.saveState();
    }
    if (el.prop("filter") === this.#state.filter) {
      el.classList.add("active-filter");
    } else {
      el.classList.remove("active-filter");
    }
  }

  /*
  hideHighlight(_, __) {
    document.documentElement.style.setProperty(
      "--highlight-visibility",
      `hidden`,
    );
    this.#highlightId = null;
  }
  */

  initPage(ev, _) {
    if (!ev || ev.type !== "mouseover") {
      this.api.trigger(`
loadState 
deckURL
filter`);
    }
  }

  async initState() {
    this.#state = {
      filter: "base",
      deckURL: "https://archidekt.com/decks/19596185/refiner_example",
    };
    const resp = await this.api.getJSON(`/deck-refiner/~support/example.json`);
    if (resp.value) {
      this.#state.json = resp.value;
    } else {
      console.log(resp.error);
    }
    this.saveState();
  }

  jsonLink(_, el) {
    const template =
      `<a class="link-button" target="_blank" href="https://archidekt.com/api/decks/ID/">
Click this to open Archidekt data for the deck in a new tab</a>`;
    const parts = this.#state.deckURL.split("/");
    const subs = [
      ["ID", parts[4]],
    ];
    if (parts[2] === "archidekt.com" && parts[3] === "decks") {
      const subs = [
        ["ID", parts[4]],
      ];
      el.replaceChildren(this.api.makeHTML(template, subs));
    } else {
      el.replaceChildren(this.api.makeHTML(
        `<p>Invalid Archidekt address. It should look like:</p><p>https://archidekt.com/api/decks/19596185/</p>`,
      ));
    }

    //el.replaceChildren(this.api.makeHTML("asdf"));
  }

  // async loadJSON(_, el) {
  //   const resp = await this.api.getJSON("/deck-refiner/~support/example.json");
  //   // const resp = await this.api.getJSON("/deck-refiner/~support/big-deck.json");
  //   if (resp.value) {
  //     this.#deck = new Deck(resp.value);
  //     el.value = JSON.stringify(resp.value);
  //     this.api.trigger("deck imageDownloadCommands");
  //   } else {
  //     console.log(resp.error);
  //   }
  // }

  async loadState(_, __) {
    const loader = localStorage.getItem("deckState");
    if (loader !== null) {
      this.#state = JSON.parse(loader);
    } else {
      await this.initState();
    }
  }

  async loadTemplates() {
    for (const key of ["card", "category"]) {
      const url = `/deck-refiner/templates/${key}/`;
      const resp = await this.api.getTXT(url);
      if (resp.value) {
        this.#templates[key] = resp.value;
      } else {
        console.error(resp.error);
      }
    }
  }

  // openJSON(ev, _) {
  //   //   const template =
  //   //     `<a target="_blank" href="https://archidekt.com/api/decks/ID/">https://archidekt.com/api/decks/ID/</a>`;
  //   if (ev.type === "click") {
  //     const parts = this.#state.deckURL.split("/");
  //     if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //       const url = `https://archidekt.com/api/decks/${parts[4]}/`;
  //       window.open(url, "_blank");
  //     }
  //     //     const subs = [
  //     //       ["ID", parts[4]],
  //     //     ];
  //     //     el.replaceChildren(this.api.makeHTML(template, subs));
  //     //   } else {
  //     //     el.replaceChildren(this.api.makeHTML(
  //     //       `<p>Invalid Archidekt address. It should look like:</p><p>https://archidekt.com/api/decks/19596185/</p>`,
  //     //     ));
  //     //   }
  //     // }
  //     // const subs = [
  //     //   ["ID", parts[4]],
  //     // ];
  //     console.log("asdf");
  //   }
  // }

  saveState() {
    localStorage.setItem("deckState", JSON.stringify(this.#state));
  }

  // setFilter(ev, el) {
  //   if (ev.type === "click") {
  //     this.#state.filter = ev.prop("filter");
  //     this.api.trigger("highlightFilter");
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

  showCard(ev, el) {
    this.setPositions(
      ev.target.closest(".category-wrapper").dataset.category,
      ev.prop("id"),
    );
  }

  //sourceDeckURL(ev, el) {
  //  //https://archidekt.com/decks/19596185/refider_example
  //  const template = `<p>Click this link and copy the data from it:</p>
  //<p><a target="_blank" href="https://archidekt.com/api/decks/ID/">https://archidekt.com/api/decks/ID/</a></p>`;
  //  if (ev.value !== "") {
  //    const parts = ev.value.split("/");
  //    if (parts[2] === "archidekt.com" && parts[3] === "decks") {
  //      const subs = [
  //        ["ID", parts[4]],
  //      ];
  //      el.replaceChildren(this.api.makeHTML(template, subs));
  //    }
  //  }
  //}

  /*
  debugImageDownloadCommands(_, el) {
    if (el) {
      el.value = `#!/bin/bash

${this.#deck.downloadCommands()}`;
    }
  }
  */
}
