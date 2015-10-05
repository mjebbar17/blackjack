function Player(name){
    this.name = name;
    this.balance = 1000;
    this.cards = [];
    this.cardValue = 0;
};

Player.prototype.giveCard = function(card){
    this.cards.push(card);
    this.cardValue += card.value;
};

Player.prototype.resetCards = function(card){
    this.cards = [];
};

Player.prototype.getCards = function(){
    return this.cards;
};

module.exports = Player;

