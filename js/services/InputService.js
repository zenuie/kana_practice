/* global wanakana */
export class InputService {
    bind(element) { if(window.wanakana) window.wanakana.bind(element); }
    unbind(element) { if(window.wanakana) window.wanakana.unbind(element); }
}