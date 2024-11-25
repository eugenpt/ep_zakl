SMART_CODE_KEY = 'SMART*'

_ST = {};
_ST.dd_click = false;
_ST.body_click_initialized = false;

_ST.init = function(editor){
	if(!_ST.body_click_initialized){
		document.body.addEventListener('click', function(){	
			console.log('smart template body click')
			if(!_ST.dd_click){
				hideAllDropdowns();
			}
			_ST.dd_click = false;
		})
	}
	_ST.body_click_initialized = true;		

	_ST.add_fixer_watcher(editor);

	// _ST.add_controls(editor);
	_ST.add_mouse_events(editor);

	try{
		sugg_init;
		sugg_init(editor);
	}catch{
		
	}
}

_ST.add_add_html_actions = function(parent){};


_ST.add_fixer_watcher = function(editor){
		editor.addEventListener('input', function(e){
		  console.log('on editor change!');
			fixEverything(editor)
	})
}

_ST.add_mouse_events = function(editor){
	editor.addEventListener('mousedown', _ST.on_editor_mouse_down);
	editor.addEventListener('mouseup', _ST.on_editor_mouse_up);
	editor.addEventListener('dblclick', _ST.on_editor_dblclick);
}

_ST.on_editor_dblclick = function(event){
	console.log('DBLCLICK:');
	console.log(event);
}

_ST.on_editor_mouse_down = function(event){
	console.log('DOWN:');
	console.log(event);
	if(isMiddleMouse(event)){
		_ST.hadle_middle_mouse_down(event);

		event.preventDefault();
		event.stopPropagation();
	}
}


_ST.on_editor_mouse_up = function(event){
	console.log('UP:');
	console.log(event);
	if(isMiddleMouse(event)){
		_ST.hadle_middle_mouse_up(event);
		
		event.preventDefault();
		event.stopPropagation();
	}
}

_ST.hadle_middle_mouse_down = function(event){
	//if(!_ST.haveSelection()){
		//setTimeout(function(){
			// console.log('new dblclick')
			// var new_event = new MouseEvent('dblclick', {
		  //   'view': window,
		  //   'bubbles': true,
		  //   'cancelable': true,
		  //   'clientX': event.clientX,
		  //   'clientY': event.clientY,
		  //   'screenX': event.screenX,
		  //   'screenY': event.screenY,
		  //   'button': 0,
		  //   'buttons': 0,
		  //   'which': 1,
		  //   'composed': false,
		  //   'isTrusted': true,
		  //   'detail': 2,
		  // });
			// new_event.type = "dblclick";
			// new_event.clientX = event.clientX;
			// new_event.clientY = event.clientY;
			// new_event.buttons = 1;
			// console.log(new_event);
			// event.target.dispatchEvent(new_event);
		//}, 200);
	//}
}

_ST.hadle_middle_mouse_up = function(event){
	if(_ST.haveSelection()){
		_ST.deleteSelection(event.target);
	}
}

_ST.deleteSelection = function(){
	document.execCommand("insertText", null, '');
}

function zakl_template_is_smart(T){
  return T.code.indexOf(SMART_CODE_KEY)==0;
}

function zakl_template_plainCode(T){
  return (
  	zakl_template_is_smart(T) 
  	? T.code.slice(SMART_CODE_KEY.length)
  	: T.code
  );
}

function zakl_template_displayName(T){
	return T.desc;
	return zakl_template_plainCode(T)+': '+T.desc;
}


function fixEverything(editor){
	console.time('fixEverything');
	//if(getAllSmartPiecesCount(editor) != getAllSmartDropdownCount(editor)){
		if(getSelectorsCount(editor)!=getULCount(editor) ){
			checkAndFixSelectors(editor);
		}

		for(var type in numberSelectorFuns){
			if(getAnyNumberCount(editor, type) != getAnyNumberContentCount(editor, type)){
				checkAndFixAnyNumber(editor, type);
			}
		}
		
	//}

		deleteSpacedSpans(editor);
		deleteEmptySelectors(editor);
		fixEmptyPs(editor);

		editor.getElementsByTagName('div').forEach((e)=>{e.style=''});
		editor.getElementsByTagName('span').forEach((e)=>{e.style=''});
	console.timeEnd('fixEverything');
}

