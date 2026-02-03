const t = {
  card: `<div class="card-wrapper" data-send="showCard" data-id="ID">
  <div class="card">
  <img 
  src="/images/cards/ID.jpg"
  alt="The NAME Magic: The Gather card."
  />
  <!--
  <img 
  src="https://cards.scryfall.io/normal/front/CHAR1/CHAR2/ID.jpg?HASH"
  alt="The NAME Magic: The Gather card."
  />
  -->
  </div>

  <div class="card-buttons">
  <button>1</button>
  <button>2</button>
  <button>3</button>
  <button>4</button>
  <button>X</button>
  </div>
</div>`,

  category: `
<div class="category-wrapper">
<div class="category-title">CATEGORY_NAME (CARDS_IN_CATEGORY)</div>
<div class="category-cards">CATEGORY_CARDS</div>
</div>

`,
};

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
        return categoryObj.name;
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
          "https://cards.scryfall.io/normal/front/",
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

  imageFor(id) {
    return `/images/cards/${id}.jpg`;
  }

  initCards() {
    return this._data.cards
      .map((card) => new Card(card));
  }
}

export class DeckRefiner {
  #deck;
  #highlightId;

  deck(_, el) {
    el.replaceChildren(
      ...this.#deck.categories()
        .map((category) => {
          const subs = this.#deck.categorySubs(category).concat(
            [
              [
                "CATEGORY_CARDS",
                this.#deck.categoryCards(category).map((card) =>
                  this.api.makeHTML(t.card, card.subs())
                ),
              ],
            ],
          );
          return this.api.makeHTML(
            t.category,
            subs,
          );
        }),
    );
  }

  hideHighlight(_, __) {
    document.documentElement.style.setProperty(
      "--highlight-visibility",
      `hidden`,
    );
    this.#highlightId = null;
  }

  highlightImageSrc(_, el) {
    el.src = this.#deck.imageFor(this.#highlightId);

    //el.src = "/images/cards/fe9be3e0-076c-4703-9750-2a6b0a178bc9.jpg";
  }

  // imageDownloadCommands(_, el) {
  //   if (el) {
  //     el.value = `#!/bin/bash
  // ${this.#deck.downloadCommands()}
  //   `;
  //   }
  // }

  async loadJSON(_, el) {
    const resp = await this.api.getJSON("/deck-refiner/~support/example.json");
    //const resp = await this.api.getJSON("/deck-refiner/~support/big-deck.json");
    if (resp.value) {
      this.#deck = new Deck(resp.value);
      el.value = JSON.stringify(resp.value);
      this.api.trigger("deck imageDownloadCommands");
    } else {
      console.log(resp.error);
    }
  }

  showCard(ev, el) {
    if (this.#highlightId !== ev.prop("id")) {
      this.#highlightId = ev.prop("id");
      const wrapper = ev.target.closest(".card-wrapper");
      const bounds = wrapper.getBoundingClientRect();

      document.documentElement.style.setProperty(
        "--highlight-left",
        `${bounds.x}px`,
      );

      // if (bounds.x < 300) {
      //   document.documentElement.style.setProperty(
      //     "--highlight-left",
      //     `${bounds.x + 50}px`,
      //   );
      // } else {
      //   document.documentElement.style.setProperty(
      //     "--highlight-top",
      //     `${bounds.y + 40}px`,
      //   );
      // }

      // if (bounds.x < 300) {
      //   document.documentElement.style.setProperty(
      //     "--highlight-left",
      //     `${bounds.x + 170}px`,
      //   );
      // } else {
      //   document.documentElement.style.setProperty(
      //     "--highlight-left",
      //     `${bounds.x - 200}px`,
      //   );
      // }

      // TODO: Shift up if the card would hit the bottom
      document.documentElement.style.setProperty(
        "--highlight-top",
        `${wrapper.offsetTop + 40}px`,
      );

      document.documentElement.style.setProperty(
        "--highlight-visibility",
        `visible`,
      );
      this.api.trigger("highlightImageSrc");
    }
  }
}
