function AJAX(){
	var ajax = false;
	if(window.XMLHttpRequest){
		ajax = new XMLHttpRequest();
	}else if(window.ActiveXObject){
	   	try{
	       	ajax = new ActiveXObject("Msxml2.XMLHTTP");
	   	}catch(e){
	       	ajax = new ActiveXObject("Microsoft.XMLHTTP");
	   	}
	}
	
	if((typeof ajax) == "object"){
		ajax.debug = false;
		ajax.method = 'POST';
		ajax.action = '';
		ajax.params = '';
		ajax.async = true;
		ajax.beforeSend = function(i){};
		ajax.success = function(data){};
		ajax.loading = function(i){
			if(ajax.debug)
				console.log("Loading: " + i + "%");	
		};
		ajax.onprogress = function(event){
			ajax.loading(((event.loaded * 100) / event.total));
		};
		ajax.upload.loading = function(i){
			if(ajax.debug)
				console.log("Upload loading: " + i + "%");
		};
		var count1 = 0, count2 = 0;
		ajax.upload.onprogress = function(event){
			count2 = (((event.loaded * 100) / event.total).toFixed(2));
			if(count1 != count2){
				count1 = count2;
				ajax.upload.loading(count1);
			}			
	    };
	    ajax.upload.onload = function(){
	    	if(ajax.debug)
				console.log("Upload Realizado!");
		};
		ajax.upload.onerror = function(){
			console.log("Erro no upload!");
		};
	    ajax.onloadstart = function(){
	    	if(ajax.debug)
				console.log("Carregamento dos dados começou!");
		};
		ajax.onloadend = function(){
			if(ajax.debug)
				console.log("Carregamento dos dados terminou!");
		};
	    ajax.onload = function(){
	    	if(ajax.debug)
	    		console.log("Dados enviados!");
	    };
	    ajax.onerror = function(){
			console.log("Erro!");
		};
		ajax.onabort = function(){
			console.log("Abortado!");
		};
		var count0 = 0;
		ajax.onreadystatechange = function(){
			if(count0 != ajax.readyState && ajax.readyState <= 4){
				count0 = ajax.readyState;
				if(ajax.debug){
					console.log("ReadyState: " + count0);
				}
				ajax.beforeSend(count0);
			}
			if(ajax.readyState == 4 && ajax.status == 200){
				var data = '';
				if(ajax.responseText){
					data = ajax.responseText;
				}
				if(ajax.responseXML){
					data = ajax.responseXML;
				}
				data = data.trim();
				if(ajax.debug){
					console.log("Recebido: " + data);
				}
				setTimeout(function(){								
					ajax.success(data);
				}, 500);			
			}
		};
	}
	ajax.execute = function(){
		if(ajax.method == 'GET' && (typeof ajax.params) != 'object'){
			ajax.open(ajax.method, ajax.action + "?" + ajax.params, ajax.async);
		    ajax.send(null);
		}else if(ajax.method == 'POST' || ajax.method == 'PUT'){
		   	ajax.open(ajax.method, ajax.action, ajax.async);
		   	if((typeof ajax.params) != 'object'){
		       	ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		    }else{
		    	ajax.setRequestHeader("Cache-Control", "no-cache");
		    }
		    ajax.send(ajax.params);
		}
	}

    return ajax;
}

