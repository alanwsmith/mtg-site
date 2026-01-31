const templates = {
  card: `
<div><img src="/deck-builder/images/ID.jpg" /></div>`,
};

export class DeckBuilder {
  #data;

  async bittyInit() {
    await this.loadData();
  }

  cards(_, el) {
    el.replaceChildren(
      ...this.#data.cards.map((card) => {
        console.log(card.kind);
        const subs = [
          ["ID", card.id],
        ];
        return this.api.makeHTML(templates.card, subs);
      }),
    );
  }

  async loadData() {
    const response = await this.api.getJSON("/deck-builder/data.json");
    if (response.value) {
      this.#data = response.value;
    } else {
      console.log(response.error);
    }
  }
}
