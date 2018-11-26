<?php

$arq = ".htaccess";
if(!file_exists($arq)){
    $configRW = "php_value memory_limit '10000M'
php_value post_max_size '10000M'
php_value upload_max_filesize '10000M'
php_value set_time_limit 10000
php_value max_execution_time 10000
php_value default_socket_timeout 10000
php_value max_input_time 10000
php_value max_input_vars 10000
php_value max_file_uploads 10000";
    //max_allowed_packet = 20480M - MySQL > my.ini
    file_put_contents($arq, $configRW);
}

date_default_timezone_set('America/Sao_Paulo');

define("DB_NAME", "db_projetor_integrador");
define("TB_NAME", "tb_arquivo");

function dbAccess() {
	try {		
		if (($pdo = new PDO("mysql:host=localhost;port=3306;dbname=", "root", "")) != null) {
			$pdo->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
            $pdo->query("USE " . DB_NAME);
            $pdo->query("CREATE TABLE IF NOT EXISTS " . TB_NAME . " (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, disciplina INT NOT NULL, nome TEXT NOT NULL, tipo TEXT NOT NULL, tamanho BIGINT NOT NULL, binario LONGBLOB NOT NULL, calendario TEXT NOT NULL) ENGINE = MyISAM CHARSET=utf8 COLLATE utf8_unicode_ci");
			$pdo->exec("SET CHARACTER SET utf8");
			$pdo->exec("SET GLOBAL max_allowed_packet=1895825408");
			$pdo->setAttribute(PDO::ATTR_TIMEOUT, 300000);
			$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
			$pdo->setAttribute(PDO::ATTR_PERSISTENT, true);
			return $pdo;
		}
	} catch (Exception $e) {
        exit("Erro ao conectar com o banco.");
	}
	return false;
}

function fileEncodeBase64($path, $del = false){
    if(file_exists($path) && is_file($path)){
        $newName = pathinfo($path)["dirname"] . DIRECTORY_SEPARATOR . "enc_" . uniqid() . "." .pathinfo($path)["extension"];
        $fp = fopen($newName, "wb");
        foreach (file($path) as $key => $value) {
            fwrite($fp, base64_encode($value) . "\r\n");
        }
        fclose($fp);
        if($del){
            if(unlink($path)){
                if(rename($newName, $path)){
                    $newName = $path;
                }                
            }            
        }
        return $newName;
    }
    return false;
}

function fileDecodeBase64($path, $del = false){
    if(file_exists($path) && is_file($path)){
        $newName = pathinfo($path)["dirname"] . DIRECTORY_SEPARATOR . "dec_" . uniqid() . "." .pathinfo($path)["extension"];
        $fp = fopen($newName, "wb");
        foreach (file($path) as $key => $value) {
            fwrite($fp, base64_decode($value));
        }
        fclose($fp);
        if($del){
            if(unlink($path)){
                if(rename($newName, $path)){
                    $newName = $path;
                }                
            }            
        }
        return $newName;
    }
    return false;    
}

function gravarArquivo($disciplina, $arquivos){
    $pdo = dbAccess();
    $disciplina = (int) $disciplina;
    $array = [];
    for ($i = 0, $j = count($arquivos['tmp_name']); $i < $j; $i++) {
        $error = $arquivos['error'][$i];            
        if ($error == 0) {
            $name = $arquivos['name'][$i];
            $type = pathinfo($name)["extension"];
            $tmp_name = $arquivos['tmp_name'][$i];                
            $size = $arquivos['size'][$i];
            $calendar = date('d/m/Y H:i:s');
            fileEncodeBase64($tmp_name, true);
            $stmt = $pdo->prepare("INSERT INTO " . TB_NAME . " VALUES (NULL, :disciplina, :nome, :tipo, :tamanho, :binario, :calendario)");
            $stmt->bindValue(":disciplina", $disciplina);
            $stmt->bindValue(":nome", $name);
            $stmt->bindValue(":tipo", $type);
            $stmt->bindValue(":tamanho", $size);
            $fp = fopen($tmp_name, 'rb');
            $stmt->bindParam(":binario", $fp, PDO::PARAM_LOB);
            $stmt->bindValue(":calendario", $calendar);
            $pdo->beginTransaction();
            $stmt->execute();
            $id_insert = $pdo->lastInsertId();
            $pdo->commit();
            if($stmt->rowCount() == 1){
                $array[] = ["id" => $id_insert, "disciplina" => $disciplina, "nome" => $name, "tipo" => $type, "tamanho" => $size, "calendario" => $calendar];
            }else{
                $array[] = ["id" => -1, "nome" => $name];
            }               
        }						
    }
    return json_encode($array);
}