function checkAllNumber2s(editor){
	for(var n2 of editor.getElementsByClassName('number2')){
		if(isSelectorMissingContent(n2)){
			fixNumber2(n2)
		}
	}
}

function removeFromParent(elt){
	elt.parentElement.removeChild(elt);
}


function isSelectorEmptyPhantom(sel){
	return (sel.getElementsByClassName('selector-content').length==0)
}

function deleteEmptySelectors(editor){
	editor.getElementsByClassName('selector').filter(isSelectorEmptyPhantom).forEach(removeFromParent)
}

function isPEmpty(pdiv){
	return (pdiv.innerHTML=='') || ((pdiv.innerText=='\n') && (pdiv.getElementsByTagName('br').length>0))
}

function fixEmptyP(pdiv){
	pdiv.innerHTML = '&nbsp;';
}

function fixEmptyPs(editor){
	editor.getElementsByClassName('p').filter(isPEmpty).forEach(fixEmptyP)
}

function isSpanSpaced(span){
	return span.innerHTML=='&nbsp;'
}
function deleteSpacedSpans(editor){
	// editor.getElementsByTagName('span').filter(isSpanSpaced).forEach(function(e){e.innerHTML='';e.parentElement.removeChild(e)});
}

_ST.add_controls = function(editor){
  editor.style.position	= 'relative';

	var controls = _ce('div');
	controls.className = 'st-controls';
	controls.contentEditable = 'false';

	var copy = _ce('div');
	copy.className = 'st-controls-copy';
	controls.appendChild(copy);

	copy.onmousemove = onControlCopyMouseMove;
	copy.onmouseleave = deHighlightAllCopy;
	copy.onclick = onControlCopyClick;
	copy.title = "дублировать абзац";

	var join = _ce('div');
	join.className = 'st-controls-join';
	controls.appendChild(join);

	join.onmousemove = onControlJoinMouseMove;
	join.onmouseleave = deHighlightAllJoin;
	join.onclick = onControlJoinClick;
	join.title = "объединить абзацы";

	var del = _ce('div');
	del.className = 'st-controls-del';
	controls.appendChild(del);

	del.onmousemove = onControlDelMouseMove;
	del.onmouseleave = deHighlightAllDeletes;
	del.onclick = onControlDelClick;
	del.title = "удалить абзац";

	editor.prepend(controls);
};

function onControlJoinMouseMove(e){
	removeClassFromAllElts('st-controls-join-hover')
	var ps = e.target.parentElement.parentElement.getElementsByClassName('p');
	if(ps.length==1){
		return;
	}
	for(var j=0; j<ps.length ; j++){
		var p = ps[j];
		if(isYInDOM(e.clientY, p)){
			p.classList.add('st-controls-join-hover');
			if(j==0){
				ps[j+1].classList.add('st-controls-join-hover');
			}else{
				ps[j-1].classList.add('st-controls-join-hover');
			}
			break
		}
	}
}

function deHighlightAllJoin(){
	removeClassFromAllElts('st-controls-join-hover')
}

_JOIN = {};

function onControlJoinClick(e){
	var pdivs = event.target.parentElement.parentElement.getElementsByClassName('st-controls-join-hover');
  var selection = select2Nodes(pdivs[0], pdivs[1]);
  var range = selection.getRangeAt(0)
  var cont = range.cloneContents()
  var adds = ((cont.childNodes[0].innerText.slice(-1)!=' ')&&(cont.childNodes[1].innerText.slice(0,1)!=' '))?' ':'';
  var html = '<div class="p">' + cont.childNodes[0].innerHTML + adds + cont.childNodes[1].innerHTML + '</div>'

  html = html.replaceAll('&nbsp;',' ');
  html = html.replaceAll('&#8209;','-');
  html = html.replaceAll(/ +/gi,' ');
  // html = html.replaceAll('> <div','><div')

  _JOIN.html = html;

  // var html = cont.childNodes[0].innerHTML + cont.childNodes[1].innerHTML;
  console.log('onControlJoinClick: '+html)
  // nhtml = html.replace('</div>><div class="p">')
  document.execCommand("delete", null, false)
  document.execCommand("insertHTML", null, html);
  document.execCommand("insertText", null, '\n');

  fixEverything(e.target.parentElement.parentElement);
  // updateHTMLactions(e.target.parentElement.parentElement); 
}

