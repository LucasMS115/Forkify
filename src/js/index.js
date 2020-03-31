// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as shoppingView from './views/shoppingView';
import * as likesView from './views/likesView';
import {elements, renderLoader, removeLoader, removeHTML} from './views/base';

/*Global state of the app
    - Search object;
    - Current recipe object
    - Shopping list object
    - Liked recipes
*/

const state = {
    //search - recipe - list
};

//************ SEARCH CONTROLLER ************

const controlSearch = async () => {
    //1) Get query from view
    const query = searchView.getInput();

    if(query){
        //2) New search obj and add to state
        state.search = new Search(query);

        //3) Prepare the UI for results
        removeHTML([elements.searchResList, elements.searchResPage]);
        searchView.clearInput();
        renderLoader(elements.searchRes);

        try {
            //4) Search for recipes
            await state.search.getResults();
            //5) Render the results on the UI
            removeLoader();
            searchView.renderResults(state.search.result);
            
        } catch (error) {
            removeLoader();
            alert('Something went wrong with the search');
        }
        
    };
    
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPage.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');;
    if(btn){
        const goTo = parseInt(btn.dataset.goto, 10); //the "10" is for numbers in base ten
        removeHTML([elements.searchResList, elements.searchResPage]);
        searchView.renderResults(state.search.result, goTo);
    }
});

//************ SEARCH CONTROLLER ************ ^

//************ RECIPE CONTROLLER ************

const controlRecipe = async() => {
    const id = window.location.hash.replace('#', ''); //window.location is the entire URL
    
    if(id){
        //prepare the UI 
        removeHTML([elements.recipe]);
        renderLoader(elements.recipe);

        //highlight selected
        if(state.search) searchView.highlightSelected(id);

        //create new Recipe obj
        state.recipe = new Recipe(id);

        //TESTING
        window.r = state.recipe;

        try {
            //get the recipe data n parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            //render the recipe
            removeLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
                     
        } catch (error) {
            console.log(error);
            alert('Error processing recipe');
        }
        
    };

};
//************ RECIPE CONTROLLER ************ ^^

//************ SHOPPING LIST CONTROLLER  ************ 
    
const controlList = () => {

    if(!state.list) state.list = new List();      
    state.recipe.ingredients.forEach((item,index) => {
        state.list.addItem(item.count,item.unit, item.ingredient);
        shoppingView.renderItem(state.list.items[index]);
    });

};

//************ SHOPPING LIST CONTROLLER  ************ ^^


/* window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe); */
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//Handling shopping list button clicks
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        shoppingView.deleteItem(id);
        
    //Update the list count
    }else if(e.target.matches('.shopping__count-value, .shopping__count-value *')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    };
});

//************ LIKES CONTROLLER  ************ 

const controlLike = () => {

    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    // Not yet liked
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );

        //add like to the UI
        likesView.renderLike(newLike);

        //toggle like btn
        likesView.toggleLikeBtn(true);

    }else{ //user has already liked the current recipe

        //remove like from the state
        state.likes.removeLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like from the UI list
        likesView.deleteLike(currentID);
    };

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//************ LIKES CONTROLLER  ************ ^^

window.addEventListener('load', () => {

    state.likes = new Likes();
    state.likes.readStorage(); //Searching for likes in local storage 
    likesView.toggleLikeMenu(state.likes.getNumLikes()); //Toggle the like if there is or not liked items
    state.likes.likes.forEach(el => likesView.renderLike(el));
});


//Handling recipe buttons clicks
elements.recipe.addEventListener('click', e => {

    if (e.target.matches('.btn-dec, .btn-dec *')) { // the '*' here means "any child"
        // Decrease button is clicked
        if (state.recipe.serve > 1) {
            state.recipe.updateServings('decrease');
            recipeView.updateServingIng(state.recipe);
        }       
    } else if (e.target.matches('.btn-inc, .btn-inc *')) {
        // Increase button is clicked
        state.recipe.updateServings('increase');
        recipeView.updateServingIng(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
         controlLike();
    };
});