function listarArquivoDisciplina($disciplina, $tipo){
    $pdo = dbAccess();
    $disciplina = (int) $disciplina;
    $tipo = (string) $tipo;
    if($disciplina > 0 && $disciplina < 5){
        $disciplina = " WHERE disciplina = '" . $disciplina . "'";
    }else{
        $disciplina = "";
    }
    if($tipo != "all" && $tipo != ""){
        if($disciplina == ""){
            $disciplina = " WHERE tipo = '" . $tipo . "'";
        }else{
            $disciplina .= " AND tipo = '" . $tipo . "'";
        }
    }
    $stmt = $pdo->prepare("SELECT id, disciplina, nome, tipo, tamanho, calendario FROM " . TB_NAME . $disciplina);
    $stmt->execute();
    if($stmt->rowCount() > 0){
        return json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    return false;
}

function abrirArquivo($id){
    $pdo = dbAccess();
    $stmt = $pdo->prepare("SELECT nome, tipo, binario FROM " . TB_NAME . " WHERE id = :id");
    $stmt->bindValue(":id", $id);
    $stmt->execute();
    if($stmt->rowCount() == 1){
        $dir = "tmp_files/";
        if(!file_exists($dir) || !is_dir($dir)){
            mkdir($dir, 777);
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $nome = $row["nome"];
        file_put_contents($dir . $nome, $row["binario"]);
        fileDecodeBase64($dir . $nome, true);
        shell_exec("cd " . $dir . " & \"" . $nome . "\"");
        sleep(1);
        $fp = fopen($dir . $nome, "a+"); 
        if (flock($fp, LOCK_EX)) {
            fclose($fp);
            sleep(20);
            unlink($dir . $nome);
        } else {
            fclose($fp);
        }
    }
}

function baixarArquivo($id){
    $pdo = dbAccess();
    $stmt = $pdo->prepare("SELECT nome, tamanho, binario FROM " . TB_NAME . " WHERE id = :id");
    $stmt->bindValue(":id", $id);
    $stmt->execute();
    if($stmt->rowCount() == 1){
        $dir = "tmp_files/";
        if(!file_exists($dir) || !is_dir($dir)){
            mkdir($dir, 777);
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $nome = $row["nome"];
        $tamanho = $row["tamanho"];
        file_put_contents($dir . $nome, $row["binario"]);
        fileDecodeBase64($dir . $nome, true);            
        header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename=' . $nome);
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		header('Content-Length: ' . $tamanho);
		ob_clean();
		flush();
        $download_rate = 8192;
        $fp = fopen($dir . $nome, "rb"); 
		while (!feof($fp)) {
			print fread($fp, $download_rate);
			flush();
		}
		fclose($fp);
		unset($fp);            
        sleep(1);
        $fp = fopen($dir . $nome, "a+"); 
        if (flock($fp, LOCK_EX)) {
            fclose($fp);
            sleep(20);
            unlink($dir . $nome);
        } else {
            fclose($fp);
        }
    }
}

function excluirArquivo($id){
    $pdo = dbAccess();
    $stmt = $pdo->prepare("DELETE FROM " . TB_NAME . " WHERE id = :id");
    $stmt->bindValue(":id", $id);
    $stmt->execute();
    if($stmt->rowCount() > 0){
        return "Arquivo deletado.";
    }
    return "Erro ao excluir";
}