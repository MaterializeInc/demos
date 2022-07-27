import consumer from "channels/consumer"

consumer.subscriptions.create("TailChannel", {
  connected() {
    console.log("Connected to 'tail'");
  },

  disconnected() {
    console.log("Disconnected from 'tail'");
  },

  received(data) {
    this.appendLine(JSON.stringify(data));
  },

  appendLine(data) {
    const html = this.createLine(data)
    const element = document.querySelector("[data-tail='tail']")
    element.insertAdjacentHTML("afterbegin", html)
  },

  createLine(data) {
    return `
      <article class="chat-line">
        <span class="data">${data}</span>
      </article>
    `
  }
});
