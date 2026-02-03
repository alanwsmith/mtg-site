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
  #templates = {};

  async bittyInit() {
    await this.loadTemplates();
  }

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

  /*
  hideHighlight(_, __) {
    document.documentElement.style.setProperty(
      "--highlight-visibility",
      `hidden`,
    );
    this.#highlightId = null;
  }
  */

  /*
  imageDownloadCommands(_, el) {
    if (el) {
      el.value = `#!/bin/bash

${this.#deck.downloadCommands()}`;
    }
  }
  */

  async loadJSON(_, el) {
    const resp = await this.api.getJSON("/deck-refiner/~support/example.json");
    // const resp = await this.api.getJSON("/deck-refiner/~support/big-deck.json");
    if (resp.value) {
      this.#deck = new Deck(resp.value);
      el.value = JSON.stringify(resp.value);
      this.api.trigger("deck imageDownloadCommands");
    } else {
      console.log(resp.error);
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

  setFilter(ev, _) {
    if (ev.type === "click") {
      console.log(`setFilter ${ev.prop("filter")}`);
    }
  }

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

  sourceDeckURL(ev, el) {
    //https://archidekt.com/decks/19596185/refider_example
    const template = `<p>Click this link and copy the data from it:</p>
<p><a target="_blank" href="https://archidekt.com/api/decks/ID/">https://archidekt.com/api/decks/ID/</a></p>`;
    if (ev.value !== "") {
      const parts = ev.value.split("/");
      if (parts[2] === "archidekt.com" && parts[3] === "decks") {
        const subs = [
          ["ID", parts[4]],
        ];
        el.replaceChildren(this.api.makeHTML(template, subs));
      }
    }
  }
}
