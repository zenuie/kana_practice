export class Router {
    constructor(id, routes) { this.el = document.getElementById(id); this.routes = routes; }
    loadRoute(path) {
        const v = this.routes[path];
        if(v) { this.el.innerHTML = v.render(); if(v.afterRender) v.afterRender(); }
    }
}