import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';

require('bootstrap');

import './js/swiperArticle.js';

// On import la class de filtre
import { Filter } from './js/articleFilter.js';

// On instancie la class en lui passant l'élement HTML parent
new Filter(document.querySelector('.js-filter'));

import "./js/showPassword.js";