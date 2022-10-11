import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineAll, combineLatestAll, concatMap, map, merge, Observable, tap } from 'rxjs';
import { DrinkData } from '../libs/entities/drink-data.interface';

@Injectable({
    providedIn: 'root'
})
export class RequestService {

    private varieties: Observable<any>[] = []

    constructor(private httpClient: HttpClient) { }

    getCocktail(name: string): Observable<any>{
        return this.httpClient.get("https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + name).pipe(
            map( (response: any) => {
                return this.transformDrinksResponse(response.drinks);
            })
        )
    }

    transformDrinksResponse(drinks: any[]): DrinkData[]{
        return drinks.map(drink => {

            let ingredients: string[] = []
            Object.keys(drink).forEach(key => {
                if(key.includes("strIngredient") && drink[key]){
                    ingredients.push(drink[key]);
                }
            });

            let response: DrinkData = {
                name: drink.strDrink,
                urlImg: drink.strDrinkThumb,
                ingredients: ingredients
            };

            return response

        })
    }

    getPokemon(): Observable<any>{
        return this.httpClient.get("https://pokeapi.co/api/v2/pokemon/pikachu").pipe(
            concatMap((pokemonResponse: any) => {
                return this.getSpecies(pokemonResponse.species.url, pokemonResponse)
            }),
            concatMap((speciesResponse: any) => {
                return this.getVarieties(speciesResponse);
            }),
            map((finalResponse: any) => {
                return {
                    name: finalResponse.name,
                    stats: finalResponse.stats,
                    sprites: finalResponse.sprites,
                    varieties: finalResponse.varieties
                }
            }),
            tap((finalResponse: any) => {
                console.log(finalResponse);
            })
        )
    }

    getSpecies(url: string, original: any): Observable<any>{
        return this.httpClient.get(url).pipe(
            map((especiesResponse: any) => {
                (especiesResponse.varieties as any[]).forEach((item) => {
                    this.varieties.push(this.httpClient.get(item.pokemon.url))
                })
                return {
                    ... especiesResponse,
                    ... original
                }
            })
        )
    }

    getVarieties(original: any): Observable<any>{
        return merge(this.varieties).pipe(
            combineLatestAll(),
            map((varietiesResponse: any) => {
                let sprites = varietiesResponse.map((sprite: any) => {
                    return {
                        name: sprite.name,
                        img: sprite.sprites.front_default,
                    }
                })
                return {
                    ... original,
                    varieties: varietiesResponse,
                    sprites: sprites
                }
            })
        )
    }
}
