import { debounce } from 'lodash';
import { Flipper, spring } from 'flip-toolkit';

/**
 * Class Filter for search article in AJAX
 * 
 * @property {HTMLElement} content - The list of the article on the page
 * @property {HTMLFormElement} form - The form for filter article
 * @property {HTMLElement} count - The number of items on the page
 * @property {HTMLElement} sorting - The button for sorting the result
 * @property {HTMLElement} pagination - The links for switch page for the search
 * @property {number} page - The number of the actual page
 * @property {bool} moreNav - If the navigation it's with more button or navigation with pagination
 */
export class Filter {

    /**
     * Constructor of the class Filter
     * 
     * @param {HTMLElement} element 
     * @returns 
     */
    constructor(element) {
        if (!element) {
            return;
        }

        this.content = element.querySelector('.js-filter-content');
        this.form = element.querySelector('.js-filter-form');
        this.count = element.querySelector('.js-filter-count');
        this.sorting = element.querySelector('.js-filter-sorting');
        this.pagination = element.querySelector('.js-filter-pagination');
        this.page = parseInt(new URLSearchParams(window.location.search).get('page') || 1);
        this.moreNav = this.page === 1;
        this.bindEvents();
    }

    /**
     * Add the action and the listener on HTMLElement
     */
    bindEvents() {
        const linkClickListener = async (e, scrollToTop) => {
            e.preventDefault();

            if (!e.target.classList.contains('disabled')) {
                let url;

                if (e.target.tagName === 'I' || e.target.tagName === 'SPAN') {
                    url = e.target.closest('[direction]').href;
                } else {
                    url = e.target.href;
                }

                await this.loadUrl(url);

                if (scrollToTop) {
                    window.scrollTo(0, 0);
                }
            }
        }

        this.sorting.addEventListener('click', linkClickListener);

        if (this.moreNav) {
            this.pagination.innerHTML = `<div class="text-center">
                                            <button class="btn btn-primary mt-2">Voir plus</button>
                                        </div>`;

            this.pagination.querySelector('button').addEventListener('click', this.loadMore.bind(this));
        } else {
            this.pagination.addEventListener('click', (e) => {
                linkClickListener(e, true);
            });
        }

        this.form.querySelectorAll('input[type="text"]').forEach(input => {
            input.addEventListener('keyup', debounce(this.loadForm.bind(this), 400));
        });

        this.form.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', debounce(this.loadForm.bind(this), 1000))
        });

        this.form.querySelector('#btn-reset-form').addEventListener('click', this.resetForm.bind(this));
    }

    /**
     * Send ajax request with url
     * @param {URL} url - The url of the ajax request
     */
    async loadUrl(url, append = false) {
        this.showLoader();
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        urlParams.set('ajax', true);

        const response = await fetch(url.split('?')[0] + '?' + urlParams.toString());

        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();

            this.sorting.innerHTML = data.sorting;

            this.animationContent(data.content, append);

            if (!this.moreNav) {
                this.pagination.innerHTML = data.pagination;
            } else if (this.page === data.totalPage) {
                this.pagination.style.display = 'none';
            } else {
                this.pagination.style.display = 'block';
            }

            this.count.innerHTML = data.count;

            urlParams.delete('ajax');
            history.replaceState({}, "", url.split('?')[0] + '?' + urlParams.toString());

            this.hideLoader();
        }
    }

    /**
     * Get all inputs of the form and send ajax request with value
     */
    async loadForm() {
        this.page = 1;
        const data = new FormData(this.form);
        const url = new URL(this.form.getAttribute('action') || window.location.href);
        const urlParams = new URLSearchParams();

        data.forEach((value, key) => {
            urlParams.append(key, value);
        });

        return this.loadUrl(url.pathname + '?' + urlParams.toString());
    }

    async resetForm() {
        const url = new URL(this.form.getAttribute('action') || window.location.href);

        this.form.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        return this.loadUrl(url.pathname.split('?')[0]);
    }

    /**
     * Load the next page with the more nav button
     */
    async loadMore() {
        const button = this.pagination.querySelector('button');
        button.setAttribute('disabled', true);
        this.page++;
        const url = new URL(window.location.href);
        const urlParams = new URLSearchParams(url.search);
        urlParams.set('page', this.page);

        await this.loadUrl(url.pathname + '?' + urlParams.toString(), true);

        button.removeAttribute('disabled');
    }

    /**
     * Add animation for update content
     * @param {string} newContent - string with HTML code of the new list of article 
     * @param {bool} append - If replace the content or append the existing content on the page 
     */
    animationContent(newContent, append) {
        const springName = 'veryGentle';

        const exitAnimation = (element, index, onComplete) => {
            spring({
                values: {
                    translateY: [0, -20],
                    opacity: [1, 0]
                },
                onUpdate: ({ translateY, opacity }) => {
                    element.style.opacity = opacity;
                    element.style.transform = `translateY(${translateY}px)`;
                },
                onComplete
            });
        }

        const appearAnimation = (element, index) => {
            spring({
                values: {
                    translateY: [-20, 0],
                    opacity: [0, 1],
                },
                onUpdate: ({ translateY, opacity }) => {
                    element.style.opacity = opacity;
                    element.style.transform = `translateY(${translateY}px)`;
                },
                delay: index * 10,
            });
        }

        const flipper = new Flipper({
            element: this.content,
        });

        let articleCards = this.content.children;
        for (let card of articleCards) {
            flipper.addFlipped({
                element: card,
                flipId: card.id,
                spring: springName,
                onExit: exitAnimation,
            });
        }

        flipper.recordBeforeUpdate();

        if (append) {
            this.content.innerHTML += newContent;
        } else {
            this.content.innerHTML = newContent;
        }

        articleCards = this.content.children;
        for (let card of articleCards) {
            flipper.addFlipped({
                element: card,
                flipId: card.id,
                spring: springName,
                onAppear: appearAnimation,
            });
        }

        flipper.update();
    }

    /**
     * Show the loader of the form 
     */
    showLoader() {
        this.form.classList.add('is-loading');
        const loader = this.form.querySelector('.js-loading');
        loader.style.display = 'block';
        loader.setAttribute('aria-hidden', false);
    }

    /**
     * Hide the loader for the form
     */
    hideLoader() {
        this.form.classList.remove('is-loading');
        const loader = this.form.querySelector('.js-loading');
        loader.style.display = 'none';
        loader.setAttribute('aria-hidden', true);
    }
}