export default class Connection {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.htmlUrl = `http://${this.baseUrl}`;
		this.wsUrl = `ws://${this.baseUrl}`;
		this.sseUrl = `http://${this.baseUrl}/sse`
	}
}