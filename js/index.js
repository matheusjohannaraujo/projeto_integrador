window.addEventListener("load", function(e){

	tiposDeArquivos = [];
	lisSelTipo = document.querySelector("#lisSelTipo");
	modalDivBtn = document.querySelector("#modalDivBtn");
	btnAbrir = document.querySelector("#btnAbrir");
	btnBaixar = document.querySelector("#btnBaixar");
	btnExcluir = document.querySelector("#btnExcluir");

	preload = document.querySelector("#preload");
	lblInpFile = document.querySelector("label[for='inpFile']");
	inpFile = document.querySelector("#inpFile")
	uplSelDisciplina = document.querySelector("#uplSelDisciplina");
	btnGravar = document.querySelector("#btnGravar");
	lisSelDisciplina = document.querySelector("#lisSelDisciplina");
	tbody = document.querySelector("table tbody");

	inpFile.addEventListener("change", quantidadeDeArquivosSelecionados);
	lisSelDisciplina.addEventListener("change", listarArquivoDisciplina);
	lisSelTipo.addEventListener("change", listarArquivoDisciplina);
    btnGravar.addEventListener("click", gravarArquivo);

	listarArquivoDisciplina();
	setInterval(listarArquivoDisciplina, 30000);
	alertaBootstrap("Olá, seja bem-vindo!", 10000);
	
});

function convertBytes(bytes){
	bytes = Number(bytes);
	if(bytes >= 1073741824){
		bytes = (bytes / 1073741824).toFixed(2) + " GB";
	}else if(bytes >= 1048576){
		bytes = (bytes / 1048576).toFixed(2) + " MB";
	}else if(bytes >= 1024){
		bytes = (bytes / 1024).toFixed(2) + " KB";
	}else if(bytes > 1){
		bytes = bytes + ' bytes';
	}else if (bytes == 1){
		bytes = bytes + ' byte';
	}else{
		bytes = '0 byte';
	}
	return bytes;
}

function alertaBootstrap(){
	let value = arguments[0];
	if(value == ""){
		return;
	}
	let time = arguments[1] ? arguments[1] : 60000;
	var id = "alert_" + Math.random().toString(36).substr(2, 9);
	let div = document.createElement("div");
	div.innerHTML = value;
	div.setAttribute("id", id);
	div.setAttribute("class", "alert alert-info");
	div.setAttribute("role", "alert");
	div.style.background = "#e6feff";
	let container = document.querySelector("header");
	container.prepend(div);
	setTimeout(function(){
		let el = document.querySelector(`#${id}`);
		if(el){
			el.remove();
		}
	}, time);
}

function nomeDisciplina(disciplina){
    disciplina = Number(disciplina);
    switch(disciplina){
        case 1:
            disciplina = "Análise Matemática";
            break;
        case 2:
            disciplina = "Processamento de Imagem";
            break;
        case 3:
            disciplina = "Sistemas Operacionais Abertos";
			break;
		case 4:
            disciplina = "Sistemas de Informações Inteligentes";
            break;
        default:
            disciplina = "Análise Matemática";
    }
    return disciplina;
}

function guardarTipoDeArquivo(novoTipo){
	for(let i = 0, j = tiposDeArquivos.length; i < j; i++){
		if(tiposDeArquivos[i] == novoTipo){
			return false;
		}
	}
	tiposDeArquivos.push(novoTipo);
	criarSelectTipo();
	return true;
}

function criarSelectTipo(){
	lisSelTipo.innerHTML = "";
	let option = document.createElement("option");
	option.setAttribute("value", "all");
	option.text = "Tipo - Listar todos";
	lisSelTipo.appendChild(option);
	for(let i = 0, j = tiposDeArquivos.length; i < j; i++){		
		if(tiposDeArquivos[i] != "all"){
			let option = document.createElement("option");
			option.setAttribute("value", tiposDeArquivos[i]);
			option.textContent = "Tipo - " + tiposDeArquivos[i];
			lisSelTipo.appendChild(option);
		}		
	}	
}

function listarArquivoDisciplina(){
	let data = new FormData();
	data.append("listarArquivoDisciplina", lisSelDisciplina.value);
	data.append("listarArquivoTipo", lisSelTipo.value);
	ajax = AJAX();
	ajax.method = "POST";
	ajax.action = "./php/controller.php";
	ajax.params = data;
	ajax.success = function(value){
		tbody.innerHTML = "";
		if(lisSelTipo.value != "all"){
			tiposDeArquivos = [lisSelTipo.value];
		}else{
			tiposDeArquivos = [];
		}		
		try{
			value = JSON.parse(value);
		}catch(e){			
			criarSelectTipo();
			alertaBootstrap(value, 10000);
			return;
		}
		for (let i = 0, j = value.length; i < j; i++) {
			let {id, disciplina, nome, tipo, tamanho, calendario} = value[i];
			guardarTipoDeArquivo(tipo);
			disciplina = nomeDisciplina(disciplina);
			tbody.appendChild(criadorDeTableRow(id, disciplina, nome, tipo, tamanho, calendario));
		}
	};
	ajax.execute();
}

