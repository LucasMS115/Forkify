import axios from 'axios';
import {proxy, key} from '../config'

export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const rec = await axios(`${proxy}http://recipesapi.herokuapp.com/api/get?key=${key}&rId=${this.id}`);
            this.title = rec.data.recipe.title;
            this.author = rec.data.recipe.publisher;
            this.ingredients = rec.data.recipe.ingredients;
            this.image = rec.data.recipe.image_url;
            this.url = rec.data.recipe.source_url;
        }
        catch(error){
            console.log(error);
            alert('Something went wrong :(');
        }
    };

    calcTime(){
        //assuming that we need 15 minutes for each three ingredients
        const nIngredients = this.ingredients.length;
        const periods =  nIngredients/3;
        this.time = periods * 15;
    };

    calcServings(){
        this.serve = 4;
    };

    parseIngredients(){

        const unitsLong = ['tablespoos', 'tablespoon','teaspoons','teaspoon' , 'ounces', 'ounce', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp','tsp' , 'tsp', 'oz', 'oz', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map((cur) => {
            //uniform units
            let ingredient = cur.toLowerCase();
            unitsLong.forEach((cur, i) => {
                ingredient = ingredient.replace(cur, units[i]);
            });

            //remove parenthesis
            ingredient.replace(/ *\([^)]*\) */g, ' ');

            //parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el => units.includes(el));
            let objIng;
            let count;

            if(unitIndex > -1){
                //There is a unit 
                const arrCount = arrIng.slice(0, unitIndex);
                //EXAMPLES
                //1st case) arrCount = [4] --> count = 4
                //2nd case) arrCount = [4-1/2] --> count=eval(4+1/2) --> count = 4.5 
                //3rd case) arrCount = [4, 1/2] --> count=eval(4+1/2) --> count = 4.5
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }else{
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                };                   
                
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

                return objIng;

            }else if(parseInt(arrIng[0], 10)){
                // NO unit but the first element of the string is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(unitIndex === -1){
                //NO unit and NO number
                objIng = {
                    count: '',
                    unit: '',
                    ingredient
                }
            };

            return objIng;
        });

        this.ingredients = newIngredients;
    };

    updateServings(type){
        const newServings = type === 'increase'? this.serve + 1: this.serve - 1;

        //update ingredients counters
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.serve);            
        });

        this.serve = newServings;
    };
};