const t = {
  commander: `
<div class="commander">
  <div class="deck-section-title">Commander</div>
  <div class="deck-section">CARDS</div>
</div>`,

  card: `<div class="card">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg">
</div>
`,
};

export class ShowDeck {
  #cards;

  deck(_, el) {
    el.replaceChildren(this.getCards("commander"));
  }

  getCards(kind) {
    const cards = this.#cards
      .filter((card) => card.kind === kind)
      .map((card) => {
        const cardSubs = [
          ["ID", card.id],
          ["NAME", card.name],
        ];
        return this.api.makeHTML(t.card, cardSubs);
      });
    const subs = [
      ["CARDS", cards],
    ];
    return this.api.makeHTML(t[kind], subs);
  }

  async loadDeck(ev, el) {
    const resp = await this.api.getJSON(el.prop("deck"));
    if (resp.value) {
      this.#cards = resp.value.cards;
      console.log(this.#cards);

      // el.replaceChildren(
      //   ...response.value.cards
      //     .filter((card) => card.kind !== "mabybeboard")
      //     .map((card) => {
      //       const subs = [["ID", card.id]];
      //       return this.api.makeHTML(t.card, subs);
      //     }),
      // );
    } else {
      el.innerHTML = "Error fetching JSON";
    }
    this.api.trigger("deck");
  }
}
