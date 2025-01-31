_M = _ce('div');
_M.id='livesearch';
_M.style.width='10px';
_M.style.height='10px';
_M.style.backgroundColor='#ddd';
_M.style.position='absolute';
_M_List = _ce('ul');
_M.appendChild(_M_List);



_C = {x:null, y:null}
_TEXT = {before:'', selected:'', after:''}
_SUGGS = []
_SUGG_current = 0


_SUGG_SELECTED_CLASSNAME = 'selected';

_SUGG_after_click_timeout = null;

_MAX_SUGG_BEFORE_WORDS = 10;

_order_by_both_rel_word_log_weight = 2;

_SUGG_VERTEBRAE_EQ_ADD_COUNT = 10000;

__SUGG_VERTEBRAE_EQ_ADD_LOG10_WEIGHT = Math.log10(_SUGG_VERTEBRAE_EQ_ADD_COUNT);

function sugg_init(editor){
	console.log('sugg_init on #' + editor.id);
	if(!_M.parentElement){
		document.body.appendChild(_M);
	}
	editor.addEventListener('click', function(event){
		// updateCursorPosition();
	});
	document.body.addEventListener('mousedown', function(event){
		sugg_clear()
	});
	editor.addEventListener('mouseup', function(event){
		// updateCursorPosition();
		clearTimeout(_SUGG_after_click_timeout);
		if (isTextSelected()){
			updateCursorPosition();
		}else{
			_SUGG_after_click_timeout = setTimeout(
				function(){
					// updateCursorPosition();
				}
				,1500
			);
		}
	});
	editor.onkeydown = function(event){
		console.log('keydown: ' + event.key);
		console.log(event)
		if( sugg_add_handleKeyDown(event)
			|| (
				(sugg_isShowing())
				&&
				(sugg_handleKeyDown(event))
				)
		){
			event.stopPropagation();
			event.preventDefault();
		}
	};
	editor.addEventListener('keyup', function(event){
		console.log('keyup: ' + event.key);
		console.log(event)
		updateCursorPosition()

		if(sugg_add_handleKeyUp(event)){
			event.stopPropagation();
			event.preventDefault();			
		}

	});	
}

function sugg_add_handleKeyDown(event){
	return false
}

///////////////////////////
//



function substituteTwoLastCharsWith(text){
	selectTwoLastChars();

	document.execCommand('insertText', false, text);
}

function selectTwoLastChars(){
	sel = window.getSelection()
	range = sel.getRangeAt(0)

	if (range.startOffset>0) {
		range.setStart(range.startContainer, range.startOffset-2)
	}
}


function sugg_add_handleKeyUp(event){
	// if(
	// 	( event.key == '.' )
	// 	&& ( _TEXT.before.slice(_TEXT.before.length-2) == ' .' )
	// ){
	// 	console.log('sugg_add_handleKeyDown "." after a space!  TEXT=')
	// 	console.log(_TEXT);

	// 	substituteTwoLastCharsWith('.');
	// 	return true
	// }else if(
	// 	( event.key == ',' )
	// 	&& ( _TEXT.before.slice(_TEXT.before.length-2) == ' ,' )
	// ){
	// 	console.log('sugg_add_handleKeyDown "," after a space!  TEXT=')
	// 	console.log(_TEXT);
	// 	substituteTwoLastCharsWith(',');
	// 	return true
	// }

	return false;
}

function sugg_handleKeyDown(event){
	if(
		( event.key == 'Tab' )
		|| ( (event.code=='KeyL') && (event.ctrlKey))
	){
		sugg_append_word();
		return true;
	}else if( event.key == 'Escape' ){
		sugg_clear();
		return true;
	}else if(
		( event.key == 'ArrowUp' )
		|| ( (event.code=='KeyK') && (event.ctrlKey))
	){
		sugg_selectPrevious();
		return true;
	}else if(
		( event.key == 'ArrowDown' )
		|| ( (event.code=='KeyJ') && (event.ctrlKey))
	){
		sugg_selectNext();
		console.log('NEXT SUGGESTION!!')
		return true;
	}else if(
//		( event.key == 'Enter' ) || 
		( (event.code=='KeyM') && (event.ctrlKey))
	){
		sugg_append_whole_sugg();
		return true;		
	}

	return false;
}

