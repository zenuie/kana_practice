import { Router } from './core/Router.js';
import { MainViewModel } from './viewmodels/MainViewModel.js';
import { routes } from './routes.js';

document.addEventListener('DOMContentLoaded', () => {
    const router = new Router('app', routes);
    window.router = new MainViewModel(router);
    window.router.navigate('home');
});