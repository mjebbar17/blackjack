(function (){

    'use strict';

    angular.module('app', [])
        .controller("MainCtrl", function($scope, $http){

            $scope.test = function(){
                $scope.show = {};
                $scope.show.that = true;
            };

            $scope.gameInProgress = false;

            //setup game
            var dealer = new Dealer();
            dealer.shuffleDeckOfcards();

            //points to the index of the player in the dealer object
            var currentPlayer = 0;

            $scope.dealer = dealer;


            $scope.addPlayer = function(){
                if($scope.newPlayerName.length > 1) {
                    dealer.addPlayerToGame(new Player($scope.newPlayerName));
                }

            };

            $scope.playerHits = function(){
                dealer.hitPlayer(currentPlayer);
                if(dealer.players[currentPlayer].busted == true){
                    goToNextPlayerTurn();
                }
            };

            $scope.playerStands = function(){
                goToNextPlayerTurn();
            };

            $scope.playerDoubles = function(){
                dealer.playerDoubles(currentPlayer);
                goToNextPlayerTurn();
            };

            $scope.nextRound = function(){
                if(isPlayerStakesCorrect()){
                    dealer.showCards = false;
                    $scope.gameInProgress = true;
                    $scope.stakeInputError = false;
                    dealer.startNewRound($http);
                    currentPlayer = 0;
                    dealer.players[currentPlayer].turn = true;
                    $scope.currentPlayer = dealer.players[currentPlayer];
                }else{
                    $scope.stakeInputError = true;
                }

            };

            function goToNextPlayerTurn(){
                dealer.players[currentPlayer].turn = false;
                currentPlayer++;

                if(currentPlayer == dealer.players.length) {
                    //determine if dealer needs to play
                    var dealerShouldPlay = false;
                    dealer.players.forEach(function (player) {
                        if (!player.busted) {
                            dealerShouldPlay = true;
                        }
                    });

                    if (dealerShouldPlay) {
                        dealer.play();
                    }

                    dealer.updatePlayerBalance();
                    dealer.showCards = true;
                    $scope.gameInProgress = false;
                }else{
                    dealer.players[currentPlayer].turn = true;
                    $scope.currentPlayer = dealer.players[currentPlayer];

                }
            }

            function isPlayerStakesCorrect (){
                var stakesCorrect = true;
                dealer.players.forEach(function(player){
                    if(isNaN(player.stake) ||
                            player.stake < 1 ||
                            player.stake > player.balance) {
                        stakesCorrect = false;
                    }
                });

                return stakesCorrect;
            }

        });

})();

//error






function Dealer(){
    this.cards = [];
    this.cardValue = 0;
    this.players = [];
    this.deckOfCards = [];
};

Dealer.prototype.shuffleDeckOfcards = function(){
    this.deckOfCards = [];
    var self = this;

    //create the deck of cards
    ["H", "D", "C", "S"].forEach(function(suit){
        ['A','2','3','4','5','6','7','8','9','10','J','Q','K'].forEach(function(i){
            var value;
            if(i=="A"){
                value = 1;
            }else if( i == "J" || i == "Q" || i == "K"){
                value = 10;
            }else{
                value = parseInt(i);
            }

            self.deckOfCards.push(new Card(i + suit, value));
        });

    });

};

Dealer.prototype.resetCards = function(){
    this.cards = [];
    this.cardValue = 0;
    this.busted = false;
    this.hasAce = false;
    this.valueWithAce = 0;
};

Dealer.prototype.addPlayerToGame = function(player){
    this.players.push(player);
};

Dealer.prototype.giveCard = function(card){

    if(this.hasAce){
        this.valueWithAce += card.value;
    }
    this.cards.push(card);
    this.cardValue += card.value;

    if(card.text.substr(0,1) == "A"){
        this.hasAce = true;
        this.valueWithAce = card.value + 11;

        if((this.cardValue + 11) > 16 && (this.cardValue + 11) < 22) {
            this.cardValue -= card.value;
            this.cardValue += 11;
        }
    }
}

Dealer.prototype.dealCards = function(){

    var self = this;
    this.players.forEach(function (player) {
        player.giveCard(self.getCardFromDeck());
        player.giveCard(self.getCardFromDeck());
    });

    //including dealer
    this.giveCard(self.getCardFromDeck());
    this.giveCard(self.getCardFromDeck());

};

Dealer.prototype.getCardFromDeck = function(){
    var foundCard = false;
    var randomNumber = Math.floor(Math.random() * (this.deckOfCards.length - 1));
    var chosenCard = this.deckOfCards[randomNumber];
    this.deckOfCards.splice(randomNumber, 1);
    return chosenCard;

};

