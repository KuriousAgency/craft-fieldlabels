(function($)
{
	var EditorModal = Garnish.Modal.extend({

		editor:        null,

		fieldId:       null,
		fieldLayoutId: null,
		origName:      null,
		origInstruct:  null,

		init: function(editor, field)
		{
			this.base();

			this.editor = editor;
			this._proxyOnSaveLabel = $.proxy(this.onSaveLabel, this);
			this.editor.on('saveLabel', this._proxyOnSaveLabel);

			this.fieldId = field;
			this.fieldLayoutId = Relabel.getFieldLayoutId();

			var info = Relabel.getFieldInfo(field);
			this.origName     = typeof info.name         === 'string' ? info.name         : '';
			this.origInstruct = typeof info.instructions === 'string' ? info.instructions : '';

			this.$form = $('<form class="modal fitted">').appendTo(Garnish.$bod);
			this.setContainer(this.$form);

			var body = $([
				'<div class="body">',
					'<div class="field">',
						'<div class="heading">',
							'<label for="relabel-name-field">', Craft.t('Name'), '</label>',
							'<div class="instructions"><p>', Craft.t('What this field will be renamed in the CP.'), '</p></div>',
							'<div class="input">',
								'<input id="relabel-name-field" type="text" class="text fullwidth">',
								'<ul id="relabel-name-errors" class="errors" style="display: none;"></ul>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="field">',
						'<div class="heading">',
							'<label for="relabel-instruct-field">', Craft.t('Instructions'), '</label>',
							'<div class="instructions"><p>', Craft.t('What this field will be reinstructed in the CP.'), '</p></div>',
							'<div class="input">',
								'<input id="relabel-instruct-field" type="text" class="text fullwidth">',
								'<ul id="relabel-instruct-errors" class="errors" style="display: none;"></ul>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="buttons right" style="margin-top: 0;">',
						'<div id="relabel-cancel-button" class="btn">', Craft.t('Cancel'), '</div>',
						'<input id="relabel-save-button" type="submit" class="btn submit" value="', Craft.t('Save'), '">',
					'</div>',
				'</div>'
			].join('')).appendTo(this.$form);

			this.$nameField = body.find('#relabel-name-field');
			this.$nameErrors = body.find('#relabel-name-errors');
			this.$instructField = body.find('#relabel-instruct-field');
			this.$instructErrors = body.find('#relabel-instruct-errors');
			this.$cancelBtn = body.find('#relabel-cancel-button');
			this.$saveBtn = body.find('#relabel-save-button');

			this.$nameField.prop('placeholder', this.origName);
			this.$instructField.prop('placeholder', this.origInstruct);

			this.addListener(this.$cancelBtn, 'click', 'hide');
			this.addListener(this.$form, 'submit', 'onFormSubmit');
		},

		onFormSubmit: function(e)
		{
			e.preventDefault();

			// Prevent multi form submits with the return key
			if(!this.visible)
			{
				return;
			}

			this.saveLabel();
			this.hide();
		},

		onFadeOut: function()
		{
			this.base();

			this.destroy();
		},

		destroy: function()
		{
			this.base();

			this.editor.off('onSaveLabel', this._proxyOnSaveLabel);
			this.$container.remove();
			this.$shade.remove();
		},

		show: function(errors)
		{
			var label = Relabel.labels[this.fieldId];

			this.$nameField.val(label.name);
			this.$instructField.val(label.instructions);

			this.displayErrors('name', (errors ? errors.name : null));
			this.displayErrors('instruct', (errors ? errors.instructions : null));

			if(!Garnish.isMobileBrowser())
			{
				setTimeout($.proxy(function()
				{
					this.$nameField.focus()
				}, this), 100);
			}

			this.base();
		},

		saveLabel: function()
		{
			this.editor.saveLabel(
				this.fieldId,
				Relabel.getFieldLayoutId(),
				this.$nameField.val(),
				this.$instructField.val()
			);
		},

		onSaveLabel: function(e)
		{
			if(e.label && !e.errors)
			{
				this.hide();
			}
			else if(e.errors)
			{
				if(this.visible)
				{
					Garnish.shake(this.$container);
				}
			}
			else
			{

			}
		},

		displayErrors: function(attr, errors)
		{
			var $input = this['$' + attr + 'Field'];
			var $errorList = this['$' + attr + 'Errors'];

			$errorList.children().remove();

			if(errors)
			{
				$input.addClass('error');
				$errorList.show();

				for(var i = 0; i < errors.length; i++)
				{
					$('<li>').text(errors[i]).appendTo($errorList);
				}
			}
			else
			{
				$input.removeClass('error');
				$errorList.hide();
			}
		}
	});

	Relabel.Editor.Modal = EditorModal;

})(jQuery);