/*
function AJAX(object){
	var block = false;

	if(!object){
		block = true;
	}

	if((typeof object) != "object"){
		object = {};
	}

	if((typeof object.debug) != 'boolean'){
		object.debug = false;
	}
	
	if((typeof object.method) != 'string' || (object.method != 'GET' && object.method != 'POST' && object.method != 'PUT' && object.method != 'DELETE')){
		object.method = 'GET';
	}
	object.method = object.method.toUpperCase();


	if((typeof object.action) != 'string' || object.action.length == 0){
		object.action = '';
	}

	if((typeof object.params) == 'undefined'){
		object.params = '';
	}
	
	if((typeof object.async) != 'boolean'){
		object.async = true;
	}

	if((typeof object.beforeSend) != 'function'){
		object.beforeSend = function(i){
			if(object.debug){
				console.log("ReadyState: " + i);
			}
		};
	}
	
	if((typeof object.success) != 'function'){
		object.success = function(data){
			if(object.debug){
				console.log("Recebido: " + data);
			}
		};
	}

	if((typeof object.progress) != 'function'){
		object.progress = function(i){
			if(object.debug){
				console.log("Progress: " + i);
			}
		};
	}

	if((typeof object.load) != 'function'){
		object.load = function(){
			if(object.debug){
				console.log("Enviado!");
			}
		};
	}

	if((typeof object.loadStart) != 'function'){
		object.loadStart = function(){
			if(object.debug){
				console.log("Iniciou!");
			}
		};
	}

	if((typeof object.loadEnd) != 'function'){
		object.loadEnd = function(){
			if(object.debug){
				console.log("Terminou!");
			}
		};
	}

	if((typeof object.uploadProgress) != 'function'){
		object.uploadProgress = function(i){
			if(object.debug){
				console.log("Upload Progress: " + i);
			}
		};
	}

	if((typeof object.uploadLoad) != 'function'){
		object.uploadLoad = function(){
			if(object.debug){
				console.log("Upload Realizado!");
			}
		};
	}

	if((typeof object.uploadError) != 'function'){
		object.uploadError = function(){
			if(object.debug){
				console.log("Erro no upload!");
			}
		};
	}

	if((typeof object.error) != 'function'){
		object.error = function(){
			console.log("Erro!");
		};
	}
	
	if((typeof object.abort) != 'function'){
		object.abort = function(){
			this.abort();
		};
	}

	if((typeof object.onAbort) != 'function'){
		object.onAbort = function(){
			console.log("Abortado!");
		};
	}

	if((typeof object.readyStateChange) != 'function'){
		var count0 = 0;
		object.readyStateChange = function(){
			var self = this;
			if(count0 != self.readyState && self.readyState <= 4){
				count0 = self.readyState;
				object.beforeSend(self.readyState);
			}
			if(self.readyState == 4 && self.status == 200){
				var data = null;
				if(self.responseText){
					data = self.responseText;
				}
				if(self.responseXML){
					data = self.responseXML;
				}
				setTimeout(function(){								
					object.success(data);
				}, 500);			
			}
		};
	}

	if(!block){
    	var ajax = false;
	
		if(window.XMLHttpRequest){
			ajax = new XMLHttpRequest();
		}else if(window.ActiveXObject){
	    	try{
	        	ajax = new ActiveXObject("Msxml2.XMLHTTP");
	    	}catch(e){
	        	ajax = new ActiveXObject("Microsoft.XMLHTTP");
	    	}
		}

		ajax.onload = object.load;
		ajax.onloadstart = object.loadStart;
		ajax.onloadend = object.loadEnd;
		ajax.abort = object.abort;
		ajax.onabort = object.onAbort;
		ajax.onerror = object.error;
		ajax.upload.onload = object.uploadLoad;
		ajax.upload.onerror = object.uploadError;

		ajax.onprogress = function(event){
			object.progress(((event.loaded * 100) / event.total));
		};

		var count1 = 0, count2 = 0;
		ajax.upload.onprogress = function(event){
			count2 = (((event.loaded * 100) / event.total).toFixed(2));
			if(count1 != count2){
				count1 = count2;
				object.uploadProgress(count1);				
			}			
	    };
	    
	    ajax.onreadystatechange = object.readyStateChange;

    	if(object.method == 'GET' && (typeof params) != 'object'){
			ajax.open(object.method, object.action + "?" + object.params, object.async);
		    ajax.send(null);
		}else if(object.method == 'POST' || object.method == 'PUT'){
		   	ajax.open(object.method, object.action, object.async);
		   	if((typeof object.params) != 'object'){
		       	ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		    }else{
		    	ajax.setRequestHeader("Cache-Control", "no-cache");
		    }
		    ajax.send(object.params);
		}
    }else{
		if((typeof object.execute) != 'function'){
			object.execute = function(){
		    	AJAX(this);
		    }
		}
    }

    return object;
}
*/