function deHighlightAllDeletes(){
	removeClassFromAllElts('st-controls-del-hover')
}

function deHighlightAllCopy(){
	removeClassFromAllElts('st-controls-copy-hover')
}

function removeClassFromAllElts(className){
	document.getElementsByClassName(className).forEach((e)=>e.classList.remove(className))

}

function isYInDOM(y, dom){
	var rect = dom.getBoundingClientRect();
	return ((rect.y < y) && (rect.y + rect.height > y))
}

function onControlCopyMouseMove(e){
	highlightPonPos(e, 'st-controls-copy-hover')
}

function onControlDelMouseMove(e){
	highlightPonPos(e, 'st-controls-del-hover')
}

function highlightPonPos(e, className){
	// console.log(e);

	var ps = e.target.parentElement.parentElement.getElementsByClassName('p');
	for(var p of ps){
		if(isYInDOM(e.clientY, p)){
			p.classList.add(className);
		}else{
			p.classList.remove(className);
		}
	}
}

function onControlDelClick(event){
	var pdiv = event.target.parentElement.parentElement.getElementsByClassName('st-controls-del-hover')[0];
	
	selectNode(pdiv);
	document.execCommand("delete", null, false);
}

function onControlCopyClick(event){
	var pdiv = event.target.parentElement.parentElement.getElementsByClassName('st-controls-copy-hover')[0];
	pdiv.classList.remove('st-controls-copy-hover');
	var ts = pdiv.outerHTML;
	
	selectNode(pdiv, 'end');
	document.execCommand("insertHTML", null, pdiv.outerHTML); // outer -> new div contains span with content and style:indent 1cm
	document.execCommand("insertText", null, '\n');

	pdiv.classList.add('st-controls-copy-hover');
}

function getEditorSmartContent(editor){	
  // var html = editor.innerHTML;
  // var sels = getSelectors(editor);
  // sels.forEach(function(sel){
  // 	var texts = [...sel.getElementsByClassName('st-selector-list-elt')].map((elt)=>elt.innerText)
  // 	html = html.replaceAll(sel.outerHTML, '[ ' + texts.join(' // ') + ']')
  // });


  // var dummy_editor = _ce(editor.tagName);
  // dummy_editor.innerHTML = editor.innerHTML;

  var dummy_editor = editor.cloneNode(true)

  var hTOKEN_texts = {};

  var sels = getSelectors(dummy_editor);
  sels.forEach(function(sel){
  	var text = (
  		'[ '
  		 + [...sel.getElementsByClassName('st-selector-list-elt')].map(
  		 	(elt)=>elt.innerText
  		 	).join(' // ')
  		 + ' ]'
	 );

	sel.getElementsByClassName('selector-content')[0].innerText =  text;
	sel.removeChild(sel.getElementsByClassName('st-dropdown-content')[0]);
  })
  dummy_editor.id = 'temp';
  dummy_editor.style.display='hidden'
  document.body.appendChild(dummy_editor)
  var ret = prepLoadedText(dummy_editor.innerText);
  document.body.removeChild(dummy_editor);
  return ret;
}

function getClassCount(parent, className){
	return parent.getElementsByClassName(className).length;
}

function getSelectors(editor){
	return editor.getElementsByClassName('selector')
}

function getSelectorsCount(editor){
	return getClassCount(editor, 'selector');
}

function getULCount(editor){
	return getClassCount(editor, 'st-selector-ul');
}

function getAnyNumberCount(editor, type){
	return getClassCount(editor, type);
}

function getAnyNumberContentCount(editor, type){
	return getClassCount(editor, type+'-selector');
}

function getAllSmartPiecesCount(editor){
	return getClassCount(editor, 'st-piece');
}

function getAllSmartDropdownCount(editor){
	return getClassCount(editor, 'st-dropdown-content');
}



// MMP""MM""YMM   .g8""8q. `7MMF' `YMM' `7MM"""YMM  `7MN.   `7MF'.M"""bgd
// P'   MM   `7 .dP'    `YM. MM   .M'     MM    `7    MMN.    M ,MI    "Y
//      MM      dM'      `MM MM .d"       MM   d      M YMb   M `MMb.
//      MM      MM        MM MMMMM.       MMmmMM      M  `MN. M   `YMMNq.
//      MM      MM.      ,MP MM  VMA      MM   Y  ,   M   `MM.M .     `MM
//      MM      `Mb.    ,dP' MM   `MM.    MM     ,M   M     YMM Mb     dM
//    .JMML.      `"bmmd"' .JMML.   MMb..JMMmmmmMMM .JML.    YM P"Ybmmd"




