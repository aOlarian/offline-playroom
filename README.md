# Offline Playroom

## Enterprise edition

We build and deploy a paid Enterprise edition to order. Examples of what we can develop and extend for your organization are listed below.

- Central control for distributing activity packs across schools and managed devices.
- Teacher, student and administrator roles with classroom progress reporting.
- Custom browser multiplayer and hosted worlds for schools, events or private communities.

For an Enterprise edition or custom development, contact us at [verobots.eu](https://verobots.eu/) or [olarian.com](https://olarian.com/).


A Romanian-language collection of browser games for touchscreens and keyboards. Pick a puzzle, drawing activity or arcade game. Progress, speed settings and stars are stored in the browser on the current device.

## Play and install

Open the hosted app once while online. Choose **Install app** in Chrome or Edge, or **Add to Home Screen** in Safari on iPhone or iPad. Wait for the page to finish loading before going offline. The app and games are cached on the device.

## Run a local copy

Extract the ZIP from [Releases](../../releases) and serve the extracted folder with a static HTTP server. For example, if Python 3 is already installed:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. For use over a network, serve it over HTTPS so the browser can install the app and store the games offline. No build step or service account is required.

The app itself does not send save data to a server. Spoken directions depend on the voices available in the browser or operating system.

## License

[MIT](LICENSE).
