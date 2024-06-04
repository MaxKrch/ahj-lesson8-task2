import Render from './RenderWP';

export default class Instances {
	constructor(container, url) {
		this.rend = new Render(container);
		this.url = url;
	
		this.state = {
			recconnect: {
				try: 0,
				time: 0,
				idTimer: null,
			},
			modal: {
				idTimer: null,
			}			
		}

		this.init();
	}

	init() {
		this.addEventListeners();
		this.rend.showSuccess(`Подключение к WebSocket`)
		this.createWS();
	}

	addEventListeners() {
		this.rend.saveEventListeners('newInstance', 'click', this.onClickNewInstance.bind(this));
		this.rend.saveEventListeners('listInstance', 'click', this.onClickListInstance.bind(this));
	}

	onWSError(error) {
		this.rend.showError('Потеряно соединение с WebSocket - пробую переподключиться');
		this.recconnect();
	}

	onWSOpen(event) {
		this.rend.showSuccess('WebSocket подключен');
		this.clearStateReconnect();
		this.hideModalMessage(1500);
		this.clearInstances();
		this.requestInstances();
	}

	onWSMessage(mess) {
		if(!mess) {
			return;
		}

		const message = JSON.parse(mess.data);
		if(!message.success) {
			this.rend.showError('База данных недоступна');
			this.hideModalMessage(2000)
			return;
		}
		
		this.parseMessage(message);
	}

	onWSClose(event) {
		if(event.code !== 1000) {
			this.recconnect()
		}
		console.log(`Connection closed with code: ${event.code}`)
	}

	onClickNewInstance() {
		const mess = this.createWSMess('create');
		this.sendWSMess(mess);
	}

	onClickListInstance(event) {
		const classList = event.target.classList;
		const serverLi = event.target.closest('li.instance');
		const id = serverLi.dataset.id;
		let message = null;
	
		if(classList.contains('instance-action__play')) {
			message = this.createWSMess('start', id);
		}

		if(classList.contains('instance-action__pause')) {
			message = this.createWSMess('stop', id)
		}
		
		if(classList.contains('instance-action__remove')) {
			message = this.createWSMess('remove', id);
		}

		if(message) {
			this.sendWSMess(message)
		}
	} 

	createWS() {
		this.ws = new WebSocket(this.url);

		this.ws.addEventListener('error', error => {
			this.onWSError(error);
		});
		
		this.ws.addEventListener('open', event => {
			this.ws.addEventListener('message', message => {
				this.onWSMessage(message);
			});
			this.ws.addEventListener('close', event => {
				this.onWSClose(event);
			});

			this.onWSOpen(event);
		});
	}

	hideModalMessage(time = 0) {
		if(this.state.modal.idTimer) {
			clearTimeout(this.state.modal.idTimer)
		}

		this.state.modal.idTimer = setTimeout(() => {
			this.rend.hideMessage();
		}, time)
	}

	recconnect() {
		if(this.state.recconnect.idTimer) {
			return;
		}

		if(this.state.recconnect.try > 29) {
			this.rend.showError('Сервер пока не доступен');
			this.hideModalMessage(3000);
			return;
		}

		if(this.state.recconnect.try > 0) {
			const time = this.state.recconnect.time / 1000
			this.clearStateModalMess();
			this.rend.showErrorTimer(`Переподключение к WebSocket через`, time);
		}
		
		this.state.recconnect.idTimer = setTimeout(() => {
			this.createWS();
			this.state.recconnect.idTimer = null;
			this.state.recconnect.time += 3000;
			this.state.recconnect.try +=1;
		}, this.state.recconnect.time)
	}

	clearStateReconnect() {
		if(this.state.recconnect.idTimer) {
			clearTimeout(this.state.recconnect.idTimer)
		};

		this.state.recconnect.idTimer = null;
		this.state.recconnect.time = 0;
		this.state.recconnect.try = 0;
	}

	clearStateModalMess() {
		if(this.rend.modal.idTimer) {
			clearInterval(this.rend.modal.idTimer);
		}

		this.rend.modal.idTimer = null;
	}

	requestInstances() {
		const message = this.createWSMess('load');
		this.sendWSMess(message);
	}

	clearInstances() {
		this.rend.clearListInstances()
	}

	async sendWSMess(mess) {
		if(this.ws.readyState !== 1) {
			this.rend.showError(`Соединение закрыто`);
			this.hideModalMessage(3000);
			return;
		}

		this.ws.send(mess);
	}

	createWSMess(command, id) {
		const messObj = {
			command,
		}

		if(id) {
			messObj.idServer = id;
		}

		const mess = JSON.stringify(messObj);
		return mess;
	}

	parseMessage(message) {
		const command = message.command;
		const data = message.data;

		switch(command) {
			case 'load':
				this.loadInstances(data)
				break;
			
			case 'create':
				this.createInstance(data) 
				break;
			
			case 'start':
				this.startInstance(data) 
				break;
			
			case 'stop':
				this.stopInstance(data) 
				break;
			
			case 'remove':
				this.removeInstance(data)
				break;
		}
	}

	loadInstances(instances) {
		for(let inst of instances) {
			this.createInstance(inst);
		}
	}

	createInstance(inst) {
		this.rend.addInstanceToList(inst);
		this.scrollToEnd()
	}

	startInstance(inst) {
		this.rend.changeInst(inst.idServer, 'start')
	}

	stopInstance(inst) {
		this.rend.changeInst(inst.idServer, 'stop')
	}

	removeInstance(inst) {
		this.rend.removeInst(inst.idServer);
	}

	scrollToEnd() {
		const list = this.rend.listInstance;
		const height = list.scrollHeight;
		list.scrollTo(0, height)
	}
}