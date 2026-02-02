const t = {
  card: `<div class="card" data-send="showCard" data-id="ID">IMAGE_TAG</div>`,

  scryfallImageURL: `<img 
src="https://cards.scryfall.io/normal/front/CHAR1/CHAR2/ID.jpg?HASH"
alt="ALT"
data-id="ID" />`,

  section: `<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section-cards">CARDS</div>
</div>`,
};

export class DeckRefiner {
  #deck;

  bittyReady() {
    document.addEventListener("mousemove", (event) => {
      window.requestAnimationFrame(() => {
        this.update(event);
      });
    });
  }

  cardsInCategory(category) {
    return this.#deck.cards
      .filter((card) => card.categories[0] === category);
  }

  cardName(card) {
    return card.card.oracleCard.name;
  }

  commander(_, el) {
    //el.replaceChildren(this.api.makeHTML(t.displayCard))

    // el.innerHTML = this.#deck.cards
    //   .filter((card) => card.categories[0] === "Commander")
    //   .map((card) => card.card.oracleCard.name);

    // const subs = this.#deck.cards
    //   .filter((card) => card.categories[0] === "Commander")
    //   .map(
    //     (card) => {
    //       return [["NAME", card.card.oracleCard.name], ["ID", card.card.uid], [
    //         "IMAGE_URL",
    //         this.scryfallImageURL(card),
    //       ]];
    //     },
    //   );

    const card = this.cardsInCategory("Commander")[0];
    const subs = [
      ["NAME", this.cardName(card)],
      ["IMAGE_TAG", this.scryfallImageTag(card)],
    ];

    console.log(subs);

    el.replaceChildren(
      this.api.makeHTML(
        t.card,
        subs,
      ),
    );

    // const id = this.#deck.cards
    //   .filter((card) => card.categories[0] === "Commander")
    //   .map((card) => card.card.uid);
    // const subs = [
    //   ["ID", id],
    // ];

    //el.replaceChildren(this.api.makeHTML(t.displayCard, subs));

    //el.innerHTML = id;
  }

  deck(_, el) {
    el.innerHTML = "deck";
  }

  async loadJSON(_, el) {
    const resp = await this.api.getJSON("/deck-refiner/~support/example.json");
    if (resp.value) {
      this.#deck = resp.value;
      el.value = JSON.stringify(resp.value);
      this.api.trigger("commander");
      this.api.trigger("deck");
    } else {
      console.log(resp.error);
    }
  }

  scryfallImageTag(card) {
    // `https://cards.scryfall.io/normal/front/f/e/fe9be3e0-076c-4703-9750-2a6b0a178bc9.jpg?1761053654`;
    return this.api.makeTXT(
      t.scryfallImageURL,
      [
        ["ID", card.card.uid],
        ["CHAR1", card.card.uid.substring(0, 1)],
        ["CHAR2", card.card.uid.substring(1, 2)],
        ["HASH", card.card.scryfallImageHash],
        ["NAME", this.cardName(card)],
      ],
    );
  }

  update(event) {}
}
