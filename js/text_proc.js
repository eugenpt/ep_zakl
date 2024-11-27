  function repeatSymbolByHexCode(hex, count){
    var tc=String.fromCharCode(parseInt(hex,16));
    s='';
    for(var j=0;j<count ; j++){
      s = s + tc;
    }
    return s;
  }

  /*
  AGFA_LINE_START = '    ';
  AGFA_LINE_START = '    ';
  AGFA_LINE_START = '   ';
  AGFA_LINE_START = '     '; // 0xa0 , non-breaking space , warps greatly
  AGFA_LINE_START = '    '; // 0x20 , space , warps greatly
  AGFA_LINE_START = '    '; // en quad  U+2000, better than space, but still variable a bit
  AGFA_LINE_START = '  '; // em quad  U+2001, better than space, but still variable a bit
  AGFA_LINE_START = '　　'; // ideographic space  U+3000  -- not visible at all in AGFA Arial
  AGFA_LINE_START=repeatSymbolByHexCode('1680',10); // not visible
  AGFA_LINE_START=repeatSymbolByHexCode('2000',4); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2001',4); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2002',4); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2003',2); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2004',8); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2005',8); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('2006',8); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('2007',8); // better than space, but still variable a bit
  AGFA_LINE_START=repeatSymbolByHexCode('2008',8); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('2009',10); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('200A',10); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('200B',10); // either not visible or actually zero-width
  AGFA_LINE_START=repeatSymbolByHexCode('202F',10); // badly adjusted..
  AGFA_LINE_START=repeatSymbolByHexCode('205F',10); // not visible
  AGFA_LINE_START=repeatSymbolByHexCode('3000',10); // not visible
  AGFA_LINE_START='⠀⠀⠀⠀'; // not visible

  */
  
  AGFA_LINE_START = '    '; // 
  AGFA_LINE_START = '    ';

  function replaceLineStartWith(s, line_start, dont_clear_whitespace){
    var rs = s.slice();
    if(dont_clear_whitespace){
      rs =  rs.replace(/^/g,line_start)
              .replaceAll(/[^\S\n]*\n/g, '\n'+line_start);
    } else {
      rs =  rs.replaceAll(/^[^\S\n]*/g,line_start)
              .replaceAll(/[^\S\n]*\n[^\S\n]*/g, '\n'+line_start);
    }
    return rs==line_start ? '' : rs;
  }


  function prep_innerText_for_content(content, keep_whitespace_line_start, add_whitespace_line_start){
    if(typeof keep_line_start == 'undefined')
      keep_line_start = 1;
    if(typeof add_whitespace_line_start == 'undefined')
      add_whitespace_line_start = '';

    var s = replaceLineStartWith(prepLoadedText(content), add_whitespace_line_start ,keep_whitespace_line_start)
    
    return s;

    ts = '#asdfasdfasdfasfasdf';
    return s.replaceAll(/\n{3}/g,ts)
            .replaceAll(/\n{2}/g,ts)
            .replaceAll(ts,'\n')
            .replaceAll(/\n{1,2}(\n*)/g,'\n\n$1')    
  }



function prepLoadedText(s){
  return s.replaceAll(' ',' ').replaceAll(' ', '').replaceAll('‑','-');
}


/////////////////////////////////////
///


replacer = {
    "q":"й", "w":"ц"  , "e":"у" , "r":"к" , "t":"е", "y":"н", "u":"г", 
    "i":"ш", "o":"щ", "p":"з" , "[":"х" , "]":"ъ", "a":"ф", "s":"ы", 
    "d":"в" , "f":"а"  , "g":"п" , "h":"р" , "j":"о", "k":"л", "l":"д", 
    ";":"ж" , "'":"э"  , "z":"я", "x":"ч", "c":"с", "v":"м", "b":"и", 
    "n":"т" , "m":"ь"  , ",":"б" , ".":"ю" , "/":".", 
    ":":"Ж" , "\"":"Э", "{":"Х", "}":"Ъ", "<":"Б", ">":"Ю"
}; 
for(var k in replacer){
    var v = replacer[k];
    if(k.toUpperCase() != k){
        replacer[k.toUpperCase()]=v.toUpperCase()
    }
}
replacer_both = {};
replacer_i = {};
for(var k in replacer){
    var v = replacer[k];
    replacer_i[v]=k;
    replacer_both[k] = v;
    replacer_both[v] = k;
}

function str_n_eng_layout(str){
    return [...str.toLowerCase()].filter((c)=>replacer[c]).length
}

function str_n_ru_layout(str){
    return [...str.toLowerCase()].filter((c)=>replacer_i[c]).length
}

function str_is_mostly_en(str){
    return str_n_eng_layout > str.length/2;
}

function _str_apply_translit(str, rep){
    return [...str].map((c) => rep[c]||c).join('')
}

function str_translit(str){
    return _str_apply_translit(
        str, 
        replacer_both
    );
}

function enru_translit(str) {
    return _str_apply_translit(replacer);
}

//////////////////////////////////////////////////////////////
///////


function str_matches_q(str, q){
  var qs = q.split(' ').filter((s)=>s.length>0);
  if(qs.length == 0){
    return true
  }
  for(var qj of qs){
    if(
      (str.indexOf(qj) < 0)
      && (str.indexOf(str_translit(qj)) < 0)
    ){
      return false 
    }
  }
  return true
}


///


function cutStartRegexp(text, regexp){
  m = text.match(regexp);
  if(m){
    return text.slice(m.index + m[0].length);
  }
  return text.slice();
}

function cutRegexpOut(text, regexp){
  m = text.match(regexp);
  if(m){
    return text.slice(0, m.index) + text.slice(m.index + m[0].length);
  }
  return text.slice();  
}


function cutDiagInfo(text){
  var regexp = /^\s*(Диагноз +при +направлении: *.*)[\r\n]+/mi;
  m = text.match(regexp);
  if(!m){
      regexp = /^\s*(Клиническая +ситуация *: *.*)[\r\n]+/mi;
      m = text.match(regexp);
  }
  var diag = '';
  if(m){
    diag = m[1];

    return [diag,text.slice(m.index + m[0].length)];
  } 
  return ['', text.slice()];    
}

function cutHeadGetDiag(text){
  text = cutStartRegexp(text, /^\s*Ф. ?И. ?О.*[\r\n]+/mi);
  text = cutStartRegexp(text, /^\s*Дата +рождения.*[\r\n]+/mi);
  text = cutStartRegexp(text, /^\s*ЭМК +№.*[\r\n]+/mi);
  text = cutStartRegexp(text, /^\s*Дата +исследования.*[\r\n]+/mi);

  text = cutRegexpOut(text,  /^\s*Диагноз +при +направлении:\s*$/mi); // no empty diag
  
  X = cutDiagInfo(text);
  text = X[1];

  text = cutStartRegexp(text, /^\s*Описание:\s*/mi);
  text = cutStartRegexp(text, /^\s*Протокол исследования\s*[.:]\s*/mi);
  return [X[0], text];
}

function cutZakl(text){
  let zakl = "";

  m = text.match(/[\n]+\s*Заключение\s*:?\s*/i)
  if(m){
    zakl = text.slice(m.index + m[0].length);
    text = text.slice(0, m.index);
  }

  m = zakl.match(/[\n]+\s*Врач/);
  if(m){
    zakl = zakl.slice(0, m.index);
  }

  return [text, zakl];
}