function len(a){
    return a.length;
}


function undo(){
  document.execCommand('undo', false, null);
}

function redo(){
  document.execCommand('redo', false, null);
}

log = console.log;

// https://stackoverflow.com/a/6234804/2624911
const escapeHtml = (unsafe) => {
return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function HTMLtoText(html){
    return html.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#039;', "'").replaceAll('&amp;', '&');
}

function sanitizeFilename(s){
    return s.replace(/[^0-9a-z\.\,\-_\(\)\[\]а-я@#]/gi,'_')
}


function ep_matchAll(r,s){
  /*
      MS Edge ..
  */
  var R = [];
  var t = r.exec(s);

  while(t){
      R.push(t);
      t = r.exec(s);
  }

  return R;
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function read_url_param_to_input(name, default_value=null, map=function(x){return x;}){
    var toset = getParameterByName(name, window.location.href);
    if(toset=='0'){
        toset = 0;
    }
    if(toset==null){
        toset = default_value;
    } else {
        toset = map(toset);
    }
    elt = document.getElementById(name) || document.getElementsByName(name)[0];
    if (elt !=null) 
    if('checked' in elt) {
        elt.checked = toset;
    } else if ('value' in elt) {
        elt.value = toset;
    } else {
        console.warn("elt ["+name+"] not found!");
    }
    return toset;
}

function read_url_param_or_storage_to_input(name, default_value){
    if ((default_value == null)&&(isObject(name))) {
        var R = {};
        for(var field in name){
            R[field] = read_url_param_or_storage_to_input(field, name[field]);
        }
        return R;
    } else {
        var stored_value = localStorage.getItem(name);
        stored_value = stored_value=='false' ? false : stored_value;
        stored_value = (stored_value==null)?default_value:stored_value;
        var toset = read_url_param_to_input(name, stored_value);
        if (toset != stored_value) {
            localStorage.setItem(name, toset);
        }
        return toset;
    }
}

function $(s){
    if (s[0] == '#') {
        return document.getElementById(s.slice(1));
    } else if (s[0] == '.') {
        return document.getElementsByClassName(s.slice(1));
    } else {
        return document.getElementById(s)
    }
}


function ep_matchAll(r,s){
    /*
        MS Edge ..
    */
    var R = [];
    var t = r.exec(s);
  
    while(t){
        R.push(t);
        t = r.exec(s);
    }
  
    return R;
  }


function _(s){
  var r = [document];
  var selectors = ep_matchAll(/( |[\.\#]?[^ \.\#]+)/g , s).map( function(x) {return x[0];} )
  
  var last_space=true;
  
  for(var cur_sel of selectors){
    var sel_key = cur_sel.slice(1);
    if(cur_sel == ' '){
      last_space = true;
    }else{
      if (last_space) {
        var f =  e => e.getElementsByTagName(cur_sel) 
        if(cur_sel[0]=='.'){
          f = e => e.getElementsByClassName(sel_key);
        }else if(cur_sel[0]=='#'){
          f = e => [ e.getElementById(sel_key) ];
        } 
        r = r.map(e => [...f(e)]).flat(Infinity);
      }else{
        f =  e => e.tagName.toLowerCase() == cur_sel.toLowerCase();
        if(cur_sel[0]=='.'){
          f = e => e.classList.contains(sel_key);
        }else if(cur_sel[0]=='#'){
          f = e => e.id == sel_key;
        } else {
          // this is not really possible, right?
        }
        r = r.filter(f);
      }
      last_space = false;
    }
  }
  return ((s[0]=='#')&&(selectors.length==1)&&(r.length==1))?r[0]:r;
}

function isObject(obj) {
    return obj instanceof Object;
}

String.prototype.contains = function(s){
    return this.indexOf(s)>=0;
}

Array.prototype.contains = function(elt) {
  if(isFunction(elt)){
    for(var e of this){
        if(elt(e)){
            return true;
        }
    }
    return false;
  }
  return this.indexOf(elt)>=0;
}

Array.prototype.first = function(filterfun){
    for(var e of this){
        if(filterfun(e)){
            return e;
        }
    }
}


function Max() {
  var a = arguments.length==1 ? arguments[0] : arguments;
  return Math.max.apply(Math,a);
}

Array.prototype.max = function(elt) {
    return Max(this);
}
Array.prototype.min = function(elt) {
    return Min(this);
}

Array.prototype.each = function(fun){ 
    return range(this.length).map(j => fun(j, this[j]));
}

function Min() {
  var a = arguments.length==1 ? arguments[0] : arguments;
  return Math.min.apply(Math,a);
}

function listForEach(arr, fun){
  [].forEach.call(arr, fun);
}

function listMap(arr, fun) {
  return [].map.call(arr, fun);
}

// add map and forEach to some DOM-related array-like thingies
['map','forEach','filter','each'].forEach( (fun_name) => {
    [NodeList, HTMLCollection].forEach( (obj) => {
        obj.prototype[fun_name] = function() { return [...this][fun_name](...arguments) };
    })
})

function v(id){
    if(id[0]=='#')
        id = id.slice(1);
    return document.getElementById(id).value;
}



function replace_part(text, part, index, rep){
    return text.slice(0, index)+rep+text.slice(index+part.length,text.length)
}

function replace_match(text, match, rep){
    return replace_part(text, match[0], match.index, rep)
}



function elt(tagName, innerHTML='',className=''){
    td = document.createElement(tagName);
    td.innerHTML = innerHTML;
    td.className = className;
    return td;
}

function _ce(tagName){
    var e = document.createElement(tagName);
    for(var j=1;j<arguments.length;j+=2){
        if(arguments[j]=='children'){
            if(Array.isArray(arguments[j+1])){
                arguments[j+1].forEach(a=>e.appendChild(a));
            }else{
                e.appendChild(arguments[j+1]);
            }
        }else{
            e[arguments[j]] = arguments[j+1];
        }
    }
    return e;
}

function _span(text){
    var span = _ce('span');
    span.innerHTML = text;
    return span;
}

function substitute_if_today(datestr){
    if(datestr==date2str(new Date())){
        return 'today';
    }
    return datestr;
}

//https://stackoverflow.com/a/728694/2624911
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function count(arr, elt){
    var R = 0;
    for(var jelt of arr)
        if(jelt==elt)
            R++;
    return R;
} 

function unique(arr){
    return arr.filter((v, i, a) => a.indexOf(v) === i).filter(s=>s).sort()
}

function sortBy(arr, prop_or_fun,reverse){
    var r = [...arr];
    if(isString(prop_or_fun)){
        r.sort((a,b)=>b[prop_or_fun] - a[prop_or_fun]);
    }else if(isFunction(prop_or_fun)){
        r.sort((a,b)=>prop_or_fun(b)-prop_or_fun(a));
    }else{
        throw new Error("wtf is "+prop_or_fun+" for prop or fun??");
    }
    if(reverse){
        r.reverse();
    }
    return r;
}

Array.prototype.sortBy = function(prop_or_fun,reverse){
    r = this;
    if(isString(prop_or_fun)){
        r.sort((a,b)=>b[prop_or_fun] - a[prop_or_fun]);
    }else if(isFunction(prop_or_fun)){
        r.sort((a,b)=>prop_or_fun(b)-prop_or_fun(a));
    }else{
        throw new Error("wtf is "+prop_or_fun+" for prop or fun??");
    }
    if(reverse){
        r.reverse();
    }
    return r;
}

//https://stackoverflow.com/a/31844649
Array.prototype.hasMin = function(prop_or_fun){
    r = this;
    if(isString(prop_or_fun)){
        return (this.length && this.reduce(function(prev, curr){ 
            return prev[prop_or_fun] < curr[prop_or_fun] ? prev : curr; 
        })) || null;
    }else if(isFunction(prop_or_fun)){
        return (this.length && this.reduce(function(prev, curr){ 
            return prop_or_fun(prev) < prop_or_fun(curr) ? prev : curr; 
        })) || null;
    }else{
        throw new Error("wtf is "+prop_or_fun+" for prop or fun??");
    }
}


Array.prototype.extend = function(arr){
    var r = this;
    arr.forEach((e)=>r.push(e));
    return r;
}

function int2str_w_zeros(a, width=2){
    return ('0000000'+a).slice(-width)
}

function date2str(date, sep){
    if(sep==null)
        sep = '-';
    if(date.getDate==undefined){
        date = new Date(date);
    }
    return int2str_w_zeros(date.getFullYear(),4)+sep+int2str_w_zeros(date.getMonth()+1,2)+sep+int2str_w_zeros(date.getDate(),2);
}

function date2rustr(date, sep){
    if(sep==null)
        sep = '.'; 
    if(date.getDate==undefined){
        date = new Date(date);
    }
    return int2str_w_zeros(date.getDate(),2)+sep+int2str_w_zeros(date.getMonth()+1,2) +sep+ int2str_w_zeros(date.getFullYear(),4);
}

function date2timestr(date, add_seconds){
    date = date || new Date();
    if(date.getDate==undefined){
        date = new Date(date);
    }
    let sep = ':';
    return int2str_w_zeros(date.getHours(),2)+sep+int2str_w_zeros(date.getMinutes(),2) + (add_seconds? sep+ int2str_w_zeros(date.getSeconds(),2) : '');
}

function datetimestr2datetime(datetimestr){
    let a = datetimestr.split(' ');
    a[0] = a[0].split('.').reverse().join(' ');
    a = a.join(' ').replaceAll(':',' ');
    a = a.split(' ').map(function(x){return 1*x;})
    a[1] = a[1] - 1; // months..
    return new Date(...a);
}

function datetime2datetimestr(datetime){
    return date2rustr(datetime) + ' ' + date2timestr(datetime);
}

function daterustr2dash(rustr, sep){
    sep = sep || '-';
    return rustr.split('.').reverse().join(sep);
}

function datedots2utc(date){
    return date.split('.').reverse().join('')
}

function str2date(str){
    pars = str.split('-').map(x => 1 * x);
    pars[1]=pars[1] - 1; //months 0..11
    return new Date(...pars);
}

function prevMonthEnd(date){
    var d = new Date(date);
    d.setDate(0);
    return d;
}

function findPrevWeekStart(date, week_start_day){
    return findWeekStart(date, -1, week_start_day)
}
  
function findNextWeekStart(date, week_start_day){
    return findWeekStart(date, 1, week_start_day)
}

function findWeekStart(date, direction, week_start_day){
    var d = new Date(date);
    if (direction * direction < 1){
        direction = direction < 0 ? -1 : 1;
    }
    d = d.addDays(direction);
    while(d.getDay() != week_start_day){
        d = d.addDays(direction);
    }
    return d;
}
  

function range1(n){
    return [...Array(n).keys()];
}

function range(nstart, nend=null, nstep=1){
    if(nend===null){
        return range1(nstart);
    }
    var R = [];
    j=nstart;
    while ( (nend - j) / nstep > 0 ){
        R.push(j);
        j += nstep;
    }
    return R;
}

Number.fromBits = function(arr, base=2){
    var r = 0;
    var pow = 1;
    for(var j=0; j<arr.length; j++) {
        r += arr[j] * pow;
        pow *= base;
    }
    return r;
}

Number.prototype.toBits = function(precision=null, base=2){
    var r = [];
    var v = 1 * this;
    do {
        r.push(v % base);
        v = ( v - (v % base))/base;
    } while ((v>0)||(r.length < precision));
    return r;
}

function parse_epbool_code(s, precision, sep='-', base=2){
    return s.split(sep).map(x => Number(x).toBits(precision, base));
}

function encode_epbool_code(arr, sep='-', base=2){
    return arr.map(a => Number.fromBits(a, base)).join(sep);
}

function set(id,value){
    document.getElementById(id).value=value;
}

function get(id){
    return document.getElementById(id).value;
}


function modify_table_content(table_id, table_content, skip_rows=1, class_names=null, row_classnames=null){
    //  modifies table content, appends/deletes rows if needed
    //  assumes table rows contain same number of cells
    try{
        //console.log('NodTable: id='+table_id+' | '+table_content.length+' rows x '+table_content[0].length+' cells , skip_rows='+skip_rows);
    }catch{
        
    }
    ttable = document.getElementById(table_id);
    //console.log('modify_table_content: '+ttable.getElementsByTagName('tr').length + ' tr\'s');
    trows = (new Array(...ttable.getElementsByTagName('tr'))).slice(skip_rows);
    //console.log('modify_table_content: '+trows.length + ' tr\'s after skipping');

    if(class_names == null){
        class_names = table_content.map(a=>a.map(j=>''));
    }

    if (row_classnames == null){
        row_classnames = table_content.map(a=>'');
    }

    for(var j=0; j<table_content.length; j++){
        var inner_htmls = table_content[j];
        if(j<trows.length){
            // change ROW
            tds = trows[j].getElementsByTagName('td');
            for(var i=0;i<inner_htmls.length;i++){
                tds[i].innerHTML = inner_htmls[i];
                tds[i].className = class_names[j][i];
            }


           trows[j].className = row_classnames[j]; 
        }else{
            // ADD row
            var trow = document.createElement('tr');

            for(var i=0;i<inner_htmls.length;i++){
                telt = document.createElement('td');
                telt.innerHTML = inner_htmls[i];
                telt.className = class_names[j][i];
                trow.appendChild(telt);    
            }

            trow.className = row_classnames[j];

            ttable.appendChild(trow);                
        }
    }

    for(var j=trows.length-1; j>=table_content.length; j--){
        ttable.removeChild(trows[j]);
    }
}

//https://flaviocopes.com/how-to-determine-date-is-today-javascript/
const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }

//https://stackoverflow.com/a/7557433/2624911
function isElementInViewport (el) {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    if (!(el))
        return null;

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}


function newline2p(s, p_classname='justp'){
return '<p class="'+p_classname+'">'
        + s.replace(/\n\n/g,'</p><p class="'+p_classname+'">&nbsp</p><p class="'+p_classname+'">')
            .replace(/\n/g,'</p><p class="'+p_classname+'">')
        + '</p>';
}


replacer = {
    "q":"й", "w":"ц"  , "e":"у" , "r":"к" , "t":"е", "y":"н", "u":"г", 
    "i":"ш", "o":"щ", "p":"з" , "[":"х" , "]":"ъ", "a":"ф", "s":"ы", 
    "d":"в" , "f":"а"  , "g":"п" , "h":"р" , "j":"о", "k":"л", "l":"д", 
    ";":"ж" , "'":"э"  , "z":"я", "x":"ч", "c":"с", "v":"м", "b":"и", 
    "n":"т" , "m":"ь"  , ",":"б" , ".":"ю" , "/":".", 
    ":":"Ж" , "\"":"Э", "{":"Х", "}":"Ъ", "<":"Б", ">":"Ю"
}; 
function enru_translit(str) {
      
    
    for(i=0; i < str.length; i++){                        
        if( replacer[ str[i].toLowerCase() ] != undefined){
                            
            if(str[i] == str[i].toLowerCase()){
                replace = replacer[ str[i].toLowerCase() ];    
            } else if(str[i] == str[i].toUpperCase()){
                replace = replacer[ str[i].toLowerCase() ].toUpperCase();
            } 
            
            str = str.replace(str[i], replace);
        }
    }
    
   return str;
}


function pretty_date_diff_print(d){
    var R = []

    time_strings = [ 
        [ 365*24*3600*1000 , ['год','года','лет']],
        [ 31*24*3600*1000  , ['месяц','месяца','месяцев']],
        [ 24*3600*1000     , ['день','дня','дней']],
        [ 3600*1000        , ['час','часа','часов']],
        [ 60*1000          , ['мин','мин','мин']],
        [ 1000             , ['с','с','с']],
    ]

    for(var ts of time_strings){
        if(d > ts[0]){
            n = Math.floor(d/ts[0]);
            R.push(n+
                ((Math.floor(n/10)==1)?ts[1][2]:(
                    (n % 10 == 1)?ts[1][0]:(
                        (n % 10 < 5)?ts[1][1]:ts[1][2]
                )
            )));
            d = d - n * ts[0];
        }
    }

    return R.join(' ');
}

function pribor_id_from_pribor(pribor){
    try{
        pribor.match(/(.[TtТт])/)
    }catch{
        console.log('[pribor_id_from_pribor] pribor = '+pribor)
        return null
    }
    if(pribor.match(/(.[TtТт])/)){
        for(let opt of document.getElementById('pribor_id').children){
            if(pribor.match(/(.[TtТт])/)[0].replace('Т','T') == opt.innerHTML.match(/(.[TtТт])/)[0].replace('Т','T')){
                //console.log('+');
                return opt.value;
            }
        }
    }
    return null;
}


function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}



__COVID19_html = '<span class="covid_tag_1"><span class="covid_tag_2 covid_tag_3" style="height:16px;line-height:16px;width:16px"><svg focusable="false" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="24" width="24"></rect><path d="M21.25,10.5c-0.41,0-0.75,0.34-0.75,0.75h-1.54c-0.15-1.37-0.69-2.63-1.52-3.65l1.09-1.09l0.01,0.01 c0.29,0.29,0.77,0.29,1.06,0s0.29-0.77,0-1.06L18.54,4.4c-0.29-0.29-0.77-0.29-1.06,0c-0.29,0.29-0.29,0.76-0.01,1.05l-1.09,1.09 c-1.02-0.82-2.27-1.36-3.64-1.51V3.5h0.01c0.41,0,0.75-0.34,0.75-0.75C13.5,2.34,13.16,2,12.75,2h-1.5c-0.41,0-0.75,0.34-0.75,0.75 c0,0.41,0.33,0.74,0.74,0.75v1.55C9.87,5.19,8.62,5.74,7.6,6.56L6.51,5.47l0.01-0.01c0.29-0.29,0.29-0.77,0-1.06 c-0.29-0.29-0.77-0.29-1.06,0L4.4,5.46c-0.29,0.29-0.29,0.77,0,1.06c0.29,0.29,0.76,0.29,1.05,0.01l1.09,1.09 c-0.82,1.02-1.36,2.26-1.5,3.63H3.5c0-0.41-0.34-0.75-0.75-0.75C2.34,10.5,2,10.84,2,11.25v1.5c0,0.41,0.34,0.75,0.75,0.75 c0.41,0,0.75-0.34,0.75-0.75h1.54c0.15,1.37,0.69,2.61,1.5,3.63l-1.09,1.09c-0.29-0.29-0.76-0.28-1.05,0.01 c-0.29,0.29-0.29,0.77,0,1.06l1.06,1.06c0.29,0.29,0.77,0.29,1.06,0c0.29-0.29,0.29-0.77,0-1.06l-0.01-0.01l1.09-1.09 c1.02,0.82,2.26,1.36,3.63,1.51v1.55c-0.41,0.01-0.74,0.34-0.74,0.75c0,0.41,0.34,0.75,0.75,0.75h1.5c0.41,0,0.75-0.34,0.75-0.75 c0-0.41-0.34-0.75-0.75-0.75h-0.01v-1.54c1.37-0.14,2.62-0.69,3.64-1.51l1.09,1.09c-0.29,0.29-0.28,0.76,0.01,1.05 c0.29,0.29,0.77,0.29,1.06,0l1.06-1.06c0.29-0.29,0.29-0.77,0-1.06c-0.29-0.29-0.77-0.29-1.06,0l-0.01,0.01l-1.09-1.09 c0.82-1.02,1.37-2.27,1.52-3.65h1.54c0,0.41,0.34,0.75,0.75,0.75c0.41,0,0.75-0.34,0.75-0.75v-1.5C22,10.84,21.66,10.5,21.25,10.5z M13.75,8c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S13.2,8,13.75,8z M12,13c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1s1,0.45,1,1 C13,12.55,12.55,13,12,13z M10.25,8c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S9.7,8,10.25,8z M8.5,13c-0.55,0-1-0.45-1-1 c0-0.55,0.45-1,1-1s1,0.45,1,1C9.5,12.55,9.05,13,8.5,13z M10.25,16c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1s1,0.45,1,1 C11.25,15.55,10.8,16,10.25,16z M13.75,16c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1s1,0.45,1,1C14.75,15.55,14.3,16,13.75,16z M14.5,12 c0-0.55,0.45-1,1-1s1,0.45,1,1c0,0.55-0.45,1-1,1S14.5,12.55,14.5,12z"></path></svg></span>COVID-19</span>'



function send_post_request(url, payload, onload, onerror=_=>null, responseType='json', withCredentials=true){
    send_request(url, onload, onerror, responseType, 'POST', payload, withCredentials);
}

function send_request(url, onload, onerror=_=>null, responseType='json', method='GET', payload=null, withCredentials=true){
    if (onerror==null){
        onerror = onload;
    }
    var request = new XMLHttpRequest();
    request.responseType = responseType;
    request.open(method, url);

    request.withCredentials = withCredentials;

    request.onload = function() { onload(request); };
    request.onerror = function() { onerror(request); };
    if(payload===null){
        request.send()
    } else {
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(payload));
        //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //request.setRequestHeader('Content-Type', '*/*');
        //request.setRequestHeader('accept', '*/*');
        //request.send(urlEncodeObject(payload))
    }
    return request;
}

function send_get_cross_origin_request(url, onload, onerror=_=>null){
    return send_request(url, onload, onerror, responseType='json', method='GET', payload=null, withCredentials=false)
}

function urlEncodeObject(obj){
    var urlEncodedDataPairs = [];
    for( var name in obj ) {
        urlEncodedDataPairs.push(encodeURIComponent(name)+'='+encodeURIComponent(obj[name]));
    }
    return urlEncodedDataPairs.join('&');
}

// https://stackoverflow.com/a/9436948/2624911
function isString(myVar){
    return (typeof myVar === 'string' || myVar instanceof String);
}

function isFunction(v){
    return (typeof v === 'function');
}

function applyToElementIdOrArray(elt, fun){
    if(isString(elt)){
        applyToElementIdOrArray(_(elt), fun);
    } else if(elt.forEach){
        elt.forEach(fun);
    } else {
        fun(elt);
    }    
}

function show(elt){
    applyToElementIdOrArray(elt, function(elt){elt.style.display = ''});
}

function hide(elt){
    applyToElementIdOrArray(elt, function(elt){elt.style.display = 'none'});
}

function disable(elt){
    applyToElementIdOrArray(elt, function(elt){elt.disabled = true});
}

function enable(elt){
    applyToElementIdOrArray(elt, function(elt){elt.disabled = false});
}

///////////////////////////////////
// https://stackoverflow.com/a/563442/2624911
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.dayStart = function() {
    var date = new Date(this.valueOf());
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function now(){
    return new Date();
}

function pytimestamp2date(ts){
    return new Date(ts * 1000);
}


function ruPlural(n, single, plural2, plural5){
    n = Math.floor(abs(n));
    n10 = Math.floor(n/10);
    n1 = Math.floor( n - 10*n10 );
    if(n==0){
        return plural5;
    }
    if(n10 == 1){
        return plural5;
    }
    if(n1==1){
        return single;
    }    
    if((n1<5)&&(n1>0)){
        return plural2;
    }
    return plural5;
}

function ruHowLongBefore(date){
    var n = now();
    var ds =  Math.floor((n - date) / 1000);
    var dm = Math.floor((ds) / 60);
    var dh = Math.floor((dm) / 60);
    var dd = Math.floor((n.dayStart() - date.dayStart()) / (86400 * 1000));
    if (
        (dd == 0)
        || ( dh <= 8 )
    ){
        if (dh>0){
            return dh + ' ' + ruPlural(dh, 'час', 'часа', 'часов') + ' назад'
        }else if(dm>0) {
            return dm + ' ' + ruPlural(dm, 'минуту', 'минуты', 'минут') + ' назад'
        } else if(ds > 0) {
            return ds + ' ' + ruPlural(ds, 'секунду', 'секунды', 'секунд') + ' назад'
        }
    } else {
        return dd + ' ' + ruPlural(dd, 'день','дня','дней') + ' назад'
    }
}

function datetime2rutime(d){
    return d.getHours()+':'+int2str_w_zeros(d.getMinutes(),2) + ':'+int2str_w_zeros(d.getSeconds(),2)
}

function datetime2rudate(d){
    return int2str_w_zeros(d.getDate(),2) + '.' + int2str_w_zeros(d.getMonth()+1,2) + '.' + int2str_w_zeros(d.getFullYear(),4)
}

function datetime2ru(date, include_relative){
    return datetime2rutime(date)  + ' ' + datetime2rudate(date) + ( include_relative ? (' (' + ruHowLongBefore(date) + ')') : '')
}

////////////////////////////////////
// sorting funs

function sort_simple(a, b){
    return (a > b) ? 1 : -1;
}

function sort_num(a,b){
    return sort_simple(1*a, 1*b);
}

function rudate2sortable(rudate){
    return rudate.split('.').reverse().join('');
}

function sort_rudate(a,b){
    return sort_simple(rudate2sortable(a), rudate2sortable(b));
}

function sort_rudatetimestr(a,b){
    return sort_simple(datetimestr2datetime(a), datetimestr2datetime(b));
}

function abs(x){
    return (1*x>=0) ? 1*x : -1*x;
}

min = Math.min;
max = Math.max;

////////////////////////////////////
/// selections

function selectNodeContents(node){
    var range = document.createRange();
    range.selectNodeContents(node)
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function replaceNodeContentsWithHTML(node, html){
    selectNodeContents(node);
    document.execCommand('insertHTML', false, html);
}


function replaceNodeContentsWithText(node, text){
    selectNodeContents(node);
    document.execCommand('insertText', false, text);
}

///////////////////////////////////
//https://stackoverflow.com/questions/18516942/fastest-general-purpose-levenshtein-javascript-implementation
//https://github.com/gustf/js-levenshtein/blob/master/index.js
levenshtein = (function()
{
  function _min(d0, d1, d2, bx, ay)
  {
    return d0 < d1 || d2 < d1
        ? d0 > d2
            ? d2 + 1
            : d0 + 1
        : bx === ay
            ? d1
            : d1 + 1;
  }

  return function(a, b)
  {
    if (a === b) {
      return 0;
    }

    if (a.length > b.length) {
      var tmp = a;
      a = b;
      b = tmp;
    }

    var la = a.length;
    var lb = b.length;

    while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
      la--;
      lb--;
    }

    var offset = 0;

    while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
      offset++;
    }

    la -= offset;
    lb -= offset;

    if (la === 0 || lb < 3) {
      return lb;
    }

    var x = 0;
    var y;
    var d0;
    var d1;
    var d2;
    var d3;
    var dd;
    var dy;
    var ay;
    var bx0;
    var bx1;
    var bx2;
    var bx3;

    var vector = [];

    for (y = 0; y < la; y++) {
      vector.push(y + 1);
      vector.push(a.charCodeAt(offset + y));
    }

    var len = vector.length - 1;

    for (; x < lb - 3;) {
      bx0 = b.charCodeAt(offset + (d0 = x));
      bx1 = b.charCodeAt(offset + (d1 = x + 1));
      bx2 = b.charCodeAt(offset + (d2 = x + 2));
      bx3 = b.charCodeAt(offset + (d3 = x + 3));
      dd = (x += 4);
      for (y = 0; y < len; y += 2) {
        dy = vector[y];
        ay = vector[y + 1];
        d0 = _min(dy, d0, d1, bx0, ay);
        d1 = _min(d0, d1, d2, bx1, ay);
        d2 = _min(d1, d2, d3, bx2, ay);
        dd = _min(d2, d3, dd, bx3, ay);
        vector[y] = dd;
        d3 = d2;
        d2 = d1;
        d1 = d0;
        d0 = dy;
      }
    }

    for (; x < lb;) {
      bx0 = b.charCodeAt(offset + (d0 = x));
      dd = ++x;
      for (y = 0; y < len; y += 2) {
        dy = vector[y];
        vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
        d0 = dy;
      }
    }

    return dd;
  };
})();



//////////////////////////////


function isMiddleMouse(event){
    return event.button == 1;
}


//////////////////////////////