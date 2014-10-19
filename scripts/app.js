var	emptyTask = {
		id:-1,
		title:'',
		comment:'',
		start:'',
		end:'',
		repeat:0,
		editting:false,
		sync:false,
		error:false
	};

function STT(date){
	var split = date.split("-");
	return new Date(split[0], (parseInt(split[1])-1), split[2]);
}
	
angular.module('Planificator', [])
.filter('dts', function(){
	return function(input){
		return input.getFullYear()+" - "+(input.getMonth()+1)+" - "+input.getDate();
	};
})
.controller('RunningTaskCtrl', ["taskService", "scaleService", function(taskService, scaleService){
	var ctrl = this;
	
	taskService.getTasks(function(datas){
		ctrl.tasks = datas;
		ctrl.scale = scaleService.getScale();
	});
	
	ctrl.raw = function(date){
		return STT(date);
	};
	
	ctrl.dismiss = function(task){
		task.editting = false;
	};
	
	ctrl.propose = function(task){
		task.editting = false;
		task.error = false;
		task.sync = true;
		
		taskService.editTask(
			task,
			function(){
				task.sync = false;
			},
			function(){
				task.sync = false;
				task.error = true;
			}
		);
	};
	
	ctrl.delete = function(task){
		task.sync = true;
		taskService.deleteTask(
			task,
			function(){},
			function(){
				task.sync = false;
				task.error = true;
			}
		);
	};
}])
.controller('NewTaskCtrl', ["taskService", function(taskService){
	var ctrl = this;
	ctrl.tasks = [];
	
	ctrl.addTask = function(){
		ctrl.tasks.push($.extend({}, emptyTask, {editting:true}));
	};
	
	ctrl.dismiss = function(task){
		task.editting = false;
	};
	
	ctrl.delete = function(task){
		task.editting = false;
		for(var i = 0, j = ctrl.tasks.length; i<j; i++){
			if(ctrl.tasks[i] === task){
				ctrl.tasks.splice(i, 1);
				break;
			}
		}
	};
	
	ctrl.propose = function(task){
		task.editting = false;
		task.sync = true;
		taskService.addTask(
			task,
			function(){
				task.sync = false;
				for(var x = 0, y = ctrl.tasks.length; x < y; x++){
					if(ctrl.tasks[x].id === task.id){
						ctrl.tasks.splice(x, 1);
						break;
					}
				}
			},
			function(){
				task.sync = false;
				task.error = true;
			}
		);
	}
}])
.directive('task', function(){
	return {
		restrict: 'EA',
		replace:true,
		templateUrl: '/Planificator/directives/task/task.html',
		link : function(scope, element, attrs){
			var date = $(element).find(".datepicker");
			date.datepicker();
			date.datepicker("option", "dateFormat", "yy-mm-dd");
		}
	};
})
.service("scaleService", [function(){
	var scale = [],
		tasks = [];
	this.setTasks = function(tasks){
		this.tasks = tasks;
	};
	this.getScale = function(){
		return scale;
	};
	this.updateScale = function(tasks){
		var start = "3000", end = "0",
			tStart, tEnd, subScale = [];
			
		scale.length = 0;
		
		tasks.forEach(function(task){
			if(task.start < start) start = task.start;
			if(task.end > end) end = task.end;
		});
		
		start = STT(start);
		end = STT(end);
		
		if(start < new Date) start = new Date();
		
		tStart = +start;
		tEnd = +end;
		while(tStart <= tEnd){
			subScale.push(new Date(start.getTime()));
			start.setDate(start.getDate() + 1);
			tStart = +start;
		}
		subScale.forEach(function(item){
			scale.push(item);
		});
		
	};
}])
.service("taskService", ['$http', 'scaleService', function($http, scaleService){
	var tasks = [];
	this.getTasks = function(callback){
		if(tasks.length === 0){
			$http.get("api/task.php")
				.success(function(data){
					data.forEach(function(elem){
						tasks.push($.extend({}, emptyTask, elem));
					});
					scaleService.updateScale(tasks);
					callback(tasks);
				})
				.error(function(data, status, headers, config) {
				});
		} else {
			callback(tasks);
		}
	};
	
	this.getTask = function(id, callback){
		
	};
	
	this.addTask = function(task, success, error){
		$http.post("api/task.php", task)
			.success(function(data){
				task.id = data.id;
				tasks.push(task);
				scaleService.updateScale(tasks);
				success(task);
			})
			.error(function(){
				error(task);
			});
	};
	
	this.editTask = function(task, success, error){
		$http.put("api/task.php?id="+task.id, task)
			.success(function(data){
				scaleService.updateScale(tasks);
				success(task);
			})
			.error(function(){
				error(task);
			});
	};
	
	this.deleteTask = function(task, success, error){
		$http.delete("api/task.php?id="+task.id)
			.success(function(data){
				for(var x = 0, y = tasks.length; x < y; x++){
					if(tasks[x].id === task.id){
						tasks.splice(x, 1);
						break;
					}
				}
				scaleService.updateScale(tasks);
				
				success();
			})
			.error(function(data){
				error();
			});
	};
}]);
;