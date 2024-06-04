import moment from 'moment';

export default class Render {
	constructor(container) {
		this.container = container;
		this.widget;
		this.listLog;
		this.error = {
			container: null,
			message: null,
		}

		this.init()
	}

	init() {
		this.renderWidget();
	}

	renderWidget() {
		const wrap = document.createElement('section');
		wrap.classList.add('widget-container');

		const widget = document.createElement('article');
		widget.classList.add('widget', 'worklog');

		const title = this.renderTitle();
		const content = this.renderContent();
		const error = this.renderError();
		
		widget.append(title);
		widget.append(error);
		widget.append(content);
		
		wrap.append(widget);

		this.saveElements(widget);
	 	this.container.append(wrap)
	}

	renderTitle() {
		const title = document.createElement('h2');
		title.classList.add('widget-title');
		title.textContent = `Worklog:`;

		return title;
	}

	renderError() {
		const error = document.createElement('div');
		error.classList.add('worklog-error', 'hidden-item');
		error.dataset.name = 'error-container';
		error.innerHTML = `
			<div class="worklog-error__message" data-name="error-message">
				Нет подключения к SSE
			</div>
		`
		return error;
	}

	renderContent() {
		const content = document.createElement('ul');
		content.classList.add('widget-content', 'list-log');
		content.dataset.name = "list-log";

		return content;
	}


	saveElements(widget) {
		this.widget = widget;
		this.listLog = widget.querySelector('[data-name="list-log"]')
		this.error.container = widget.querySelector('[data-name="error-container"]');
		this.error.message = widget.querySelector('[data-name="error-message"]');
	}

	renderNote(note) {
		const time = moment(note.time).locale('ru').format('HH:mm:ss DD.MM.YY')

		const noteLi = document.createElement('li');
		noteLi.classList.add('note');

		noteLi.innerHTML = `
			<div class="note-time">
				${time}
 			</div>
			<div class="note-block">
				<p class="note-block__title">
					Server:
				</p>
				<p class="note-block__text">
					${note.idServer}
				</p>
			</div>
			<div class="note-block">
				<p class="note-block__title">
					INFO:
				</p>
				<p class="note-block__text">
					${note.text}
				</p>
			</div>
		`
		return noteLi;
	}

	addNoteToList(note) {
		const newLog = JSON.parse(note)
		const newNote = this.renderNote(newLog);
		this.listLog.append(newNote);
	}

	showError() {
		this.error.container.classList.remove('hidden-item');
	}

	hideError() {
		this.error.container.classList.add('hidden-item');
	}


}