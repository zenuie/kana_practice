export class MainViewModel {
    constructor(router) { this.router = router; }
    navigate(path) { this.router.loadRoute(path); }
}