function get_unique_token(len){
	return 't'+(Math.random().toString(36)+'asdfqwqer').slice(2, 2+(len|8));
}

function gen_unique_not_present_token(text){
	var t;
	while(true){
		t = get_unique_token();
		if(text.indexOf(t)<0){
			return t
		}
	}
}



function find_present_tokens_list(text, T){
	var r = [];
	for(var t in T){
		if (text.indexOf(t)>=0) {
			r.push(t);
		}
	}
	return r;
} 

function replace_tokens(text_, T, tokens_list){
	if (typeof tokens_list === "undefined"){
		tokens_list = find_present_tokens_list(text_, T);
	}
	var text = text_.slice()
	var token_indices = [];
	for(var t of tokens_list){
		var ind = text.indexOf(t)
		if(ind>=0){
			token_indices.push([t, ind])
		}
	}
	// important! bloody text replacements...
	token_indices.sortBy((x)=>-x[1])
	for(var j=token_indices.length-1;j>=0;j--){
		text = replace_part(text, token_indices[j][0], token_indices[j][1], T[token_indices[j][0]][0])
	}
	return text;
}

function replace_tokens_recursive(text_, T){
	var text = text_.slice();
	var tokens_list = find_present_tokens_list(text, T);
	while(tokens_list.length > 0){
		text = replace_tokens(text, T, tokens_list);
		// console.log(text);

		tokens_list = find_present_tokens_list(text, T);
	}
	return text;
}

function find_deepest_selectors(text){
	return ep_matchAll(/\[([^\[\]]+)\]/gi, text);
}

function text_is_smart_zakl_template(text){
	return find_deepest_selectors(text).length > 0
}

function zakl_template_content_is_smart(T){
	return text_is_smart_zakl_template(T.opis) || text_is_smart_zakl_template(T.zakl)
}

function replace_matches_with_tokens(text, matches,  TOKENS){
	_text = text.slice();
	for(var sj=matches.length-1 ; sj>=0 ; sj--){
		var t = gen_unique_not_present_token(_text);
		TOKENS[t] = [matches[sj][0], matches[sj][1]];
		_text = replace_match(_text, matches[sj], t);
	}
	return _text;
} 