function criadorDeTableRow(id, disciplina, nome, tipo, tamanho, calendario){
	let tr = document.createElement("tr");
	let tdDiciplina = document.createElement("td");
	let tdNome = document.createElement("td");
	let tdTipo = document.createElement("td");
	let tdTamanho = document.createElement("td");
	let tdCalendario = document.createElement("td");

	tdDiciplina.textContent = disciplina;
	tdNome.textContent = nome;
	tdNome.title = "Abrir arquivo";
	tdNome.setAttribute("itemprop", id);
	tdNome.addEventListener("click", function(){
		let nome = this.textContent;
		let id = Number(this.getAttribute("itemprop"));
		this.setAttribute("data-toggle", "modal");
		this.setAttribute("data-target", "#exampleModalCenter");
		modalDivBtn.setAttribute("itemprop", id);

		let title = document.querySelector("#exampleModalCenter #exampleModalLongTitle");
		title.textContent = nome;
		
		let getId = function(self){
			let obj = document.querySelector("#exampleModalCenter .close");
			obj.click();
			return Number(self.parentElement.getAttribute("itemprop"));
		};

		btnAbrir.onclick = function(){
			let id = getId(this);
			abrirArquivo(id);
		};

		btnBaixar.onclick = function(){
			alertaBootstrap("Baixando arquivo.", 5000);
			let id = getId(this);			
			window.open("./php/controller.php?baixarArquivo=" + id, "_blank");
		};

		btnExcluir.onclick = function(){
			let id = getId(this);
			excluirArquivo(id);
		};

	});

	tdTipo.textContent = tipo;
	tdTamanho.textContent = convertBytes(Number(tamanho));
	tdCalendario.textContent = calendario;

	tr.appendChild(tdDiciplina);
	tr.appendChild(tdNome);
	tr.appendChild(tdTipo);
	tr.appendChild(tdTamanho);
	tr.appendChild(tdCalendario);
	return tr;
}

function abrirArquivo(id){
	alertaBootstrap("Abrindo arquivo.", 5000);
	var data = new FormData();
	data.append('abrirArquivo', id);
	ajax = AJAX();
	ajax.method = 'POST';
	ajax.action = './php/controller.php';
	ajax.params = data;
	ajax.success = function(value){		
		alertaBootstrap("Arquivo aberto.", 5000);
	};
	ajax.execute();
}

function excluirArquivo(id){
	alertaBootstrap("Excluindo arquivo.", 5000);
	var data = new FormData();
	data.append('excluirArquivo', id);
	ajax = AJAX();
	ajax.method = 'POST';
	ajax.action = './php/controller.php';
	ajax.params = data;
	ajax.success = function(value){		
		alertaBootstrap(value, 5000);
		listarArquivoDisciplina();		
	};
	ajax.execute();
}

function quantidadeDeArquivosSelecionados(){
	let qtd = inpFile.files.length;
	if(qtd == 1){
		lblInpFile.textContent = "Um arquivo selecionado";
	}else if(qtd > 1){
		lblInpFile.textContent = qtd + " arquivos selecionados";
	}else if(qtd < 1){
		lblInpFile.textContent = "Selecionar arquivos";
	}
}

function gravarArquivo(){
	if(inpFile.files.length > 0){        
		var data = new FormData();
		data.append("disciplina", uplSelDisciplina.value);
		for(var i = 0; i < inpFile.files.length; i++){            
			data.append("arquivo[]", inpFile.files[i]);
		}
		ajax = AJAX();
		ajax.method = 'POST';
		ajax.action = './php/controller.php';
		ajax.params = data;
		ajax.upload.loading = function(i){
			i = Math.floor(i);
			preload.textContent = `${i}%`;
			preload.style.width = `${i}%`;
			if(i <= 100){
				preload.parentElement.style.margin = "10px 0";
				preload.parentElement.style.display = "flex";
			}
		};
		ajax.onload = function(){				
			preload.innerHTML = "Arquivo enviado";
			setTimeout(()=>{					
				inpFile.value="";
				quantidadeDeArquivosSelecionados();
				preload.parentElement.style.display = "none";
			}, 5000);
		};
		ajax.success = function(value){
			try {
				value = JSON.parse(value);
				for (let i = 0, j = value.length; i < j; i++) {
					let {id, disciplina, nome, tipo, tamanho, calendario} = value[i];
					if(Number(id) >= 1){
						disciplina = nomeDisciplina(disciplina);
						tbody.appendChild(criadorDeTableRow(id, disciplina, nome, tipo, tamanho, calendario));
					}else{
						alertaBootstrap("Erro no upload do arquivo: " + nome, 10000);
					}						
				}
			} catch (e) {
				alertaBootstrap("Erro: " + value);
				listarArquivoDisciplina();
			}
		};
		ajax.execute();
	}else{
		alertaBootstrap("Não existem arquivos selecionados.", 10000);
	}
}