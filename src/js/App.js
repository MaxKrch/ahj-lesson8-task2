import Connection from './Connection';
import Render from './Render';
import State from './State';
import Instances from './workPlace/WidgetWP';
import Log from './workLog/WidgetWL';

export default class App {
	constructor(container, baseUrl) {
		this.container = document.querySelector(container);
		this.state = new State();
		this.connection = new Connection(baseUrl);
		this.render = new Render(this.container);
		this.instances = new Instances(this.container, this.connection.wsUrl);
		this.log = new Log(this.container, this.connection.sseUrl);

		this.init()
	}

	init() {
	
	}
}