function replace_selectors_with_tokens_recursive(text, TOKENS){
	var _text = text.slice();

	var selects = find_deepest_selectors(_text);
	while(selects.length>0){
		_text =  replace_matches_with_tokens(_text, selects,  TOKENS)
		selects = find_deepest_selectors(_text);
	}	

	return _text;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////



function onSelector(sel){
	if(sel.tagName=='SPAN'){
		sel = sel.parentElement;
	}
	var was_visible = isSelVisible(sel);
	hideAllDropdowns();
	if (!was_visible) {
		sel.classList.toggle('st-show');
	} 
}

function onSelectorClick(event){
	_ST.dd_click = true;
	console.log('onSelectorClick');
	console.log(event);
	onSelector(event.target);
	// event.stopPropagation();
}

function onSelectorInsidesClick(event){

	console.log('onSelectorInsidesClick');
	console.log(event);
	onSelector(event.target.parentElement);
	event.stopPropagation();
}

function isSelVisible(sel){
	return sel.classList.contains('st-show');
}

function onLiClick(event){
	_ST.dd_click = true;
	console.log(event);
	var li = event.target;
	console.log('LI=')
	console.log(li)
	var sel = getSelector(li);
	setSelectorValue ( sel, _LI_options[li.id] );
	sel.classList.remove('st-show');
}

function getSelector(li){
	return li.parentElement.parentElement.parentElement;
}

function correctNumbersNoSpan(sel){
		if(sel.getElementsByTagName('span').length == 0){
			sel.innerHTML	= sel.innerHTML.replace(/(.+)<div/,'<span class="selector-content">$1</span><div')
		}
}

function getClickSelect(event){
	var sel = event.target;
	while(sel.classList.contains('selector')){
		sel = sel.parentElement;
	}
	return sel;
}

function onSelectorMouseDown(e){
	console.log('mouse down!!')
	console.log(e)
	if(e.which==3){

		e.stopPropagation();
		e.preventDefault();

		// otherwise - the event is fired from simple text that's been placed instead of selector
		setTimeout(function(){
			setSelectorValue(e.target)
		},10);
	}
}

function updateSelectorDOMactions(sel){
		sel.onclick = onSelectorClick;
		sel.onmouseup = onSelectorMouseDown;
		sel.oncontextmenu = function(e){
			console.log('oncontext')
			e.preventDefault();
			return false;
		};
		sel.getElementsByClassName('selector-content')[0].onclick = onSelectorInsidesClick;

		sel.getElementsByTagName('li').forEach((li)=>{
			li.onclick = onLiClick;
		})	
}

function getSelectorTempVal(sel){
	return sel.getElementsByClassName('temp-number-display')[0]
						.innerHTML
						.replaceAll('&#8209;','-')
						.replaceAll('‑','-')
}

function updateAnyNumberSelDOMactions(sel, type){
	if(!type){
		type = getNumberSelectType(sel);
	}

	correctNumbersNoSpan(sel);
	sel.onclick = onSelectorClick;
	var dd_elt = sel.getElementsByClassName('st-dropdown-content')[0];
	if(!dd_elt){
		addAnyNumberDropDown(sel, type)
		dd_elt = sel.getElementsByClassName('st-dropdown-content')[0];
	}

	if(numberSelectorFuns[type]){
		numberSelectorFuns[type].set_dropdown_DOM_action(dd_elt)
	} else {
		console.warn('No numberSelectorFuns for type=['+type+']')
	}

	dd_elt.onclick = function(event){
		sel.classList.remove('fresh');
		hideAllDropdowns();
		event.stopPropagation();
		//sel.getElementsByTagName('span')[0].innerHTML = getSelectorTempVal(sel);
		setSelectorValue(sel, getSelectorTempVal(sel)); // for better undo?
	}
}

function updateNumber1SelDOMactions(sel){
	updateAnyNumberSelDOMactions(sel, 'number1');
}



function updateNumber2SelDOMactions(sel){
	updateAnyNumberSelDOMactions(sel, 'number2');	
}

function updateHTMLactions(parent){
	parent.getElementsByClassName('selector').forEach(updateSelectorDOMactions);

	for(var type in numberSelectorFuns){
		parent.getElementsByClassName(type).forEach((elt)=>updateAnyNumberSelDOMactions(elt, type));
	}

	_ST.add_add_html_actions(parent);
}

function pretty_round_number(n){
	if(n<4){
		return n.toFixed(1).replace('.', ',').replace(',0','');
	}
	if((n>=4.25)&&(n<=4.75)){
		return (4.5).toFixed(1).replace('.', ',');
	}
	if(n<35){
		return n.toFixed(0);
	}
	return Math.floor(n / 5)*5;
}

function neighbour_number(n){
	// for dash when two are equal
	if(n<4){
		return n+0.1;
	}
	if((n>=4.25)&&(n<=4.75)){
		return 5
	}
	if(n<35){
		return n + 1;
	}
	return (Math.floor(n / 5) + 1)*5;	
}


function hideAllDropdowns(){
	_('.st-show').forEach((e)=>{e.classList.remove('st-show')});
}

numberSelectorFuns = {
	number1: {
		gen_dropdown_html: function genNumber1DropDownHTML(val){
			return '<div class="st-dropdown-content number1-selector"><span>1.2.3.4.5.6.7.8.9.10.....................100</span></div>'
		},
		set_dropdown_DOM_action: function setNumber1DropDownDOMaction(dd_elt){
			dd_elt.onmousemove = function(event){
				var rect = dd_elt.getClientRects()[0];
				var v =	pretty_round_number( 
						gen_proper_number_from_portion(
							((event.clientX - rect.x) / rect.width)
							)
					)


				dd_elt.parentElement.getElementsByClassName('temp-number-display')[0].innerHTML = v;
			};
		}
	},
	number2: {
		gen_dropdown_html: function genNumber1DropDownHTML(val){
			return (
				'<div class="st-dropdown-content number2-selector">'
				+'<span class="number2-grid number2-grid-5">5</span>'
				+'<span class="number2-grid number2-grid-10">10</span>'
				+'<span class="number2-grid number2-grid-50">50</span>'
				+'</div>'
			)
		},
		set_dropdown_DOM_action: function setNumber2DropDownDOMaction(dd_elt){
			dd_elt.onmousemove = function(event){
				var rect = dd_elt.getClientRects()[0];
				var x = gen_proper_number_from_portion(
					( (event.clientX - rect.x) / rect.width)
				);
					
				var y = gen_proper_number_from_portion(
					( (event.clientY - rect.y) / rect.height)
				);

				dd_elt.parentElement.getElementsByClassName('temp-number-display')[0].innerHTML = (
					pretty_round_number(x) + 'x' + pretty_round_number(y)
				);
			};
		}
	},
	number2dash: {
		gen_dropdown_html: function genNumber1DropDownHTML(val){
			return (
				'<div class="st-dropdown-content number2dash-selector">'
				+'<span class="number2-grid number2-grid-5">5</span>'
				+'<span class="number2-grid number2-grid-10">10</span>'
				+'<span class="number2-grid number2-grid-50">50</span>'
				+'</div>'
			)
		},
		set_dropdown_DOM_action: function setNumber2DropDownDOMaction(dd_elt){
			dd_elt.onmousemove = function(event){
				var rect = dd_elt.getClientRects()[0];
				var x = gen_proper_number_from_portion(
					( (event.clientX - rect.x) / rect.width)
				);
					
				var y = gen_proper_number_from_portion(
					( (event.clientY - rect.y) / rect.height)
				);

				var minV = min(x,y);
				var maxV = max(x,y);

				if(pretty_round_number(minV) == pretty_round_number(maxV)){
					maxV = neighbour_number(maxV);
				}

				dd_elt.parentElement.getElementsByClassName('temp-number-display')[0].innerHTML = (
					pretty_round_number(minV) + '&#8209;' + pretty_round_number(maxV)
				);
			};
		}
	},
	number3: {
		gen_dropdown_html: function genNumber1DropDownHTML(val){
			return (
				'<div class="st-dropdown-content number3-selector">'
				+'<span>1.2.3.4.5.6.7.8.9.10.....................100</span>'
				+'<br />'
				+'<br />'
				+'<span>1.2.3.4.5.6.7.8.9.10.....................100</span>'
				+'<br />'
				+'<br />'
				+'<span>1.2.3.4.5.6.7.8.9.10.....................100</span>'
				+'</div>'
			)
		},
		set_dropdown_DOM_action: function setNumber3DropDownDOMaction(dd_elt){
			dd_elt.getElementsByTagName('span').forEach((elt)=>{
				elt.onmousemove = function(event){
					console.log(event)
					var rect = elt.getClientRects()[0];
					var v =	pretty_round_number( 
							gen_proper_number_from_portion(
								((event.clientX - rect.x) / rect.width)
								)
						)

					var temp_display = elt.parentElement.parentElement.getElementsByClassName('temp-number-display')[0];

					our_j = [...elt.parentElement.getElementsByTagName('span')].indexOf(elt);

					old_nums = temp_display.innerHTML.replaceAll('x','х').split('х');
					old_nums[our_j] = v;
					temp_display.innerHTML = old_nums.join('х');
				};
			});
		}
	},
}



//
function genAnyNumberTempDisplay(val){
	val = val || '';
	return '<span class="temp-number-display">'+val+'</span>'
}

function genAnyNumberSelectHTML(type, val){
	return (
		'<div class="st-piece number '+ type +' fresh">'
		+ '<span class="selector-content">'+val+'</span>'
		+ genAnyNumberTempDisplay(val) 
		+ numberSelectorFuns[type].gen_dropdown_html()
		+'</div>'
	)
}

function getNumberSelectType(sel){
	for(var c of sel.classList){
		if(numberSelectorFuns[c]){
			return c
		}
	}
}

function addAnyNumberDropDown(sel, type){
	if(!type)
		type = getNumberSelectType(sel);
	sel.innerHTML += (
		genAnyNumberTempDisplay(getPresetValue(sel)) 
		+ numberSelectorFuns[type].gen_dropdown_html()
	);
}

function addNumber1DropDown(sel){
	addAnyNumberDropDown(sel, 'number1');
}

function addNumber2DropDown(sel){
	addAnyNumberDropDown(sel, 'number2');
}

function gen_proper_number_from_portion(p){
	if(p<0.5){
		return 1 + p*20;
	}

	return 10**( 2 * p);
}

function selectNode(node, mode){
	var range = document.createRange();
	if(mode=='start'){
	  range.setStart(node, 0)
	} else if (mode=='end'){
		range.selectNode(node);
		range.collapse()
	} else {
		range.selectNode(node)//.getElementsByClassName('selector-content')[0])
	}
	var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range)

  return selection;
}

