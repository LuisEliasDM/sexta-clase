import { Component, OnInit } from '@angular/core';
import { DrinkData } from 'src/app/libs/entities/drink-data.interface';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-bebida',
  templateUrl: './bebida.component.html',
  styleUrls: ['./bebida.component.scss']
})
export class BebidaComponent implements OnInit {
  public drinks!: DrinkData[];

  constructor(public requestService: RequestService) { }

  ngOnInit(): void {
    this.requestService.getCocktail('margarita').subscribe({
      next: response => {
        this.drinks = response
      }
    })
  }

}
