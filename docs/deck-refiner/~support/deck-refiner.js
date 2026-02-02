const t = {
  card: `<div class="card" data-send="showCard" data-id="ID">
<div><img 
src="https://cards.scryfall.io/normal/front/CHAR1/CHAR2/ID.jpg?HASH"
alt="The NAME Magic: The Gather card."
data-id="ID" /></div>
</div>`,

  category: `
<div class="category">CATEGORY_NAME (CARDS_IN_CATEGORY)</div>
<div class="category-cards">CATEGORY_CARDS</div>
`,

  scryfallImageURL: `<img 
src="https://cards.scryfall.io/normal/front/CHAR1/CHAR2/ID.jpg?HASH"
alt="ALT"
data-id="ID" />`,

  section: `<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section-cards">CARDS</div>
</div>`,
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

  initCards() {
    return this._data.cards
      .map((card) => new Card(card));
  }
}

export class DeckRefiner {
  #objectDeck;
  #deck;

  bittyReady() {
    document.addEventListener("mousemove", (event) => {
      window.requestAnimationFrame(() => {
        this.update(event);
      });
    });
  }

  categoryCards(category) {
    return this.#deck.cards
      .filter((card) => card.categories[0] === category.name);
  }

  cardName(card) {
    return card.card.oracleCard.name;
  }

  deck(_, el) {
    el.replaceChildren(
      ...this.#objectDeck.categories()
        .map((category) => {
          const subs = this.#objectDeck.categorySubs(category).concat(
            [
              [
                "CATEGORY_CARDS",
                this.#objectDeck.categoryCards(category).map((card) =>
                  this.api.makeHTML(t.card, card.subs())
                ),
              ],
            ],
          );
          console.log(subs);
          return this.api.makeHTML(
            t.category,
            subs,
          );
        }),
    );
  }

  async loadJSON(_, el) {
    const resp = await this.api.getJSON("/deck-refiner/~support/example.json");
    if (resp.value) {
      this.#objectDeck = new Deck(resp.value);
      el.value = JSON.stringify(resp.value);
      this.api.trigger("deck");
    } else {
      console.log(resp.error);
    }
  }

  // scryfallImageTag(card) {
  //   // `https://cards.scryfall.io/normal/front/f/e/fe9be3e0-076c-4703-9750-2a6b0a178bc9.jpg?1761053654`;
  //   return this.api.makeTXT(
  //     t.scryfallImageURL,
  //     [
  //       ["ID", card.card.uid],
  //       ["CHAR1", card.card.uid.substring(0, 1)],
  //       ["CHAR2", card.card.uid.substring(1, 2)],
  //       ["HASH", card.card.scryfallImageHash],
  //       ["NAME", this.cardName(card)],
  //     ],
  //   );
  // }

  update(event) {}
}