function select2Nodes(node1, node2){
	var range = document.createRange();

	range.selectNode(node2);
	range.collapse()
	range.setStart(node1, 0)

	var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range)

  return selection;
}

function getPresetValue(sel){
	return sel.getElementsByClassName('selector-content')[0].innerHTML;
}

function setSelectorValue(sel, val){
	console.log('setSelectorValue')
	console.log(sel)
	if(sel.tagName=='SPAN'){
		sel = sel.parentElement;
	}
	var sel_parent = sel.parentElement;
	if(typeof val == 'undefined'){
		val = getPresetValue(sel);
	}
	// sel.contentEditable = true;
	console.log('setSelectorValue')
	console.log(sel);

	selectNode(sel);

  console.log(val);
  console.log(HTMLtoText(val))
  console.log(makeEditorContentHTML( HTMLtoText(val) ));

  // document.execCommand('insertText', false, val);
  document.execCommand('delete', false)
  if (val.length>0){
		document.execCommand('insertHTML', false, makeEditorContentHTML( HTMLtoText(val) ));
	}
	
  fixEverything(sel_parent);
  //checkAndFixSelectors(sel_parent);
  updateHTMLactions(sel_parent);

	// sel.getElementsByTagName('span')[0].innerHTML = val;
	// sel.contentEditable = false;
}

