export class Player {
	constructor(data = {}) {
		this.id = data.id;
		this.name = data.name;
		this.address = data.address;
		this.hand = [];
		this.isDealer = data.isDealer === true;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}

	getAddress() {
		return this.address;
	}

	getHand() {
		return this.hand;
	}

	getIsDealer() {
		return this.isDealer;
	}

	setHand(hand) {
		this.hand = hand;
		return this;
	}

	setIsDealer(isDealer) {
		this.isDealer = isDealer === true;
		return this;
	}
}
