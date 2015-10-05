function Dealer(){
    this.cards = [];
    this.players = [];
    this.dealtCards = [];
};

Dealer.prototype.setDeckOfCards = function(deckOfCards){
    this.deckOfcards = deckOfCards;
};

Dealer.prototype.resetCards = function(){
    this.cards = [];
};

Dealer.prototype.addPlayerToGame = function(player){
    this.players.push(player);
};

Dealer.prototype.dealCards = function(){
    this.players.forEach(function(player){
        player.giveCard(this.getCardFromDeck());
    });
};

Dealer.prototype.getCardFromDeck = function(){

    var foundCard = false;
    var chosenCard;

    while(!foundCard) {

        var randomNumber = Math.floor(Math.random() * 51);
        chosenCard = this.cards[randomNumber];
        var cardDealtBefore = false;

        this.dealtCards.forEach(function (card) {
            if (card === chosenCard) {
                cardDealtBefore = true;
            }
        });

        if(!cardDealtBefore){
            foundCard = true;
        }
    }

    return chosenCard;

};

Dealer.prototype.startGame = function(){
    this.dealCards();
};

module.exports = Dealer;