ID_selectors = {max:-1};

function gen_unique_selector_id(){
	ID_selectors.max++;
	return 'st-sel-'+ID_selectors.max;
}

function gen_selector(options, selected_ix) {
	selected_ix = selected_ix | 0;

	var container = _ce('div');

	container.id = gen_unique_selector_id();
	ID_selectors[container.id] = {'type':'selector', 'options':options, 'selected_ix':selected_ix};
	container.classList.add('st-piece');
	container.classList.add('selector');
	// container.contentEditable = 'false';

	var span = _ce('span');
	span.classList.add('selector-content');
	var value_text = options[selected_ix];
	// if (value_text.length==0)
	// 	value_text = '&nbsp';
	span.innerHTML = value_text;

	// span.onclick = onSelectorInsidesClick;

	container.appendChild(span);

	// container.onclick = onSelectorClick

	addSelDropDown(container);

	return container;
}


_LI_options = {max:0};
function gen_li_id(){
	_LI_options.max++;
	return 'li-' + _LI_options.max;
}

function addSelDropDown(sel){
	var dd = _ce('div');
	dd.classList.add('st-dropdown-content');
	var ul = _ce('ul');
	ul.classList.add('st-selector-ul')
	for(var option of ID_selectors[sel.id]['options']){
		var li = _ce('li');
		li.id = gen_li_id();
		_LI_options[li.id] = option;
		li.innerHTML = option;
		li.classList.add('st-selector-list-elt')
		// li.onclick = onLiClick;
		ul.appendChild(li);
	}
	dd.appendChild(ul);
	sel.appendChild(dd);	
}

function fixSelector(sel){
	addSelDropDown(sel);
	updateSelectorDOMactions(sel)
}

function fixAnyNumber(sel, type){
	if(!type){
		type = getNumberSelectType(sel);
	}
	addAnyNumberDropDown(sel, type);
	updateAnyNumberSelDOMactions(sel, type);
}

function isSelectorMissingContent(sel){
	return sel.getElementsByClassName('st-dropdown-content').length==0;
}


function checkAndFixSelectors(editor){
	console.log('checkAndFixSelectors('+editor.id+')');
		editor.getElementsByClassName("selector")
					.filter(isSelectorMissingContent)
					.forEach(fixSelector);
}

