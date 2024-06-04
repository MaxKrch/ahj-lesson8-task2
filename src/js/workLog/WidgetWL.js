import Render from './RenderWL';

export default class Log {
	constructor(container, url) {
		this.rend = new Render(container);
		this.url = url;
		this.state = {
			reconnect: {
				idTimer: null,
				try: 0,
			}
		}
		this.init()
	}

	init() {
		this.createSSE();
	}

	createSSE() {
		if(this.sse) {
			this.sse.close();
			this.sse = null;
		}

		this.sse = new EventSource(this.url);

		this.sse.addEventListener('open', event => {
			this.onSSEOpen();
		})
		this.sse.addEventListener('message', event => {
			this.onSSEMessage(event);
		})
		this.sse.addEventListener('error', event => {
			this.onSSEError();
		})
	}

	onSSEOpen(event) {
		this.rend.hideError();
		this.clearStateReconnect();
	}

	onSSEMessage(event) {
		if(!event.data) {
			return;
		}
		this.rend.addNoteToList(event.data);
		this.scrollToEnd();

	}

	onSSEError(event) {
		this.rend.showError();
		if(this.state.reconnect.idTimer) {
			clearInterval(this.state.reconnect.idTimer);
			this.state.reconnect.idTimer = null;
		}
		
		setTimeout(() => this.reconnect(), 15000);
	}

	reconnect() {
		if(this.state.reconnect.idTimer) {
			clearInterval(this.state.reconnect.idTimer)
		}

		if(this.sse.readyState === 1) {
			return;
		}

		this.state.reconnect.idTimer = setInterval(() => {
			this.createSSE();
			this.state.reconnect.try += 1;
			if (this.state.reconnect.try > 29) {
				this.clearStateReconnect()	
			}
		}, 15000)
	}

	clearStateReconnect()	{
		if(this.state.reconnect.idTimer) {
			clearInterval(this.state.reconnect.idTimer);
		}
		
		this.state.reconnect.idTimer = null;
		this.state.reconnect.try = 0;
	}

	scrollToEnd() {
		const listLog = this.rend.listLog
		const bottom = listLog.scrollHeight;
		listLog.scrollTo(0, bottom)
	}
}