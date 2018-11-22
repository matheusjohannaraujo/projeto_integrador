<?php

require_once "config.php";

if(!empty($_REQUEST) || !empty($_FILES)){

    if (($disciplina = $_REQUEST["disciplina"] ?? false) && ($arquivos = $_FILES["arquivo"] ?? false)) {
        exit(gravarArquivo($disciplina, $arquivos));
    }

    if(($disciplina = $_REQUEST['listarArquivoDisciplina'] ?? false) && ($tipo = $_REQUEST['listarArquivoTipo'] ?? false)){
        exit(listarArquivoDisciplina($disciplina, $tipo));
    }

    if (($id = $_REQUEST["abrirArquivo"] ?? false)) {
        abrirArquivo($id);
        exit;
    }

    if (($id = $_REQUEST["baixarArquivo"] ?? false)) {
        baixarArquivo($id);
        exit;
    }

    if(($id = $_REQUEST['excluirArquivo'] ?? false)){
        exit(excluirArquivo($id));
    }
    
}