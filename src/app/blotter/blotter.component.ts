import { Component, OnInit } from '@angular/core';
import { Coin } from '../coin';
import { User } from '../user';
import { Wallet } from '../wallet';
import { Holding } from '../holding';
import { CryptoService } from '../crypto.service';
import { TicketService } from '../ticket.service';
import { UserService } from '../user.service';
import { WalletService } from '../wallet.service';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

import * as _ from 'lodash';

@Component({
  selector: 'app-blotter',
  templateUrl: './blotter.component.html',
  styleUrls: ['./blotter.component.css']
})
export class BlotterComponent implements OnInit {
  coins: Coin[];
  blinkClass: string[];
  selectedCoin: Coin;
  user: User;
  wallet: Wallet;

  constructor(
    public cryptoService: CryptoService,
    public ticketService: TicketService,
    public userService: UserService,
    public walletService: WalletService
  ) {
    this. blinkClass = [];
    //this.wallet = new Wallet('default', null)
  }
  
  ngOnInit() {
    this.getCoins()
    this.getTickingCoins()
  }

  selectCoin(coin: Coin) {
    this.selectedCoin = coin;
    this.ticketService.createTicket(coin, this.wallet);
    //this.updateChart(coin)
  }

  getTotal() {
    if (!this.userService.wallet) {
      return 0
    }
    let total = 0
    _.forEach(this.userService.wallet.holdings, (holding: Holding) => {
      let foundCoin = _.find(this.coins, (coin) => coin.coin == holding.coin)
      let value = foundCoin ? foundCoin.last : 0
      total += holding.balance * value
    })
    total += this.getAmount('USD')
    return total
  }

  getAmount(coin: string): number {
    let holding = _.find(this.userService.wallet.holdings, (holding) => holding.coin == coin)
    return holding ? holding.balance : 0
  }

  setFlash(newCoins: Coin[], blinkClass: string[]) {
    _.forEach(this.coins, oldCoin => {
      let newCoin = _.find(newCoins, { 'coin': oldCoin.coin });
      if (newCoin.last > oldCoin.last) {
        blinkClass[newCoin.coin] = 'blinkgreen';
      } else if (newCoin.last < oldCoin.last) {
        blinkClass[newCoin.coin] = 'blinkred';
      } else {
        blinkClass[newCoin.coin] = 'noblink';
      }
    })
  }

  getCoins() {
    this.cryptoService.getCoins()
    .subscribe(coins => {
      this.coins = coins;
    });
  }

  getTickingCoins() {
    IntervalObservable.create(500)
    .subscribe(t => { 
      this.cryptoService.getCoins()
        .subscribe(coins => { 
          this.setFlash(coins, this.blinkClass);
          this.coins = coins;
         });
       });
  }

  getWalletAmount(coin) {
    if (!this.userService.wallet) {
      return 0
    }
    let holding = _.find(this.userService.wallet.holdings, (holding) => {return holding.coin == coin })
    return holding ? holding.balance : 0
  }

  getWalletValue(coin) {
    if (!this.userService.wallet) {
      return 0
    }
    let holding = _.find(this.userService.wallet.holdings, (holding) => holding.coin == coin.coin)
    return holding ? holding.balance * coin.last : 0
  }

  updateChart(coin: Coin) {
    this.cryptoService.getChartData(coin.coin)
  }
}