const t = {
  card: `<div class="card">
  <img alt="The NAME card from Magic: The Gathering" src="URL">
</div>
`,
};

export class ShowDeck {
  async showDeck(ev, el) {
    const response = await this.api.getJSON(el.prop("deck"));
    if (response.value) {
      console.log(response.value);
    } else {
      el.innerHTML = "Error fetching JSON";
    }
  }
}