function checkAndFixAnyNumber(editor, type){
	console.log('checkAndFixAnyNumber('+editor.id+', '+type+')');
		editor.getElementsByClassName(type)
					.filter(isSelectorMissingContent)
					.forEach((elt)=>fixAnyNumber(elt, type));
}


function spaceIfEmpty(s){
	return (s.length==0)?'&nbsp':s;
}

function hideAllDropdowns(){
		_('.st-show').forEach((e)=>{e.classList.remove('st-show')});
}

function setNoIndent(editor, no_indent){
	if(no_indent){
		editor.classList.add('no-indent');	
	}else{
		editor.classList.remove('no-indent');
	}
}


function updateSuggest(){

}


function makePlainTextElements(text){
	if (text.length==0){
		// return [];
	}
	var lines = text.split('\n');

	var r = [_span(lines[0])];
	for(var lj=1 ; lj<lines.length ; lj++) {
		r.push(_ce('br'));
		r.push(_span(lines[lj]));
	}
	return r;
}


function splitSelectorText(text){
	var r;
	if(text.indexOf('//')>=0){
		r = text.split('//');
	} else {
		r = text.split('/');
	}
	return r.map((s)=>s.trim())
}

function splitSelectorText_withTokens(text, TOKENS){
	return splitSelectorText(text).map((s)=>replace_tokens_recursive(s, TOKENS))
}


function makePlainTextHTML_midp(text){
	if (text.length==0){
		return '';//'&nbsp';
	}
	var r = text.split('\n')
						  .map(escapeHtml)
						  // .map(spaceIfEmpty)
						  .join('</div><div class="p">');

	return r;
}

function numberSelectorTypeByValue(val){
	if(val.contains('-')){
		if(val.split('-').length==2){
			return 'number2dash'
		} else {
			return null
		}
	}
	var nums = val.replaceAll('х','x').split('x');
	if(nums.length<4){
		return 'number'+nums.length;
	}
}

function genNumbersSelHTML(s){
	var type = numberSelectorTypeByValue(s);
	if((type)&&(numberSelectorFuns[type])){
		return genAnyNumberSelectHTML(type, s);
	} else {
		return s
	}
}

function get_possible_NumbersSel(text){
	return ep_matchAll(/([0-9][0-9,\.хx\-]*)\s*(см|мм|гр[ \.\,\)])/gi, text)
}

function addNumbersSel(text_){
	var text = text_.slice();

	var matches = get_possible_NumbersSel(text);

	for(var match of matches.reverse()){
		var html = genNumbersSelHTML(match[1]);
		text = replace_match(text, match, match[0].replace(match[1], html));
	}

	return text;
}


function makeEditorContentHTML(text, addp){
	TOKENS = {};

	var _text = replace_selectors_with_tokens_recursive(text, TOKENS);

	tokens_list = find_present_tokens_list(_text, TOKENS);
	token_matches = tokens_list.map((t)=>RegExp(t,'gi').exec(_text)).sortBy((m)=>-m.index)

	var r = '';
	if (addp)
		r+='<div class="p">';	
	var last_start = 0;
	for(var sj=0 ; sj<token_matches.length ; sj++){
		r+=addNumbersSel(
				makePlainTextHTML_midp(_text.slice(last_start, token_matches[sj].index))
			);

		r += gen_selector( splitSelectorText_withTokens(TOKENS[token_matches[sj][0]][1], TOKENS)).outerHTML;

		last_start = token_matches[sj].index + token_matches[sj][0].length;
	}
	r += addNumbersSel(
				makePlainTextHTML_midp(_text.slice(last_start, _text.length))
		);

	if (addp)
		r+='</div>';	

	return r;

}


function makeAndFillEditorContent(editor, text){
	editor.innerHTML = makeEditorContentHTML(text, 1);
	// makeEditorContent(text).forEach((e)=>editor.appendChild(e));
	_ST.add_controls(editor);
	fixEverything(editor);
	updateHTMLactions(editor);
}



/////////////////////////
//


dropdown_click = 0;
function onDropDownClick(){
  dropdown_click=1;
}

_ST.haveSelection = function(){
	return isTextSelected();
}

function isTextSelected(){
	try{
		return window.getSelection().getRangeAt(0).toString().length > 0;
	} catch {
		return false;
	}
}
