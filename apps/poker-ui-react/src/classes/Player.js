export class Player {
	constructor(data = {}) {
		this.id = data.id;
		this.name = data.name;
		this.address = data.address;
		this.hand = [];
		this.isDealer = data.isDealer === true;
		this.ack = data.ack;
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

	getACK() {
		return this.ack;
	}

	update(data) {
		for (const key in data) {
			if (this.hasOwnProperty(key)) {
				this[key] = data[key];
			}
		}
		return this;
	}

	setHand(hand) {
		this.hand = hand;
		return this;
	}

	setIsDealer(isDealer) {
		this.isDealer = isDealer === true;
		return this;
	}

	setACK(ack) {
		this.ack = ack;
		return this;
	}
}
