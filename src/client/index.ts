import { Application } from "./Application";
import { ethers } from 'ethers';

const app = new Application();
app.interpolation = true;
document.body.appendChild(app.view);

app.interpolation = true;

(window as any).app = app;

const initialize = () => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any')
    provider.send('eth_requestAccounts', [])
}

// allow to resize viewport and renderer
window.onresize = () => {
    app.viewport.resize(window.innerWidth, window.innerHeight);
    app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', initialize)

// toggle interpolation
document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;

    if (el.id === "interpolation") {
        app.interpolation = (el as HTMLInputElement).checked;

    }
});