Dealer.prototype.hitPlayer = function(playerIndex){
    var currentPlayer = this.players[playerIndex];
    currentPlayer.giveCard(this.getCardFromDeck());
    if(currentPlayer.cardValue > 21){
        this.players[playerIndex].busted = true;
    }
};

Dealer.prototype.play = function(){

    while(this.cardValue < 17){
        this.giveCard(this.getCardFromDeck());
    }

    if(this.cardValue > 21){
        this.busted = true;
    }
};

Dealer.prototype.updatePlayerBalance = function(){

    var self = this;

    //if dealer has ace then compare to that score if not busted
    var value = self.cardValue;
    if(self.hasAce){
        if(self.valueWithAce < 22){
            if(self.valueWithAce > value){
                self.cardValue = self.valueWithAce;
                value = self.valueWithAce;
            }
        }
    }
    //check for winners
    this.players.forEach(function(player){

        if(player.busted){
            player.balance -= parseInt(player.stake);
        }else if(player.hasAce && !self.busted){
            if(player.valueWithAce < 22){
                if(player.valueWithAce > value){
                    player.balance += parseInt(player.stake);
                    player.won = true;
                }else if (player.valueWithAce < value) {
                    player.balance -= parseInt(player.stake);
                    player.lost = true;
                }
            }else{
                if(player.cardValue > value) {
                    player.balance += parseInt(player.stake);
                    player.won = true;
                }else if (player.cardValue < value) {
                    player.balance -= parseInt(player.stake);
                    player.lost = true;
                }else{
                    player.draw = true;
                }
            }
        }else{
            if(self.busted){
                player.balance += parseInt(player.stake);
                player.won = true;
            }else if(player.cardValue > value) {
                player.balance += parseInt(player.stake);
                player.won = true;
            }else if (player.cardValue < value) {
                player.balance -= parseInt(player.stake);
                player.lost = true;
            }else{
                player.draw = true;
            }
        }

    });
}

Dealer.prototype.startNewRound = function($http){


    //take players cards and reset flags
    this.players.forEach(function(player){
        player.resetCards($http);
    });

    this.players[0].turn = true;

    //reset dealer cards and flags
    this.resetCards();

    //reset deck of cards
    this.shuffleDeckOfcards();
    this.dealCards();
};

Dealer.prototype.playerDoubles = function(index){
    if(this.players[index].canDouble){
        this.players[index].stake += this.players[index].stake;
        this.players[index].giveCard(this.getCardFromDeck());
    }
};









function Player(name){
    this.name = name;
    this.balance = 1000;
    this.cards = [];
    this.cardValue = 0;
    this.stake = 50;
    this.hasAce = false;
    this.showAceValue = false;
    this.valueWithAce = 0;
};


Player.prototype.getStats = function ($http) {

    var self = this;
    $http.get("http://localhost:8111/result/"+this.name).success(function(stats){
        self.stats = stats;
    })
};

Player.prototype.giveCard = function(card){

    //add up seprate value for ace
    if(this.hasAce){
        this.valueWithAce += card.value;
    }

    //check if ace
    if(card.text.substr(0,1) == "A"){
        if(!this.hasAce) {
            this.hasAce = true;
            this.valueWithAce = this.cardValue + 11;
            this.showAceValue = true;
        }
    }

    if(this.hasAce && this.valueWithAce < 22){
        this.showAceValue = true;
    }else{
        this.showAceValue = false;
    }

    this.cards.push(card);
    this.cardValue += card.value;

    if((this.cards.length === 2) && (this.cardValue < 12) && (this.cardValue > 8)){
        this.canDouble = true;
    }else{
        this.canDouble = false;
    }
};
Player.prototype.resetCards = function($http){
    this.saveResult($http);
    this.cards = [];
    this.cardValue = 0;
    this.hasAce = false;
    this.showAceValue = false;
    this.valueWithAce = 0;
    this.busted = false;
    this.won = false;
    this.lost= false;
    this.turn = false;
    this.draw = false;
    this.canDouble = false;
    this.getStats($http);

};

Player.prototype.getCards = function(){
    return this.cards;
};

Player.prototype.saveResult = function($http){
    if(this.cards.length > 1) {
        var cardValueUsed = (this.valueWithAce < 21 && this.valueWithAce > this.cardValue) ? this.valueWithAce : this.cardValue;
        var resultObj = {
            "username": this.name,
            "cards": JSON.stringify(this.cards),
            "cardValue": cardValueUsed,
            "stake": this.stake,
            "result": this.busted ? "busted" : this.won ? "win" : this.lost ? "lost" : "draw"
        };

        $http.post("http://localhost:8111/result", resultObj);
    }
}


function Card(text, value){
    this.text = text;
    this.value = value;
};