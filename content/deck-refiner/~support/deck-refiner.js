const t = {
  section: `
<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section-cards">CARDS</div>
</div>`,

  card: `<div class="card" data-send="showCard" data-id="ID">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg"
    data-id="ID"
  />
</div>
`,
  displayCard: `<img src="/images/cards/ID.jpg" alt="Current Display Card" />`,
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

  commander(_, el) {
    el.innerHTML = "Commander";
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

  update(event) {}
}