function sugg_isShowing(){
	return (!_M.hidden) && sugg_getSelectedElement();
}


function sugg_getFirstWord(sugg){
	if(sugg[0]==' '){
		word = ' ' + sugg.slice(1).split(' ')[0]
	} else {
		word = sugg.split(' ')[0]
	}
	return word
}

function sugg_append_word(){
	sugg = sugg_getElementText(sugg_getSelectedElement());
	console.log('Adding first word of ['+sugg+']')

	word = sugg_getFirstWord(sugg);

	console.log(' the word of choice is... ['+word+']')

	insertSuggestion(word);
}

function insertSuggestion(s){
	insertTextAtCaret(
		s + (
			(_TEXT.after.slice(0,1) == ',')
			? '' : ' '
		)
	);
}

function sugg_append_whole_sugg(){
	sugg = sugg_getSelectedElement().innerText;
	console.log('Adding whole of ['+sugg+']')
	insertSuggestion(sugg);
}

//https://stackoverflow.com/a/2925633
function insertTextAtCaret(text) {
	console.log('inserting text at caret ['+text+']')
	document.execCommand('insertText', false, text);
	return
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            var tnode = document.createTextNode(text)
            range.insertNode( tnode );
            range.setStartAfter( tnode )
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}

LAST_SUGG_BEFORE = null;

function getPhraseSuggesions_old(before, onload){
	if(before==LAST_SUGG_BEFORE){
		return
	}

	try {
		_SUGG_REQUEST.abort()
	} catch {}

	sugg_clearWrong();

	LAST_SUGG_BEFORE = before;


	// Results = [{phrase:before+' test'}, {phrase:before+' test2'}];

	console.log('sugg phrase search for "'+before+'..."')

	manager.searchPhrases(before, 10).then((r)=>{
		console.log('for "'+before+'..." found '+r.length + ' matches');
		onload(r);
	});
	// onload(Results)
}

const vertebraeRegex = /\b(?:C[1-7]|Th?(?:1[0-2]|[1-9])|L[1-5]|S[1-5]|Co[1-5])/;

function hasVertebraeAbbreviation(input) {
  return vertebraeRegex.test(input);
}

let currentRequestId = null; // Global or scoped variable to track the current request
let lastBefore = null;
async function getPhraseSuggesions(before, limit = 10) {
  if(lastBefore == before){
  	return
  }
  lastBefore = before;
  sugg_clearWrong();
  manager.abort();
  const requestId = Symbol(); // Unique ID for this request
  currentRequestId = requestId; // Set it as the active request
  return new Promise(async (resolve, reject) => {
    try {

      let words = before.split(' ');//.filter(word => word.trim() !== '');

      let suggestions = [];

      suggestions = manager.searchPhrasesForAllPrefixes(
      	before, 
      	_MAX_SUGG_BEFORE_WORDS, 
      	_order_by_both_rel_word_log_weight, 
      	(a)=>{return hasVertebraeAbbreviation(a.phrase)?__SUGG_VERTEBRAE_EQ_ADD_LOG10_WEIGHT:0}
    	)

      if (currentRequestId === requestId) {
        resolve(suggestions); // Resolve only if this is still the active request
      }
    } catch (error) {
      if (currentRequestId === requestId) {
        reject(error); // Reject only if this is still the active request
      }
    }
  });
}


function sugg_getElementText(elt){
	return elt.innerText.replace(' ', ' ');
}


