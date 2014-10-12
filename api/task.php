<?php
	
	/*
	$db = mysql_connect('sql.free.fr', 'josselintd', 'tia41he4');
	mysql_select_db('josselin_td',$db);
	*/
	
	$db = mysql_connect('localhost', 'root', '');
	mysql_select_db('planificator',$db);
	
	if (!function_exists('http_response_code')) {
        function http_response_code($code = NULL) {
            if ($code !== NULL) {
                switch ($code) {
                    case 100: $text = 'Continue'; break;
                    case 101: $text = 'Switching Protocols'; break;
                    case 200: $text = 'OK'; break;
                    case 201: $text = 'Created'; break;
                    case 202: $text = 'Accepted'; break;
                    case 203: $text = 'Non-Authoritative Information'; break;
                    case 204: $text = 'No Content'; break;
                    case 205: $text = 'Reset Content'; break;
                    case 206: $text = 'Partial Content'; break;
                    case 300: $text = 'Multiple Choices'; break;
                    case 301: $text = 'Moved Permanently'; break;
                    case 302: $text = 'Moved Temporarily'; break;
                    case 303: $text = 'See Other'; break;
                    case 304: $text = 'Not Modified'; break;
                    case 305: $text = 'Use Proxy'; break;
                    case 400: $text = 'Bad Request'; break;
                    case 401: $text = 'Unauthorized'; break;
                    case 402: $text = 'Payment Required'; break;
                    case 403: $text = 'Forbidden'; break;
                    case 404: $text = 'Not Found'; break;
                    case 405: $text = 'Method Not Allowed'; break;
                    case 406: $text = 'Not Acceptable'; break;
                    case 407: $text = 'Proxy Authentication Required'; break;
                    case 408: $text = 'Request Time-out'; break;
                    case 409: $text = 'Conflict'; break;
                    case 410: $text = 'Gone'; break;
                    case 411: $text = 'Length Required'; break;
                    case 412: $text = 'Precondition Failed'; break;
                    case 413: $text = 'Request Entity Too Large'; break;
                    case 414: $text = 'Request-URI Too Large'; break;
                    case 415: $text = 'Unsupported Media Type'; break;
                    case 500: $text = 'Internal Server Error'; break;
                    case 501: $text = 'Not Implemented'; break;
                    case 502: $text = 'Bad Gateway'; break;
                    case 503: $text = 'Service Unavailable'; break;
                    case 504: $text = 'Gateway Time-out'; break;
                    case 505: $text = 'HTTP Version not supported'; break;
                    default:
                        exit('Unknown http status code "' . htmlentities($code) . '"');
                    break;
                }
                $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
                header($protocol . ' ' . $code . ' ' . $text);
                $GLOBALS['http_response_code'] = $code;
            } else {
                $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);
            }
            return $code;
        }
    }
	
	function execute($sql){
		$req = mysql_query($sql);
		if($req) return $req;
		else {
			http_response_code(400);
			die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
		}
	}
	
	function getById($id){
		$sql = "SELECT * FROM planificator_task WHERE id=".$id;
		$raw = execute($sql);
		while($task = mysql_fetch_assoc($req)){
			return jsonOne($task);
		}
		return "";
	}
	
	function jsonOne($task){
		return "{\"id\":".$task['id']
				.", \"title\":\"".$task['title']
				."\", \"comment\":\"".str_replace(array("\r\n", "\r", "\n"), "<br/>", $task['comment'])
				."\", \"start\":\"".$task['start']
				."\", \"end\":\"".$task['end']
				."\", \"repeat\":".$task['srepeat']
				."}";
	}
	
	function jsonAll($raw){
		$retour = '[';
		while($task = mysql_fetch_assoc($raw)){
			$retour.= jsonOne($task);
			$retour.= ",";
		}
		$retour = trim($retour, ",");
		$retour.=']';
		return $retour;
	}
	
	function getAll(){
		$sql = 'SELECT * FROM planificator_task';
		$raw = execute($sql);
		return jsonAll($raw);
	}
	
	function getOne($id){
		return getById($id);
	}
	
	function addOne($title, $comment, $start, $end, $repeat){
		$sql = 'INSERT INTO planificator_task(title, comment, start, end, srepeat) VALUES ("'.$title.'", "'.$comment.'", "'.$start.'", "'.$end.'", '.$repeat.')';
		execute($sql);
		$sql = 'SELECT id FROM planificator_task ORDER BY id LIMIT 1';
		$raw = execute($sql);
		while($id = mysql_fetch_assoc($raw)){
			return '{"id":'.$id['id'].'}';
		}
	}
	
	function editOne($id, $title, $comment, $start, $end, $repeat){
		$sql = 'UPDATE planificator_task SET title="'.$title.'", comment="'.$comment.'", start="'.$start.'", end="'.$end.'", srepeat='.$repeat.' WHERE id='.$id;
		execute($sql);
		return '{"id":'.$id.'}';
	}
	
	function deleteOne($id){
		$sql = 'DELETE FROM planificator_task where id='.$id;
		execute($sql);
		return "";
	}
	
	$method = $_SERVER['REQUEST_METHOD'];
	$id = (isset($_GET['id']) ? $_GET['id'] : -1);
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	
	if($request !== null){
		$title = $request->title;
		$comment = $request->comment;
		$start = $request->start;
		$end = $request->end;
		$repeat = $request->repeat;
	}
	
	$content = '';
	http_response_code(200);
	switch ($method) {
		case 'GET':
			if($id == -1) $content = getAll();
			else $content = getOne($id);
			break;
		case 'POST':
			$content = addOne($title, $comment, $start, $end, $repeat);
			break;
		case 'PUT':
			if($id == -1) http_response_code(400);
			else $content = editOne($id, $title, $comment, $start, $end, $repeat);
			break;
		case 'DELETE':
			if($id == -1) http_response_code(400);
			else deleteOne($id);
			break;
		default:
			http_response_code(405);
			break;
	}
	
	echo $content;
?>