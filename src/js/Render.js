export default class Render {
	constructor(container) {
		this.container = container;

		this.init();
	}

	init() {
		this.initPage();
	}

	initPage() {
		this.container.classList.add('container', 'main-container');
	}
}