function sugg_clearWrong(){
	console.log('sugg_clearWrong')
	sugg_getElements().forEach(function(elt){
		var sugg = sugg_getElementText(elt);
		var text = _TEXT.before;

		for(var test_len = 1 ; test_len <= Math.min(sugg.length, text.length) ; test_len++){
			var sugg_part = sugg.slice(0,test_len);
			var text_part = text.slice(text.length - test_len, text.length)

			if(
				sugg_part == text_part 
			){
				console.log('!! ['+sugg_part+'] ==')
				console.log('!! ['+text_part+']')
				elt.innerText = elt.innerText.slice(test_len)
				if (elt.innerText.length == 0){
					_M_List.removeChild(elt);
				}
				return
			} else {
				console.log('['+sugg_part+'] !=')
				console.log('['+text_part+']')
			}
		}
		_M_List.removeChild(elt);

	});
	if((!sugg_getSelectedElement())&&(sugg_getElements().length > 0)) {
		sugg_selectFirst();
	}
	console.log('/sugg_clearWrong : '+ sugg_getElements().length + ' suggs left')
}

function sugg_clear(){
	clearTimeout(_SUGG_after_click_timeout);
	_M_List.innerHTML = '';
}

function sugg_isElementSelected(elt){
	return elt.classList.contains(_SUGG_SELECTED_CLASSNAME);
}

function updateText(range){
	if(!range){
		range = window.getSelection().getRangeAt(0);
	}
	_TEXT.selected = range.toString();

	brange = document.createRange()
	brange.setEnd(range.startContainer, range.startOffset)
	brange.setStartBefore(range.startContainer)

	var container = range.startContainer
	if(!container.tagName)
		while(container.previousSibling){

			container = container.previousSibling
			brange.setStartBefore(container);
		}
	_TEXT.before = brange.toString();

	arange = document.createRange()
	arange.setStart(range.endContainer, range.endOffset);
	arange.setEndAfter(range.endContainer)
	container = range.endContainer
	if(!container)
		while(container.nextSibling){
			container = container.nextSibling;
			arange.setEndAfter(container)
		}

	_TEXT.after = arange.toString();//range.endContainer.textContent.slice(range.endOffset);
	// console.log(_TEXT.after)
	_TEXT.after = _TEXT.after.replaceAll(' ',' ')//.split('. ').slice(0, 1)[0];

	_TEXT.before = _TEXT.before.replaceAll(' ',' ')//.split('. ').slice(-1)[0];
	_TEXT.before = removeStartingWhitespace(_TEXT.before);

	// console.log(_TEXT);

	if(
		(_('#cbSuggest') && (!_('#cbSuggest').checked))
		||
		(_TEXT.before.length<2)
	){
		sugg_hide()
		return
	}


	getPhraseSuggesions(_TEXT.before).then(function(R){

		if(R==undefined){
			R = [];
		}
		_SUGGS = R;
		console.log('_SUGGS src='+_SUGGS.map((s)=>s.phrase));
		_SUGGS = R.map(a=>a.phrase.slice(_TEXT.before.length))
				  .filter(a=>a.length>0)

		if (_TEXT.selected.length > 0){
			_SUGGS = sugg_prioritizeMatchAfter(_SUGGS.filter((s)=>!sugg_matchesSelectedText(s)));
		} else {
			_SUGGS = _SUGGS.filter(a => !sugg_matchesAfterText(a));
		}

		_SUGGS = unique(_SUGGS)
		console.log('_SUGGS='+_SUGGS);

		var have_elts = sugg_getElements()

		if(have_elts.length > 0){
			var have_suggs = have_elts.map(sugg_getElementText);
			console.log('before filter : '+_SUGGS.length)
			_SUGGS = _SUGGS.filter((sugg) => have_suggs.indexOf(sugg)<0);
			console.log('after filter : '+_SUGGS.length)
			_SUGGS.forEach(sugg_addElement);

			if(!sugg_getSelectedElement()){
				sugg_selectFirst();
			}
		}else if(_SUGGS.length > 0){
			_SUGGS.forEach(sugg_addElement);

			sugg_show();

			sugg_selectFirst();
		} else {
			sugg_hide();
		}
	})
}



