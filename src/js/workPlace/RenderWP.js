export default class Render {
	constructor(container) {
		this.container = container;

		this.widget;
		this.listInstance;
		this.newInstance;
		this.modal = {
			container: null,
			message: null,
			idTimer: null,
		}

		this.eventListeners = {
			listInstance: {
				click: [],
			},
			newInstance: {
				click: [],
			},
		};

		this.init()
	}

	init() {
		this.renderWidget();
		this.registerEvents();
	}

	registerEvents() {
		this.listInstance.addEventListener('click', event => {
			this.eventListeners.listInstance.click.forEach(item => {
				item(event);
			});
		});
		this.newInstance.addEventListener('click', event => {
			this.eventListeners.newInstance.click.forEach(item => {
				item(event);
			});
		});
	}

	renderWidget() {
		const wrap = document.createElement('section');
		wrap.classList.add('widget-container');

		const widget = document.createElement('article');
		widget.classList.add('widget', 'workplace');
		
		const title = this.renderTitle();
		const content = this.renderContent();
		const addInstance = this.renderAddInstance();

		widget.append(title);
		widget.append(content);
		widget.append(addInstance);

		wrap.append(widget);

		const modal = this.renderModal()
		widget.append(modal);

		this.saveElements(widget);
		this.container.append(wrap);
	}

	renderTitle() {
		const title = document.createElement('h2')
	 	title.classList.add('widget-title');
	 	title.textContent = `Your micro instances:`;

	 	return title;
	}

	renderContent() {
		const content = document.createElement('ul');
		content.classList.add('widget-content', 'list-instances');
		content.dataset.name = "list-instance";

		return content;
	}

	renderAddInstance() {
		const newInstance = document.createElement('p');
		newInstance.classList.add('workplace-new');
		newInstance.dataset.name = "new-instance";
		newInstance.textContent = `Create new instance`;

		return newInstance;
	}

	renderModal() {
		const modal = document.createElement('aside');
		modal.classList.add('workplace-modal', 'hidden-item');
		modal.dataset.name = 'modal-container';
		modal.innerHTML = `
			<div class="workplace-modal__message">
				<p class="workplace-modal__text" data-name="modal-message">
					Нет подключения к WebSocket
				</p>
			</div>
		`
		return modal;
	}

	saveElements(widget) {
		this.widget = widget;
		this.listInstance = widget.querySelector('[data-name="list-instance"]');
		this.newInstance = widget.querySelector('[data-name="new-instance"]');
		this.modal.container = widget.querySelector('[data-name="modal-container"]');
		this.modal.message = widget.querySelector('[data-name="modal-message"]');
	}

	renderInstance(inst) {
		const statusText = inst.state[0].toUpperCase() + inst.state.slice(1, inst.state.length);

		let statusIconClasses = `instance__icon instance-status__icon`;
		let actionIconClasses = `instance__icon instance-action__button`;

		if(inst.state === 'running') {
			statusIconClasses += ` instance-status__icon-active`; 
			actionIconClasses += ` instance-action__pause`;
		}

		if(inst.state === 'stopped') {
			actionIconClasses += ` instance-action__play`;
		}

		const instLi = document.createElement('li');
		instLi.classList.add('instance');
		instLi.dataset.id = inst.idServer;

		const instTitle = document.createElement('div');
		instTitle.classList.add('instance-id');
		instTitle.textContent = inst.idServer;
		instLi.append(instTitle);

		const instStatus = document.createElement('div');
		instStatus.classList.add('instance-service', 'instance-status');
		instStatus.innerHTML = `
			<div class="instance-service__title instance-status__title">
 				Status:
 			</div>
 			<div class="${statusIconClasses}">
 			</div>
 			<div class="instance-status__text">
 				${statusText}
 			</div>
 		`
		instLi.append(instStatus);

		const instAction = document.createElement('div');
		instAction.classList.add('instance-service', 'instance-action')
		instAction.innerHTML = `
			<div class="instance-service__title instance-action__title">
 				Actions:
			</div>
			<div class="${actionIconClasses}">
			</div>
			<div class="instance__icon instance-action__button instance-action__remove">
				&#10006;
			</div>
		`
		instLi.append(instAction);

		return instLi;
	}

	addInstanceToList(inst) {
		const newInst = this.renderInstance(inst);
		this.listInstance.append(newInst);
	}

	showError(error) {
		this.modal.message.classList.add('modal__text_error');
		this.showMessage(error);
	}

	showErrorTimer(mess, time) {

		this.modal.idTimer = setInterval(() => {
			time -= 1;
			if(time >= 0) {
				this.modal.message.textContent = `Переподключение к WebSocket через ${time} сек.`;
			}
			if(time === 0) {
				clearInterval(this.modal.idTimer)
			}
		}, 1000)
	}

	showSuccess(mess) {
		this.modal.message.classList.remove('modal__text_error');
		this.showMessage(mess);
	}

	showMessage(mess) {
		this.modal.container.classList.remove('hidden-item');
		this.modal.message.textContent = mess;
	}

	hideMessage() {
		this.modal.container.classList.add('hidden-item');
	}

	saveEventListeners(field, event, callback) {
		this.eventListeners[field][event].push(callback);
	}

	clearListInstances() {
		this.listInstance.innerHTML = '';
	}

	changeInst(id, action) {
		const instLi = this.listInstance.querySelector(`li[data-id="${id}"]`);
		const statusIcon = instLi.querySelector('.instance-status__icon');
		const statusText = instLi.querySelector('.instance-status__text');
		const buttonState = instLi.querySelector('.instance-action__button');

		if(action === 'start') {
			statusIcon.classList.add('instance-status__icon-active');
			statusText.textContent = 'Running'
		
			buttonState.classList.remove('instance-action__play')
			buttonState.classList.add('instance-action__pause')
		}

		if(action === 'stop') {
			statusIcon.classList.remove('instance-status__icon-active');
			statusText.textContent = 'Stopped'
			
			buttonState.classList.remove('instance-action__pause')
			buttonState.classList.add('instance-action__play')
		}
	}

	removeInst(id) {
		const instForRemove = this.listInstance.querySelector(`li[data-id="${id}"]`);
		instForRemove.remove();
	}
}