const t = {
  card: `<div class="card">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg">
</div>
`,
};

export class ShowDeck {
  async showDeck(ev, el) {
    const response = await this.api.getJSON(el.prop("deck"));
    if (response.value) {
      el.replaceChildren(
        ...response.value.cards
          .filter((card) => card.kind !== "mabybeboard")
          .map((card) => {
            const subs = [["ID", card.id]];
            return this.api.makeHTML(t.card, subs);
          }),
      );
    } else {
      el.innerHTML = "Error fetching JSON";
    }
  }
}