function sugg_hide(){
	_M.style.width='10px';
	_M.style.height='10px';
	_M.hidden = 'hidden';	
}

function sugg_show(){
	_M.style.overflowX='hidden'
	_M.style.width = '20rem';
	_M.style.height = 'auto';
	_M.hidden = false;	
}

function sugg_addElement(s){
	var li = _ce('li','innerHTML',s.replace(' ','&nbsp;'));
	li.addEventListener('mouseover', function(e) { 
		sugg_clearSelection(); sugg_addSelection(this); 
	});  
	li.addEventListener('mousedown', function(e){ 
		if(sugg_isShowing()){
			sugg_append_whole_sugg(); 
			sugg_clear();
			updateCursorPosition();

			e.stopPropagation();
			e.preventDefault();
		}
	});

	_M.getElementsByTagName('ul')[0].appendChild(li);
}

function sugg_getSelectedElement(){
	return _M.getElementsByClassName(_SUGG_SELECTED_CLASSNAME)[0];
}

function sugg_clearSelection(elt){
	if(!elt){
		elt = sugg_getSelectedElement();
	}
	elt.classList.remove(_SUGG_SELECTED_CLASSNAME);
}

function sugg_addSelection(elt){
	elt.classList.add(_SUGG_SELECTED_CLASSNAME);
}

function sugg_selectNext(){
	var selected = sugg_getSelectedElement();
	sugg_clearSelection(selected);
	if (selected.nextElementSibling) {
		sugg_addSelection(selected.nextElementSibling)
	} else {
		sugg_selectFirst()
	}
}

function sugg_selectPrevious(){
	var selected = sugg_getSelectedElement();
	sugg_clearSelection(selected);
	if (selected.previousElementSibling) {
		sugg_addSelection(selected.previousElementSibling)
	} else {
		sugg_selectLast()
	}
}

function sugg_getElements(){
	return [..._M.getElementsByTagName('li')];
}

function sugg_selectLast(){
	sugg_addSelection(sugg_getElements().slice(-1)[0])
}

function sugg_selectFirst(){
	sugg_addSelection(sugg_getElements()[0])
}

function sugg_matches(sugg, tomatch){
	tl = Math.min(sugg.length, tomatch.length)//, 5)

	return (tl>0) && (sugg.slice(0, tl) == tomatch.slice(0, tl))
}

function sugg_matchesAfterText(sugg){
	return sugg_matches(sugg, _TEXT.after)
}

function sugg_matchesSelectedText(sugg){
	return sugg_matches(sugg, _TEXT.selected)
}

function sugg_prioritizeMatchAfter(SUGGS){
	return (
		SUGGS.filter(sugg_matchesAfterText) 
		.concat(SUGGS.filter((s) => !sugg_matchesAfterText(s)))
	)
}

function removeStartingWhitespace(s){
	var ts = s;
	while((ts.length>0)&&(ts.match(/^(\s\S)/))){
		ts=ts.slice(1);
	}
	return ts;
}

function updateCursorPosition(){
	clearTimeout(_SUGG_after_click_timeout)
	try{
	range = window.getSelection().getRangeAt(0);
	}catch{
		return 
	}
	updateText(range);

	frag = _ce('span');

	range.insertNode(frag);

	//setTimeout(function(){
		_C.y = frag.getBoundingClientRect().y
		_C.x = frag.getBoundingClientRect().x
		frag.parentElement.removeChild(frag);
	//},5);


	


	_M.style.top = (_C.y + window.scrollY + getSelectionFontSize() + 10)+'px';
	_M.style.left = _C.x+'px';
}

function getSelectionFontSize(){
	return parseFloat(
		window.getComputedStyle(
			window.getSelection()
				  .getRangeAt(0)
				  .startContainer
				  .parentElement
	    ).getPropertyValue('font-size')
    )
}
