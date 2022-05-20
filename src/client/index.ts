import { Application } from "./Application";
import { ethers } from 'ethers';

const app = new Application();
app.interpolation = true;
document.body.appendChild(app.view);

app.interpolation = true;

(window as any).app = app;

// connect to wallet
window.addEventListener('DOMContentLoaded', () => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any')
    provider.send('eth_requestAccounts', [])
})

// allow to resize viewport and renderer
window.onresize = () => {
    app.viewport.resize(window.innerWidth, window.innerHeight);
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
// toggle interpolation
document.addEventListener("click", async (e) => {
    const el = e.target as HTMLElement;

    if (el.id === "interpolation") {
        app.interpolation = (el as HTMLInputElement).checked;
    }

    if (el.id === "mint") {
        await app.connect();
    }
});
