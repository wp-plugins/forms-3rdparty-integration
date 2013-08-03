(function($){
	var lib = {
		id: function() {
			/// generate a "unique" id
			
			// "GUID" (Math.random()*16|0).toString(16) // http://stackoverflow.com/a/2117523/1037948
			return (Date.now || function() { return +new Date; })(); // http://stackoverflow.com/a/221357/1037948
		}//--	fn	id
		,
		action: function(e) {
			/// Do what the button says, usually involving a target and an after-effect
			console.log('event', e);

			var $o = $(this)
				, $target = $o.closest( $o.data('rel') )	//get the target off the link "rel", and find it from the parent-chain
				, after = $o.data('after')
				, action = $o.data('actn')
				;

			console.log('Action -- ', after, action, $target);

			// toggling not handled by link, so allow...not the cleanest, maybe add another data- ?
			if(action.indexOf('toggle') < 0) e.preventDefault();

			switch(action) {
				case 'clone': lib.clone($target, after); break;
				case 'remove': lib.remove($target, after); break;
				case 'toggle':
				case 'toggle-sibling': lib.toggle($target, after, action); break;
			}

		}//--	fn	action
		,
		clone: function($target, after) {
			var	$clone = $target.clone();	//clone the target so we can add it later
			
			// perform requested post-operation
			lib.afterClone[after]($target, $clone, lib.id());

			//some more row properties
			$clone.toggleClass('alt');
			
			//add the clone after the target
			$target.after( $clone );
		}//--	fn	clone
		,
		remove: function($target, after) {
			$target.empty().remove();
			//lib.afterRemove[after]($target);
		}//--	fn	remove
		,
		toggle: function($container, after, action) {
			/// toggle the given container, or maybe a sibling, depending on the action
			var $target = action == 'toggle' ? $container : $container.find(after);

			$target.toggleClass('collapsed');
		}
		,
		afterClone: {
			row: function($target, $clone, newid) {
				lib.updateClonedRow(newid, $clone, /(mapping\]\[)([\d])/);
			}//--	fn	afterClone.row
			,
			metabox: function($target, $clone, newid) {
				//delete extra rows, fix title
				$clone.find('tr.fields').slice(1).empty().remove(); // only save the first row
				var $title = $clone.find('h3 span:last');
				$title.html( $title.html().split(':')[0] );
				lib.hookToggleInit( $clone.find('input.hook') );
				
				
				//reset clone values and update indices
				lib.updateClonedRow(newid, $clone, /(\[)([\d])/);
			}//--	fn	afterClone.metabox
		}//--	afterClone
		,
		updateClonedRow: function(newid, $clone, regex) {
			//reset clone values and update indices
			$clone.find('input,select').each(function(i, o){
				var $o = $(o)
					, id = $o.attr('id').split('-')
					, name = $o.attr('name')
					;
				
				$o.attr('id', id[0]+'-'+newid);
				$o.attr('name', name.replace(regex, '$1'+newid));
				
				//reset values
				if( $o.attr('type') != 'checkbox' ){
					$o.val('');
				}
				else {
					$o.removeAttr('checked');
				}
			});
			$clone.find('label').each(function(i, o){
				var $o = $(o);
				
				//set the for equal to its closest input's id
				$o.attr('for', $o.siblings('input').attr('id'));
			});
		}//--	fn	lib.updateClonedRow
		,
		hookToggleInit: function($input) {
			/// // should fire appropriate toggle action to close if option is disabled
			if(!$input.is(':checked')) $input.trigger('click');
		}//--	fn	hookToggleInit
	};

	$(function() {
		// setup elements
		var $plugin = $('#' + Forms3rdPartyIntegration_admin.N)
			, $metaboxes = $plugin.find('.meta-box')
		;

		// clone / delete row or metabox, toggle container or sibling, etc
		$plugin.on('click', '.actn', lib.action);

		//collapse all metabox sections initially
		$plugin.find('div.postbox')
			.addClass('collapsed')
			.find('h3').prepend('<span class="actn" data-actn="toggle" data-rel=".postbox">[+]</span> ')
			;

		// toggle hooks element
		$plugin.find('input.hook').each(function(i,o) {
			lib.hookToggleInit($(o));
		});

	});
})(jQuery);

/// original
(function($){
	return false;



	var lib = {
		updateClonedRow: function(count, $clone, regex) {
			//reset clone values and update indices
			$clone.find('input,select').each(function(i, o){
				var $o = $(o)
					, id = $o.attr('id').split('-')
					, name = $o.attr('name')
					, suffix = ( $o.hasClass('a') ? 'a' : 'b' )
					;
				
				$o.attr('id', id[0]+'-'+count+suffix);
				$o.attr('name', name.replace(regex, '$1'+count));
				
				//reset values
				if( $o.attr('type') != 'checkbox' ){
					$o.val('');
				}
				else {
					$o.attr('checked', '');
				}
			});
			$clone.find('label').each(function(i, o){
				var $o = $(o);
				
				//set the for equal to its closest input's id
				$o.attr('for', $o.siblings('input').attr('id'));
			});

		}//--	fn	lib.updateClonedRow
		,
		cloneRowClick: function(e) {
			e.preventDefault();
			
			var $o = $(this)
				, $target = $o.parentsUntil( $o.attr('rel') ).parent()	//get the target off the link "rel", and find it from the parent-chain
				, $clone = $target.clone()				//clone the target so we can add it later
				, count = $target.index()+'b'				//since we're always cloning the last row, its index is the number of rows
				;
			
			lib.updateClonedRow(count, $clone, /(mapping\]\[)([\d])/);
			
			//some more row properties
			$clone.toggleClass('alt');
			
			//add the clone after the target
			$target.after( $clone );
		}//--	fn	lib.cloneRowClick
		,
		deleteTargetClick: function(e){
			e.preventDefault();
			var $o = $(this)
				, $target = $o.parentsUntil( $o.attr('rel') ).parent();
			$target.empty().remove();
		}//--	fn	lib.deleteTargetClick
		,
		cloneMetabox: function(e){
			e.preventDefault();
			var $o = $(this)
				, $target = $('div.metabox-holder').find( $o.attr('rel') )	//get the target off the link "rel", and find it from the parent-chain
				, $clone = $target.clone()				//clone the target so we can add it later
				, count = $target.index()+'q'				//since we're always cloning the last row, its index is the number of rows
				;
			
			//delete extra rows, fix title
			$clone.find('tr.fields').slice(1).empty().remove(); // only save the first row
			var $title = $clone.find('h3 span:last');
			$title.html( $title.html().split(':')[0] );
			
			//reset clone values and update indices
			lib.updateClonedRow(count, $clone, /(\[)([\d])/);
			
			//add the clone after the target
			$target.after( $clone );
		}//--	fn	cloneMetabox
	};
	
	/**
	 * Toggle hook section based on related checkbox checked status, relative to parent container
	 * @param input the DOM input
	 */
	var toggleHookSectionFromCheckbox = function(input){
		var $a = $(input)
			, $container = $a.parents('div.postbox')
			, $target = $container.find('section.hook-example')
			;
		
		//console.log($a, $a.attr('checked'), $target);
		$target.toggle( 'checked' == $a.attr('checked') );
	};
	
	$(function(){
		var $pluginWrap = $(window.pluginWrapSelector);
		//must loop through each, so behavior attached individually?
		
		var $form = $pluginWrap.find('form')
			;

		// attach click behaviors
		$form
			.delegate('tr a.b-clone', 'click', lib.cloneRowClick)
			.delegate('tr a.b-del', 'click', lib.deleteTargetClick)
			.delegate('#b-clone-metabox', 'click', lib.cloneMetabox)
			.delegate('.button a.b-del', 'click', lib.deleteTargetClick)
			;
		
		/* ------------------ GENERAL PAGE BEHAVIOR -------------------- */
		
		//collapse all sections
		$pluginWrap.find('div.postbox')
			.addClass('collapsed')
			.find('h3').prepend('<span class="actn" data-actn="toggle">[+]</span> ')
			;

		//click behavior for handle
		$pluginWrap.delegate('h3 > span', 'click', function(){
			var $a = $(this)
				, $container = $a.parents('div.postbox');
			$container.toggleClass('collapsed', !$container.hasClass('collapsed'));

			//change text if "toggle button"
			//otherwise, change the sibling text
			if(!$a.hasClass('b-toggle')){
				$a = $a.siblings('.b-toggle');
			}
			$a.html( $container.hasClass('collapsed') ? '[+]' : '[-]' );
		});
		
		//add optional tags
		var $o, defaultText;
		$pluginWrap.find('dd[rel]').each(function(i,o){
			$o = $(o);
			defaultText = $o.attr('rel');
			if(defaultText){
				defaultText = ', default \''+ defaultText + '\'';
			}
			$o.prepend('<em>(OPTIONAL'+defaultText+')</em> ');
		});
		
		//hook toggle
		$pluginWrap.delegate('input.hook', 'change', function(){
			toggleHookSectionFromCheckbox(this);
		});
		//initial toggle
		$pluginWrap.find('input.hook').each(function(i,o){ toggleHookSectionFromCheckbox(o); });

	});

	//load ui if not available...lame
	if( !jQuery().sortable ){
		(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t);s=s[s.length-1];g.async=1;
		g.src="//ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js";
		s.parentNode.insertBefore(g,s)}(document,"script"));
	}
	
	//wait to call sortable
	$(window).bind('load', function(){
		//sortable rows
		$(window.pluginWrapSelector).find('table.mappings tbody').sortable()
			.end()
			.find('div.meta-box-sortables div.meta-box').sortable({distance:30, tolerance:'pointer'});
	});

	
})(jQuery);