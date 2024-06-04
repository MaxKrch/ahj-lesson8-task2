export default class Connection {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.htmlUrl = `https://${this.baseUrl}`;
		this.wsUrl = `wss://${this.baseUrl}`;
		this.sseUrl = `https://${this.baseUrl}/sse`
	}
}