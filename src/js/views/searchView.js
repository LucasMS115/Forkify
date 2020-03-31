import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const highlightSelected = (id) => {
    const resultsArray = Array.from(document.querySelectorAll('.results__link'));
    resultsArray.forEach(el => el.classList.remove('results__link--active'));

    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    const words = title.split(' ');

    if(title.length > limit){
        words.reduce((accumulator, current) => {
            if(accumulator + current.length <= limit){
                newTitle.push(current);
            };
            return accumulator + current.length;
        }, 0);

        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

const renderRecipe = recipes => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipes.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipes.image_url}" alt="${recipes.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipes.title)}</h4>
                    <p class="results__author">${recipes.publisher}</p>
                </div>
            </a>
        </li>
    `;

    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

//type = 'prev' or 'next';
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1: page + 1}>
    <span>Page ${type === 'prev' ? page - 1: page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left': 'right' }"></use>
        </svg>      
    </button>
`;

const renderButtons = (page, resPerPage, nResults) => {
    const nPages = Math.ceil(resPerPage/nResults);
    let button;

    if(page === 1 && nPages > 1){
        //just the "page 2" button     
        button = createButton(page, 'next');
    }else if(page > 1 && page < nPages){
        //both buttons
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')} 
        `;   
    }else if(page === nPages && nPages > 1){
        //just the button for the previous page
        button = createButton(page, 'prev');
    }

    elements.searchResPage.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    //the slice method don't include the item on the "end" parameter
    const end = page * resPerPage;

    renderButtons(page, recipes.length, resPerPage);

    recipes.slice(start, end).forEach(renderRecipe);
};